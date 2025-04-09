<script lang="ts" setup>
import { inject, onUnmounted, provide, reactive, watchEffect } from 'vue';
import { prouteStateKey, type SomeState } from './keys';
import { applyDisplayMatch, matchPath } from './helpers';

// nb. uses long-form syntax so we can get `undefined` explicitly
const props = defineProps({
  /**
   * Render all subordinate routes that match, not just the first.
   */
  matchSelf: {
    type: Boolean,
    default: undefined,
    required: false,
  },

  /**
   * Normally, if this `<Route>` has children, it will not match unless a child matches.
   *
   * Set this to display the `<Route>` regardless.
   *
   * If the route has no children, this has no effect: the route matches anyway.
   * If the route path is a glob, this has no effect: the route matches anyway.
   * (You can force this to `false` to change the behavior.)
   */
  matchAll: {
    type: Boolean,
    default: undefined,
    required: false,
  },

  /**
   * The path to match.
   * The string "/" and "" are the same, you can also prefix/suffix the path if you want.
   */
  path: {
    type: String,
    default: undefined,
    required: false,
  },
});

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
    const hasExcessPath = ourState.path !== '/';

    // We match:
    //   - (if not disabled) a glob result (ends with "*")
    //   - we has no children and no excess path (i.e., we didn't descend into invalid children)
    //   - or we have normal matched children.
    const anyChildMatch =
      (props.matchAll !== false && (matchOut.globResult || (!children.length && !hasExcessPath))) ||
      children.some(({ match }) => match);

    reactiveSelf.match = reactiveSelf.pathMatch && anyChildMatch;
  }

  applyDisplayMatch(children, props.matchAll);
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
