import type { InjectionKey, Ref } from 'vue';

export type RouterState = {
  path: string;
  nest: string;
  active?: boolean;

  /**
   * The canonical, complete set of params 'within' this route.
   */
  params?: Record<string, string>;

  /**
   * As {@link RouterState#params}, but filtered if/when the user has set "retain-on-params-change".
   */
  keyParams?: Record<string, string>;

  paramsBase?: Record<string, string>;

  matched?: boolean;
};

export const routerStateKey = Symbol('routerState') as InjectionKey<Ref<RouterState>>;
export const defaultRouterState = Object.freeze({ path: '', nest: '/' } as RouterState);
