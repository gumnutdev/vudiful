<script lang="ts" setup>
import { computed, inject, onUnmounted, provide, reactive, watchEffect } from 'vue';
import { prouteStateKey, SomeState } from './keys';
import { matchPath } from './helpers';

const props = defineProps<{
  path?: string;

  /**
   * Normally, if this `<Route>` has children, it will not match unless a child matches.
   *
   * Set this to display the `<Route>` regardless.
   * This has no effect if the `<Route>` has no children.
   */
  matchSelf?: boolean;

  /**
   * Render all subordinate routes that match, not just the first.
   */
  matchAll?: boolean;
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

  reactiveSelf.pathMatch = matchOut.matched;
  if (props.matchSelf) {
    reactiveSelf.match = reactiveSelf.pathMatch;
  } else {
    const anyChildMatch = children.some(({ match }) => match) || !children.length;
    reactiveSelf.match = reactiveSelf.pathMatch && anyChildMatch;
  }

  //  reactiveSelf.hasExcessPath = ourState.path !== '/' && !anyChildMatch;

  if (props.matchAll) {
    // display <= match
    for (const c of children) {
      c.display = c.match;
    }
  } else {
    // display <= only first match
    const firstMatch = children.findIndex(({ match }) => match);
    for (let i = 0; i < children.length; ++i) {
      children[i].display = firstMatch === i;
    }
  }
});

provide(prouteStateKey, ourState);
</script>

<template>
  <div
    :style="`border: 2px solid ${
      reactiveSelf.display ? 'green; background: #afa5' : 'red; background: #faa5'
    }; margin: 8px`"
  >
    Should I display={{ reactiveSelf.display }}<br />
    My path={{ props.path }}<br />
    My local view match={{ reactiveSelf.match }} pathMatch={{ reactiveSelf.pathMatch }}<br />
    <template v-if="ourState.children.size">
      My children's states={{ [...ourState.children].map((x) => x.match).join(',') }}<br />
    </template>

    <template v-if="reactiveSelf.display || reactiveSelf.pathMatch">
      <div :class="'router-manager ' + (reactiveSelf.display ? 'display' : 'ambig')">
        <slot></slot>
      </div>
    </template>
  </div>
</template>

<style scoped>
.router-manager {
  display: block;
}
.router-manager.display {
  display: contents;
}
.router-manager.ambig {
  opacity: 0.5;
}
</style>
