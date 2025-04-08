<script lang="ts" setup>
import { computed, inject, provide } from 'vue';
import { defaultRouterState, type RouterState, routerStateKey } from './keys';

const props = defineProps<{
  path?: string;
}>();

const state = inject(routerStateKey);

function matchPath(propsPath: string, routerPath: string): RouterState {
  if (!routerPath.endsWith('/')) {
    return defaultRouterState;
  }

  // TODO: hasChildren?
  if (!propsPath.startsWith('/')) {
    propsPath = `/${propsPath}`;
  }
  if (!propsPath.endsWith('/')) {
    propsPath += '/';
  }

  if (!routerPath.startsWith(propsPath)) {
    return defaultRouterState;
  }

  return {
    path: routerPath.substring(propsPath.length - 1),
    nest: routerPath.substring(0, propsPath.length),
    active: true,
  };
}

const match = computed<RouterState>(() => {
  const s = state?.value ?? defaultRouterState;
  return matchPath(props.path || '', s.path);
});

provide(routerStateKey, match);
</script>

<template>
  <div style="border: 2px solid blue">
    Route2 active={{ match.active }} routerPath={{ match.path }} props.path={{ props.path }}

    <template v-if="match.active">
      ACTIVE
      <div style="border: 2px solid red">
        <slot></slot></div
    ></template>
    <template v-else>
      <!-- not active -->
    </template>
  </div>
</template>
