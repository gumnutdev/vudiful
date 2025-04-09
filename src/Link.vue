<script lang="ts" setup>
import { computed, inject } from 'vue';
import { routerStateKey } from './keys';
import { hrefIsRemote } from './helpers';

const props = defineProps<{
  href?: string;

  /**
   * If specified, roots this href at the location where we found the named key (like ":key" or "?key").
   */
  root?: string;

  // activeClass?: string;
  // nestedClass?: string;
  // paramRoot?: string;
}>();

const state = inject(routerStateKey);

const href = computed(() => {
  if (!state?.value) {
    return '';
  }

  let base: string;
  if (props.root) {
    const paramBase = state.value.paramsBase?.[props.root];
    if (paramBase === undefined) {
      return '/';
    }
    base = paramBase;
  } else {
    base = state.value.nest;
  }

  const u = new URL('http://localhost'); // use URL for its computing ability
  u.pathname = base + props.href;

  return u.pathname;
});

const onClick = (e: MouseEvent) => {
  if (hrefIsRemote(href.value) || e.metaKey || e.altKey || e.shiftKey) {
    return;
  }
  e.preventDefault();

  window.history.pushState(null, '', href.value);
  window.dispatchEvent(new CustomEvent('popstate')); // trigger our own listener
  // TODO
};
</script>

<template>
  <a :href="href" @click="onClick"><slot></slot></a>
</template>
