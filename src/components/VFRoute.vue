<script lang="ts" setup>
import { inject, onMounted, onUnmounted, provide, reactive, ref, watchEffect } from 'vue';
import { type RouteState, routeStateKey, type RouteChildState } from '../lib/keys.ts';
import { applyDisplayMatch, matchPath } from '../lib/helpers.ts';
import WrapComponent from './WrapComponent.vue';

const DEBUG = false;

// nb. uses long-form syntax so we can get `undefined` explicitly
const props = defineProps({
  path: {
    type: String,
    default: undefined,
    required: false,
  },

  component: {
    type: Object,
    default: undefined,
    required: false,
  },

  matchAll: {
    type: Boolean,
    default: undefined,
    required: false,
  },

  matchSelf: {
    type: Boolean,
    default: undefined,
    required: false,
  },

  retainOnParamsChange: {
    type: Boolean,
    default: undefined,
    required: false,
  },
});

const reactiveSelf = reactive<RouteChildState>({
  match: undefined,
  pathMatch: undefined,
});
const parentState = inject(
  routeStateKey,
  () => {
    throw new Error('only use <Route> inside <Router>');
  },
  true,
);

watchEffect((cleanup) => {
  const c = parentState.children;
  c.add(reactiveSelf);
  cleanup(() => c.delete(reactiveSelf));
});

const ourState = reactive<RouteState>({
  children: new Set<RouteChildState>(),
  path: '',
  nest: '',
  keyParams: {},
  params: {},
  paramsBase: {},
});

const mounted = ref<boolean>(false);
onMounted(() => (mounted.value = true));
onUnmounted(() => (mounted.value = false));

watchEffect(() => {
  const matchOut = matchPath(props.path || '', parentState.path);
  ourState.path = matchOut.path;
  ourState.nest = parentState.nest + matchOut.nest.substring(1);

  // nb. we MUST check mounted.value here; this runs before everyone is mounted
  // this basically says "don't care about excessPath until everyone is mounted"
  // there are probably nicer places to put this `mounted.value` check
  const hasExcessPath = mounted.value && matchOut.path.length > 1;
  const children = [...ourState.children];

  reactiveSelf.pathMatch = matchOut.matched;
  if (props.matchSelf) {
    reactiveSelf.match = reactiveSelf.pathMatch;
  } else {
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

  // this must occur before out.params below
  if (props.retainOnParamsChange) {
    ourState.keyParams = {};
  } else if (matchOut.params) {
    ourState.keyParams = Object.assign({}, parentState.keyParams, matchOut.params);
  } else {
    ourState.keyParams = parentState.keyParams;
  }

  // finally set global params
  if (matchOut.params) {
    ourState.params = Object.assign({}, parentState.params, matchOut.params);
  } else {
    ourState.params = parentState.params;
  }

  // ... and base (links)
  if (matchOut.paramsBase) {
    const matchedParamsBase = matchOut.paramsBase;
    ourState.paramsBase = Object.assign({}, parentState.paramsBase);

    for (const key in matchedParamsBase) {
      ourState.paramsBase[key] = parentState.nest + matchedParamsBase[key].substring(1);
    }
  } else {
    ourState.paramsBase = parentState.paramsBase;
  }
});

provide(routeStateKey, ourState);
</script>

<template>
  <template v-if="DEBUG">
    <div
      :style="`border: 2px solid ${
        reactiveSelf.display ? 'green; background: #afa5' : 'red; background: #faa5'
      }; margin: 8px`"
    >
      mounted={{ mounted }}<br />
      Should I display={{ reactiveSelf.display === undefined ? 'undefined' : reactiveSelf.display
      }}<br />
      My path={{ props.path }}<br />
      My local view match={{ reactiveSelf.match }} pathMatch={{ reactiveSelf.pathMatch }}<br />
      <template v-if="ourState.children.size">
        My children's states={{ [...ourState.children].map((x) => x.match).join(',') }}<br />
      </template>

      displayAtAll = {{ reactiveSelf.display || reactiveSelf.pathMatch }}

      <template v-if="reactiveSelf.display || reactiveSelf.pathMatch">
        <div :class="'router-manager ' + (reactiveSelf.display ? 'display' : DEBUG ? 'debug' : '')">
          <WrapComponent :component="props.component" :display="reactiveSelf.display">
            <slot></slot>
          </WrapComponent>
        </div>
      </template>
    </div>
  </template>
  <template v-else>
    <template v-if="reactiveSelf.display || reactiveSelf.pathMatch">
      <div :class="reactiveSelf.display ? 'router-manager display' : 'router-manager'">
        <WrapComponent :component="props.component" :display="reactiveSelf.display">
          <slot></slot>
        </WrapComponent>
      </div>
    </template>
  </template>
</template>

<style scoped>
.router-manager {
  display: none;
}
.router-manager.display {
  display: contents;
}
/* used for DEBUG mode */
.router-manager.debug {
  display: block;
  opacity: 0.5;
}
</style>
