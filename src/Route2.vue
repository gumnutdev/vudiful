<script lang="ts" setup>
import { computed, inject, provide } from 'vue';
import { defaultRouterState, type RouterState, routerStateKey } from './keys';
import { matchPath } from './helpers';

const props = defineProps<{
  path?: string;

  /**
   * If true, will only match the first direct descendant `<Route>`, not all valid ones.
   */
  matchFirst?: boolean;
}>();

const state = inject(routerStateKey);

const match = computed<RouterState>(() => {
  if (!state?.value) {
    return defaultRouterState;
  }

  const s = state.value;
  if (s.matched) {
    // an earlier peer matched, don't even check
    return defaultRouterState;
  }

  const out = matchPath(props.path || '', s.path);

  if (out.active && s.matched === false) {
    // if this is `matchFirst`, s.matched will be explicitly false; we win, set true!
    s.matched = true;
  }

  // for our descendants: the false tells someone to try to win (vs. undefined)
  if (props.matchFirst) {
    out.matched = false;
  }
  return out;
});

provide(routerStateKey, match);

// TODO: It's not clear why we need to connect to parent - reasses later?

// const connectToParentRoute = inject(connectToParentRouteKey, () => {});

// const c = new AbortController();
// onMounted(() => {
//   connectToParentRoute?.(c.signal);
// });
// onUnmounted(() => c.abort());

// let childCount = 0;
// provide(connectToParentRouteKey, (signal) => {
//   if (signal.aborted) {
//     return;
//   }
//   childCount++;
//   console.debug('route', props.path, 'got childCount', childCount);
//   signal.addEventListener('abort', () => {
//     --childCount;
//     console.debug('route', props.path, 'dec childCount', childCount);
//   });
// });
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
