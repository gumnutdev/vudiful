import { computed, effect, inject, reactive, toValue, type MaybeRef } from 'vue';
import { routerStateKey } from './keys.ts';
import { determineClass, gotoHref, mergeHref } from './helpers.ts';

export const useParams = () => {
  const state = inject(routerStateKey);

  return computed(() => {
    return state?.value.params ?? {};
  });
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

export const useBindLink = (href: MaybeRef<string>, arg?: LinkArg): BindLink => {
  const state = inject(routerStateKey);

  const computedHref = computed(() => {
    const partialHref = toValue(href);
    const partialRoot = toValue(arg?.root ?? undefined);
    return mergeHref({
      state: state?.value,
      href: partialHref,
      root: partialRoot,
    });
  });

  const className = computed(() =>
    determineClass({ state: state?.value, ...arg, href: computedHref }),
  );

  const r = reactive<BindLink>({
    onClick: gotoHref.bind(null, computedHref),
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
