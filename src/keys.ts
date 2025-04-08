import type { InjectionKey, Ref } from 'vue';

export type RouterState = {
  path: string;
  nest: string;
  active?: boolean;
};

export const routerStateKey = Symbol('routerState') as InjectionKey<Ref<RouterState>>;

export const defaultRouterState = Object.freeze({ path: '', nest: '' });
