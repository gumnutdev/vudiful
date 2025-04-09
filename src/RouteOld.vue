<script lang="ts" setup>
import {
  computed,
  inject,
  ref,
  Component,
  watchEffect,
  provide,
  reactive,
  toValue,
  onUnmounted,
  onMounted,
  onBeforeMount,
} from 'vue';
import {
  buildMatcher,
  mangeRouteChildren,
  registerSelfKey,
  routerParamsKey,
  routerUrlKey,
} from './shared.ts';
import RouterShow from './RouterShow.vue';

const props = defineProps<{
  /**
   * The path to match. May include "/:foo/" and "/*bar" (as a tail part).
   *
   * If this is unspecified and the `<Route>` has no children, acts like "/*".
   * If the route has children, the default is "/" (i.e., pass through).
   */
  path?: string;

  // TODO: requires upgrading 'manageRouteChildren' into two categories
  // /**
  //  * If true, this route will only match within its parent if _no other_ routes matched before it.
  //  */
  // else?: boolean;

  /**
   * By default, the contained component will be recreated if the params here (e.g., "/:foo") change.
   */
  retainOnParamsChange?: boolean;

  /**
   * The component to render if this route is matched.
   *
   * Children of the `<Route>` will always be rendered, but inside `<div hidden>`, even if not active.
   * This might be fine for lazy/small routes, but not ones with complex behavior.
   */
  component?: Component;

  /**
   * If true, will only match the first direct descendant `<Route>`, not all valid ones.
   *
   * Not relevant for leaf routes without children.
   */
  matchFirst?: boolean;
}>();

console.info('setup Route with props.path', props.path);

onBeforeMount(() => {
  console.info('!@ beforeMounted Route with props.path', props.path);
});

onMounted(() => {
  console.info('!@ mounted Route with props.path', props.path);
});

onUnmounted(() => {
  console.info('unmounted Route with props.path', props.path);
});

const children = mangeRouteChildren();
const matcher = computed(() => {
  const defaultPath = children.size ? '/' : '/*';
  return buildMatcher(props.path || defaultPath);
});

// keep track of parent/local matched URL
const parentUrl = inject(routerUrlKey)!;
const localUrl = ref('');
provide(routerUrlKey, localUrl);

// keep track of parent/local params
const parentParams = inject(routerParamsKey);
const localParams = reactive({} as Record<string, { base: string; value: string }>);
provide(routerParamsKey, localParams);

const rs = inject(registerSelfKey);
if (!rs || !parentUrl) {
  throw new Error(`<Route> must only be used inside <Router>`);
}

const active = ref(false);
const componentKey = ref('');

// as our children change, re-register ourselves
watchEffect((cleanup) => {
  cleanup(
    rs((path) => {
      const m = path && matcher.value(path);
      if (!m) {
        if (!active.value) {
          return false; // we weren't active, nothing to change
        }

        // sad "never match" path
        for (const c of children) {
          if (c('')) {
            throw new Error(`should never match empty path`);
          }
        }
        active.value = false;
        return false;
      }

      // matched will always start with "/", so we can strip the trailing "/" (or only "/") from the parentUrl
      const parentUrlValue = toValue(parentUrl);
      localUrl.value = parentUrlValue.substring(0, parentUrlValue.length - 1) + m.matched;

      // TODO: slow? maybe? do we care?
      for (const k in localParams) {
        delete localParams[k];
      }
      Object.assign(localParams, parentParams);
      for (const k in m.params) {
        localParams[k] = {
          value: m.params[k].value,
          base: parentUrlValue.substring(0, parentUrlValue.length - 1) + m.params[k].base,
        };
      }

      // ensure change in params recreates component (TODO: configurable?)
      if (props.retainOnParamsChange) {
        componentKey.value = '';
      } else {
        componentKey.value = Object.entries(localParams)
          .map(([key, value]) => `${key}=${value}`)
          .join(',');
      }

      // if we don't have children, only we can be active (exact match)
      if (!children.size) {
        const out = Boolean(m?.rest === '/');
        // if (out) {
        //   console.debug('self active, wasActive=', active.value);
        // }
        active.value = out;
        return out;
      }

      // we match but have children; need a child to agree
      // TODO: what is the normal behavior here? fail?
      let rest = m.rest;
      let found = false;
      // console.debug('cheecking children of', props.path, '||', children.size ? '/' : '/*');
      for (const c of children) {
        if (c(rest)) {
          found = true;
          // console.debug('found child match for', rest, 'was active?', active.value);

          if (props.matchFirst) {
            rest = '';
          }
        }
      }
      active.value = found;
      return found;
    }),
  );
});

// When we mount, we call our parent Route to basically say "here I am, I want to be in the running".
// Once we unmount, we deregister ourselves from that.
// TODO: ordering?

const display = computed(() => {
  return active.value ? props.component || RouterShow : undefined;
});

// TODO: This is trying to deal with: if our rendered component doesn't have a <slot>, can we still render stuff.
// ...(ofc it needs <slot> for provide() and friends to work)
//  - we can't just include <slot></slot> twice: the content is rendered in both places *brain asplode*
// const slotRef = useTemplateRef('slotRef');
// watchEffect(() => {
//   console.info('route', props.path, 'got slotRef', slotRef.value);
// });
</script>

<template>
  <template v-if="active">
    <display :key="componentKey">
      <slot></slot>
    </display>
  </template>
  <template v-else>
    <!-- <div hidden>
      <slot></slot>
    </div> -->
  </template>
</template>
