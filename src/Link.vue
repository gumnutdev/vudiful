<script lang="ts" setup>
import { computed, inject } from 'vue';
import { routerStateKey } from './keys';
import { determineClass, gotoHref, mergeHref } from './helpers';

const props = defineProps<{
  href?: string;

  /**
   * If specified, roots this href at the location where we found the named key (like ":key" or "?key").
   */
  root?: string;

  /**
   * If specified, used when the browser is exactly on this page.
   */
  activeClass?: string;

  /**
   * If specified, used when the browser is on or underneath this page.
   */
  nestedClass?: string;
}>();

const state = inject(routerStateKey);
const href = computed(() => mergeHref({ state: state?.value, ...props }));
const className = computed(() => determineClass({ state: state?.value, ...props, href }));
const clickHandler = gotoHref.bind(null, href);
</script>

<template>
  <a :href="href" :class="className" @click="clickHandler"><slot></slot></a>
</template>
