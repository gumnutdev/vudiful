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

export const routeStateKey = Symbol('vutiful-route-state') as InjectionKey<Reactive<RouteState>>;
