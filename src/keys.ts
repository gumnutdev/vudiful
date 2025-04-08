import type { InjectionKey, Ref } from 'vue';

export type RouterState = {
  path: string;
  nest: string;
  active?: boolean;

  matched?: boolean;
};

export const routerStateKey = Symbol('routerState') as InjectionKey<Ref<RouterState>>;

export const defaultRouterState = Object.freeze({ path: '', nest: '' } as RouterState);

export type ConnectToParentRoute = (signal: AbortSignal) => void;
export const connectToParentRouteKey = Symbol('parentRoute') as InjectionKey<ConnectToParentRoute>;
