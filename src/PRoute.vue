<script lang="ts" setup>
import { inject, onUnmounted, provide, reactive, watchEffect } from 'vue';
import { prouteStateKey, SomeState } from './keys';
import { matchPath } from './helpers';

const props = defineProps<{
  path?: string;

  /**
   * If true, we will not render unless at least of our children is rendering.
   * This can be combined with `matchFirst`.
   * This forces our children to render (inside `<div hidden>`) in order to determine their validity.
   */
  subMatch?: boolean;

  /**
   * Only render the first match among our children.
   */
  matchFirst?: boolean;
}>();

const reactiveSelf = reactive<SomeState>({
  match: undefined,
  pathMatch: undefined,
});
const parentState = inject(
  prouteStateKey,
  () => {
    throw new Error('only use <PRoute> inside <PRouter>');
  },
  true,
);

let controller: AbortController | undefined;
watchEffect(() => {
  controller?.abort();
  controller = new AbortController();

  const c = parentState.children;
  c.add(reactiveSelf);
  controller.signal.addEventListener('abort', () => {
    c.delete(reactiveSelf);
  });
});
onUnmounted(() => {
  controller?.abort();
});

const ourState = reactive({
  children: new Set<SomeState>(),
  path: '',
  nest: '',
});

watchEffect(() => {
  const matchOut = matchPath(props.path || '', parentState.path);
  ourState.path = matchOut.path;
  ourState.nest = parentState.nest + matchOut.nest.substring(1);

  const children = [...ourState.children];
  const anyChildMatch = children.some(({ match }) => match);

  reactiveSelf.pathMatch = matchOut.matched;
  if (props.subMatch) {
    reactiveSelf.match = anyChildMatch;
  } else {
    reactiveSelf.match = reactiveSelf.pathMatch;
    // console.info('got regular model', ourState.children.size);
    // reactiveSelf.localMatch = !ourState.children.size;
  }

  reactiveSelf.hasExcessPath = ourState.path !== '/' && !anyChildMatch;

  if (props.matchFirst) {
    let found = false;
    for (const c of children) {
      const { match } = c;
      if (!found && match) {
        c.display = true;
        found = true;
      } else {
        c.display = false;
      }
    }
  } else {
    for (const c of children) {
      c.display = c.match;
    }
  }
});

provide(prouteStateKey, ourState);
</script>

<template>
  <div style="border: 2px solid red; margin: 8px">
    Should I display={{ reactiveSelf.display && !reactiveSelf.hasExcessPath }}<br />
    My path={{ props.path }}<br />
    My local view on being active={{ reactiveSelf.match }}<br />
    <template v-if="ourState.children.size">
      My children's states={{ [...ourState.children].map((x) => x.match).join(',') }}<br />
    </template>

    <template v-if="reactiveSelf.display && !reactiveSelf.hasExcessPath">
      <slot></slot>
    </template>
    <template v-else-if="reactiveSelf.pathMatch">
      <div style="opacity: 0.5">
        <slot></slot>
      </div>
    </template>
  </div>
</template>
