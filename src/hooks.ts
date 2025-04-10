import { computed, effect, inject, reactive, shallowReactive, toValue, type MaybeRef } from 'vue';
import { routeStateKey } from './lib/keys.ts';
import { determineClass, gotoResolvedHref, mergeHref } from './lib/helpers.ts';

/**
 * Retrieves the reactive params under this router path.
 * Basically reveals all params specified in router parts like "/:foo/:bar/".
 */
export const useParams = (): Readonly<Record<string, string>> => {
  const state = inject(routeStateKey);

  const out = shallowReactive<Record<string, string>>({});

  effect(() => {
    for (const k in out) {
      delete out[k];
    }
    Object.assign(out, state?.params);
  });

  return out;
};

export type LinkArg = {
  /**
   * If specified, roots this href at the location where we found the named key (like ":key" or "?key").
   */
  root?: MaybeRef<string>;

  /**
   * If specified, used when the browser is exactly on this page.
   */
  activeClass?: string;

  /**
   * If specified, used when the browser is on or underneath this page.
   */
  nestedClass?: string;
};

export type BindLink = {
  href?: string;
  class?: string;
  onClick(e: MouseEvent): void;
};

/**
 * Provides enough to bind to a regular `<a>` to create a router-aware link.
 *
 * Use like `<a v-bind="useBindLink('path-to-thing')>"`.
 */
export const useBindLink = (href: MaybeRef<string>, arg?: LinkArg): BindLink => {
  const state = inject(routeStateKey);

  const computedHref = computed(() => {
    const partialHref = toValue(href);
    const partialRoot = toValue(arg?.root ?? undefined);
    return mergeHref({
      state,
      href: partialHref,
      root: partialRoot,
    });
  });

  const className = computed(() => determineClass({ state, ...arg, href: computedHref }));

  const r = reactive<BindLink>({
    onClick: gotoResolvedHref.bind(null, computedHref),
  });

  effect(() => {
    if (computedHref.value !== undefined) {
      r.href = computedHref.value;
    } else {
      delete r.href;
    }
    if (className.value !== undefined) {
      r.class = className.value;
    } else {
      delete r.class;
    }
  });

  return r;
};

export type GotoHrefFunc = (href: MaybeRef<string>, arg?: { root?: string }) => void;

/**
 * Creates a helper function which itself changes the browser's location.
 * Use it later inside a `@click` handler or similar.
 *
 * This must be obtianed as part of setup, because we inject the current router state.
 */
export const useGotoHref = (): GotoHrefFunc => {
  const state = inject(routeStateKey);

  return (href: MaybeRef<string>, arg?: { root?: string }) => {
    const out = mergeHref({ href: toValue(href), root: arg?.root, state });
    gotoResolvedHref(out);
  };
};
