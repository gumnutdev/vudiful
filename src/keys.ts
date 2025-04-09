import { computed, inject, type InjectionKey, type Ref } from 'vue';

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

  matched?: boolean;
};

export const routerStateKey = Symbol('routerState') as InjectionKey<Ref<RouterState>>;

export const defaultRouterState = Object.freeze({ path: '', nest: '' } as RouterState);

export type ConnectToParentRoute = (signal: AbortSignal) => void;
export const connectToParentRouteKey = Symbol('parentRoute') as InjectionKey<ConnectToParentRoute>;

export const useParams = () => {
  const state = inject(routerStateKey);

  return computed(() => {
    return state?.value.params ?? {};
  });
};
