<script lang="ts" setup>
import { provide, reactive, watchEffect } from 'vue';
import { prouteStateKey, SomeState } from './keys.ts';
import { ensureTrailingSlash } from './helpers.ts';

const state = reactive({
  children: new Set<SomeState>(),
  path: '',
  nest: '/',
});
provide(prouteStateKey, state);

watchEffect((cleanup) => {
  const c = new AbortController();
  cleanup(() => c.abort());

  const update = () => {
    console.info('got new href', ensureTrailingSlash(window.location.pathname));
    state.path = ensureTrailingSlash(window.location.pathname);
  };
  update();
  window.addEventListener('popstate', update, { signal: c.signal });
});

watchEffect(() => {
  const children = [...state.children];
  for (const c of children) {
    c.display = c.match;
  }
});
</script>

<template>
  <slot></slot>
</template>
