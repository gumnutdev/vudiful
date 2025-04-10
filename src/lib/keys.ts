import type { InjectionKey, Reactive } from 'vue';

export type RouteChildState = {
  match?: boolean;
  pathMatch?: boolean;

  /**
   * Controlled by the parent: should this display.
   */
  display?: boolean;
};

export type RouteState = {
  path: string;
  nest: string;
  children: Set<RouteChildState>;

  params: Record<string, string>;
  keyParams: Record<string, string>;
  paramsBase: Record<string, string>;
};

// TODO: the vite/vue build dance creates this many times :cry:
export const routeStateKey = //
  Symbol.for('__vutiful-route-state__') as InjectionKey<Reactive<RouteState>>;
