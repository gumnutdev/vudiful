<script lang="ts" setup>
import { type Component, computed, inject, provide } from 'vue';
import { defaultRouterState, type RouterState, routerStateKey } from './keys';
import { matchPath } from './helpers';

const props = defineProps<{
  path?: string;
  component?: Component;
  matchFirst?: boolean;
  retainOnParamsChange?: boolean;
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
  if (!out.active) {
    return out;
  }

  if (s.matched === false) {
    // if this is `matchFirst`, s.matched will be explicitly false; we win, set true!
    s.matched = true;
  }

  // for our descendants: the false tells someone to try to win (vs. undefined)
  if (props.matchFirst) {
    out.matched = false;
  }

  // this must occur before out.params below
  if (props.retainOnParamsChange) {
    out.keyParams = {};
  } else if (out.params) {
    out.keyParams = Object.assign({}, state.value.keyParams, out.params);
  } else {
    out.keyParams = state.value.keyParams;
  }

  // finally set global params
  if (out.params) {
    out.params = Object.assign({}, state.value.params, out.params);
  } else {
    out.params = state.value.params;
  }

  // ... and base (links)
  if (out.paramsBase) {
    const matchedParamsBase = out.paramsBase;
    out.paramsBase = Object.assign({}, state.value.paramsBase);

    for (const key in matchedParamsBase) {
      out.paramsBase[key] = state.value.nest + matchedParamsBase[key].substring(1);
    }
  } else {
    out.paramsBase = state.value.paramsBase;
  }

  out.nest = state.value.nest + out.nest.substring(1);
  return out;
});

provide(routerStateKey, match);

const key = computed(() => {
  const kp = match.value.keyParams;
  return kp
    ? Object.entries(kp)
        .map(([key, value]) => `${key}=${value}`)
        .join(',')
    : '';
});

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
  <template v-if="match.active">
    <template v-if="props.component">
      <props.component :key="key">
        <slot></slot>
      </props.component>
    </template>
    <template v-else>
      <slot :key="key"></slot>
    </template>
  </template>
</template>
