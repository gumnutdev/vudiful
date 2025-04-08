<script lang="ts" setup>
import { computed, inject } from 'vue';
import { routerStateKey } from './keys';

const props = defineProps<{
  href?: string;
  // activeClass?: string;
  // nestedClass?: string;
  // paramRoot?: string;
}>();

const state = inject(routerStateKey);

const href = computed(() => {
  if (!state?.value) {
    return '';
  }

  const u = new URL('http://localhost'); // use URL for its computing ability
  u.pathname = state?.value.nest + props.href;

  return u.pathname;
});

const onClick = (e: MouseEvent) => {
  e.preventDefault();

  window.history.pushState(null, '', href.value);
  window.dispatchEvent(new CustomEvent('popstate')); // trigger our own listener
  // TODO
};
</script>

<template>
  <a :href="href" @click="onClick"><slot></slot></a>
</template>
