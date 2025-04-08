<!-- Some comment -->
<script lang="ts" setup>
/**
 * Some comment inside
 */

import { provide, ref, watchEffect } from 'vue';
import {
  ensureTrailingSlash,
  mangeRouteChildren,
  pathnameKey,
  routerParamsKey,
  routerUrlKey,
} from './shared.ts';

const route = ref(ensureTrailingSlash(window.location.pathname));
const children = mangeRouteChildren();

provide(pathnameKey, route);
provide(routerUrlKey, '/');
provide(routerParamsKey, {});

watchEffect(() => {
  for (const c of children) {
    c(route.value);
  }
});

watchEffect((cleanup) => {
  const c = new AbortController();
  cleanup(() => c.abort());

  window.addEventListener(
    'popstate',
    () => (route.value = ensureTrailingSlash(window.location.pathname)),
    { signal: c.signal },
  );
});
</script>

<template>
  <slot></slot>
</template>
