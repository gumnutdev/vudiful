<script lang="ts" setup>
import { computed, inject } from 'vue';
import { routerStateKey } from './keys';
import { gotoHref, mergeHref } from './helpers';

const props = defineProps<{
  href?: string;

  /**
   * If specified, roots this href at the location where we found the named key (like ":key" or "?key").
   */
  root?: string;
}>();

const state = inject(routerStateKey);

const href = computed(() =>
  mergeHref({
    state: state?.value,
    href: props.href,
    root: props.root,
  }),
);

const clickHandler = gotoHref.bind(null, href);
</script>

<template>
  <a :href="href" @click="clickHandler"><slot></slot></a>
</template>
