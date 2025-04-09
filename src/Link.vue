<script lang="ts" setup>
import { computed, inject } from 'vue';
import { routerStateKey } from './keys';
import { determineClass, gotoResolvedHref, mergeHref } from './helpers';

const props = defineProps<{
  href?: string;
  root?: string;
  activeClass?: string;
  nestedClass?: string;
}>();

const state = inject(routerStateKey);
const href = computed(() => mergeHref({ state: state?.value, ...props }));
const className = computed(() => determineClass({ state: state?.value, ...props, href }));
const clickHandler = gotoResolvedHref.bind(null, href);
</script>

<template>
  <a :href="href" :class="className" @click="clickHandler"><slot></slot></a>
</template>

<!--
Stuff about Link -->
