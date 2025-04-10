<script lang="ts" setup>
import { computed, inject } from 'vue';
import { routeStateKey } from './keys';
import { determineClass, gotoResolvedHref, mergeHref } from './helpers';

const props = defineProps<{
  href?: string;
  root?: string;
  activeClass?: string;
  nestedClass?: string;
}>();

const state = inject(routeStateKey);
const href = computed(() => mergeHref({ state, ...props }));
const className = computed(() => determineClass({ state, ...props, href }));
const clickHandler = gotoResolvedHref.bind(null, href);
</script>

<template>
  <a :href="href" :class="className" @click="clickHandler"><slot></slot></a>
</template>
