<script lang="ts" setup>
import { provide, reactive, watchEffect } from 'vue';
import { PRouteState, prouteStateKey, SomeState } from './keys.ts';
import { applyDisplayMatch, ensureTrailingSlash } from './helpers.ts';

const props = defineProps<{
  matchAll?: boolean;
}>();

const state = reactive<PRouteState>({
  children: new Set<SomeState>(),
  path: '',
  nest: '/',
  keyParams: {},
  params: {},
  paramsBase: {},
});
provide(prouteStateKey, state);

watchEffect((cleanup) => {
  const c = new AbortController();
  cleanup(() => c.abort());

  const update = () => {
    state.path = ensureTrailingSlash(window.location.pathname);
  };
  update();
  window.addEventListener('popstate', update, { signal: c.signal });
});

watchEffect(() => {
  applyDisplayMatch([...state.children], props.matchAll);
});
</script>

<template>
  <slot></slot>
</template>
