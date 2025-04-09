<script lang="ts" setup>
import {
  type Component,
  computed,
  effect,
  inject,
  provide,
  reactive,
  Reactive,
  ref,
  shallowReactive,
  watchEffect,
} from 'vue';
import { defaultRouterState, MatchState, type RouterState, routerStateKey } from './keys';
import { matchPath } from './helpers';

const props = defineProps<{
  path?: string;
  component?: Component;
  matchFirst?: boolean;
  retainOnParamsChange?: boolean;

  comment?: string;

  // XXX is this even possible
  subMatch?: boolean;
}>();

const parentState = inject(routerStateKey);

const selfReactive = reactive<MatchState>({
  display: false, // configured by parent
  matched: undefined, // we announce this
});

let controller: AbortController = new AbortController();
effect(() => {
  controller.abort();
  controller = new AbortController();

  const s = parentState?.value;
  if (!s?.matched) {
    return; // we're not in a match subtree
  }

  // if our parent provided `matched`, it's an asynchronous matcher (aren't we all?)
  s.matched.add(selfReactive);
  s.poke!.value++;
  controller.signal.addEventListener('abort', () => {
    s.matched!.delete(selfReactive);
    s.poke!.value++;
  });
});

const ourState = computed<RouterState>(() => {
  if (!parentState?.value) {
    return defaultRouterState;
  }
  const s = parentState.value;

  const matchOut = matchPath(props.path || '', s.path);

  // we know whether we're displayed immediately: resolve here
  if (matchOut.active) {
  }
  if (props.subMatch) {
    // TODO: resolve based on ... ???
    selfReactive.matched; // force read
  } else {
    selfReactive.matched = matchOut.active ?? false;
    selfReactive.matched; // force read
    // console.info('setting selfReactive.matched', selfReactive.matched, 'for', {
    //   comment: props.comment,
    //   path: props.path,
    // });
  }

  if (!matchOut.active) {
    return defaultRouterState;
  }

  matchOut.nest = s.nest + matchOut.nest.substring(1);
  matchOut.matched = reactive<Set<MatchState>>(new Set());
  matchOut.poke = ref(0);
  console.info('returning new reactive set for', {
    comment: props.comment,
    path: props.path,
    m: matchOut.matched,
  });
  return matchOut;
});

//   // this must occur before out.params below
//   if (props.retainOnParamsChange) {
//     out.keyParams = {};
//   } else if (out.params) {
//     out.keyParams = Object.assign({}, state.value.keyParams, out.params);
//   } else {
//     out.keyParams = state.value.keyParams;
//   }

//   // finally set global params
//   if (out.params) {
//     out.params = Object.assign({}, state.value.params, out.params);
//   } else {
//     out.params = state.value.params;
//   }

//   // ... and base (links)
//   if (out.paramsBase) {
//     const matchedParamsBase = out.paramsBase;
//     out.paramsBase = Object.assign({}, state.value.paramsBase);

//     for (const key in matchedParamsBase) {
//       out.paramsBase[key] = state.value.nest + matchedParamsBase[key].substring(1);
//     }
//   } else {
//     out.paramsBase = state.value.paramsBase;
//   }

effect(async () => {
  ourState.value.poke?.value;
  ourState.value.matched?.size;

  if (!ourState.value.matched) {
    // we're not looking for a submatch (probably didn't directly match)
    selfReactive.matched = false;
    return;
  }

  const m = [...ourState.value.matched];
  m.forEach((each) => each.matched); // force read of all
  if (m.some((x) => x.matched === undefined)) {
    console.debug(
      'bailing because not ready yet',
      m.map((x) => x.matched),
    );
    return; // not ready yet
  }

  const results = m.map(({ matched }) => matched!);
  console.info('configring children', {
    comment: props.comment,
    path: props.path,
    results,
    was: ourState.value.matched.size,
  });

  const firstWinner = results.findIndex((x) => x);
  for (let i = 0; i < results.length; ++i) {
    m[i].display = props.matchFirst ? firstWinner === i : results[i];
  }
  selfReactive.matched = firstWinner !== -1;
});

provide(routerStateKey, ourState);

const key = computed(() => {
  const kp = ourState.value.keyParams;
  return kp
    ? Object.entries(kp)
        .map(([key, value]) => `${key}=${value}`)
        .join(',')
    : '';
});

const active = computed<boolean>(() => {
  if (selfReactive.display) {
    return true;
  }

  if (!parentState?.value.matched) {
    return ourState.value.active ?? false;
  }

  return false;
});
</script>

<template>
  <div style="border: 2px solid red">
    route path={{ props.path }} active={{ active }} ourState.active={{
      ourState.active
    }}
    selfReactive={{ selfReactive }}
  </div>
  <template v-if="active">
    <template v-if="props.component">
      <props.component :key="key">
        <slot></slot>
      </props.component>
    </template>
    <template v-else>
      <slot :key="key"></slot>
    </template>
  </template>
  <template v-else-if="props.subMatch">
    <div style="border: 8px solid pink">
      <strong> [should be hidden, visible just for matching] </strong>
      <div><slot></slot></div>
    </div>
  </template>
</template>
