<script lang="ts" setup>
import { provide, reactive, watchEffect } from 'vue';
import { type RouteState, routeStateKey, type RouteChildState } from '../lib/keys.ts';
import { applyDisplayMatch, ensureTrailingSlash } from '../lib/helpers.ts';

const props = defineProps<{
  matchAll?: boolean;
}>();

const state = reactive<RouteState>({
  children: new Set<RouteChildState>(),
  path: '',
  nest: '/',
  keyParams: {},
  params: {},
  paramsBase: {},
});
provide(routeStateKey, state);

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
