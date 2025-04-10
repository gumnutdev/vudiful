<script lang="ts" setup>
import { computed, type Component } from 'vue';
import EmptyComponent from './EmptyComponent.vue';

const props = defineProps<{
  display?: boolean;
  component?: Component;
}>();

const component = computed(() => (props.display && props.component) || EmptyComponent);
</script>

<template>
  <component>
    <slot></slot>
  </component>
</template>
