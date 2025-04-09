import { computed, effect, inject, reactive, toValue, type MaybeRef } from 'vue';
import { routerStateKey } from './keys.ts';
import { gotoHref, mergeHref } from './helpers.ts';

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
};

export type BindLink = {
  href?: string;
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

  const r = reactive({
    href: computedHref.value,
    onClick: gotoHref.bind(null, computedHref),
  });

  effect(() => {
    r.href = computedHref.value;
  });

  return r;
};
