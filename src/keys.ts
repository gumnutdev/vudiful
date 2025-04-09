import type { InjectionKey, Reactive, Ref, ShallowReactive } from 'vue';

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

  matched?: Reactive<Set<MatchState>>;
  poke?: Ref<number>;
};

export type MatchState = {
  matched?: boolean;
  display: boolean;
};

export const routerStateKey = Symbol('routerState') as InjectionKey<Ref<RouterState>>;
export const defaultRouterState = Object.freeze({ path: '', nest: '/' } as RouterState);

export type SomeState = {
  r: number;
};

export type Container = {
  children?: Reactive<Set<SomeState>>;
};

export const prouteStateKey = Symbol('proute') as InjectionKey<Container>;
