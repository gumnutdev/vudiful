import type { InjectionKey, Reactive, Ref, ShallowReactive } from 'vue';

export type MatchResult = {
  path: string;
  nest: string;
  matched: boolean;

  /**
   * The canonical, complete set of params 'within' this route.
   */
  params?: Record<string, string>;

  /**
   * As {@link RouterState#params}, but filtered if/when the user has set "retain-on-params-change".
   */
  keyParams?: Record<string, string>;

  /**
   * Where the key params are positioned here.
   */
  paramsBase?: Record<string, string>;
};

export const defaultMatchResult: MatchResult = Object.freeze({
  path: '',
  nest: '',
  matched: false,
});

export type MatchState = {
  matched?: boolean;
  display: boolean;
};

export type SomeState = {
  match?: boolean;
  pathMatch?: boolean;

  display?: boolean;

  hasExcessPath?: boolean;
};

export type PRouteState = {
  path: string;
  nest: string;
  children: Set<SomeState>;
};

export const prouteStateKey = Symbol('proute') as InjectionKey<Reactive<PRouteState>>;
