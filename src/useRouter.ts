import { inject } from 'vue';
import { routerParamsKey } from './shared.ts';
// import { reactiveComputed } from '@vueuse/core';

export function useRouter() {
  const parentParams = inject(routerParamsKey, {});

  // const params = reactiveComputed(() => {
  //   const out: Record<string, string> = {};

  //   for (const k in parentParams) {
  //     out[k] = parentParams[k].value;
  //   }

  //   return out;
  // });

  // const paramBase = reactiveComputed(() => {
  //   const out: Record<string, string> = {};

  //   for (const k in parentParams) {
  //     out[k] = parentParams[k].base;
  //   }

  //   return out;
  // });

  const params = {};
  const paramBase = {};

  return { params, paramBase };
}
