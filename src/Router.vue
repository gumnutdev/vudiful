<script lang="ts" setup>
import { provide, ref, watchEffect } from 'vue';
import { defaultRouterState, type RouterState, routerStateKey } from './keys.ts';
import { ensureTrailingSlash } from './helpers.ts';

const r = ref<RouterState>(defaultRouterState);

watchEffect((cleanup) => {
  const c = new AbortController();
  cleanup(() => c.abort());

  const update = () => {
    r.value = { path: ensureTrailingSlash(window.location.pathname), nest: '/' };
  };
  update();
  window.addEventListener('popstate', update, { signal: c.signal });
});

provide(routerStateKey, r);
</script>

<template>
  <slot></slot>
</template>
