<script setup lang="ts">
import Route2 from '../src/Route2.vue';

import { provide, ref, watchEffect } from 'vue';
import Link2 from '../src/Link2.vue';
import { defaultRouterState, type RouterState, routerStateKey } from '../src/keys';
import { ensureTrailingSlash } from '../src/shared';
import DemoComponent from './DemoComponent.vue';
import WrapComponent from './WrapComponent.vue';

const r = ref<RouterState>(defaultRouterState);

watchEffect((cleanup) => {
  const c = new AbortController();
  cleanup(() => c.abort());

  const update = () => {
    r.value = { path: ensureTrailingSlash(window.location.pathname), nest: '' };
  };
  update();
  window.addEventListener('popstate', update, { signal: c.signal });
});

const matchFirst = ref(true);
const toggleMatchFirst = () => (matchFirst.value = !matchFirst.value);

provide(routerStateKey, r);
</script>

<template>
  Hello from app

  <button @click="toggleMatchFirst">Toggle</button>

  <Route2 path="a" :match-first="matchFirst">
    <Link2 href="b/c/d">To b/c/d</Link2><br />
    <Link2 href="b/something/d">To b/something/d</Link2><br />

    <Route2 path="b">
      <DemoComponent />

      Nested under B
      <Route2 path=":anything" :component="WrapComponent">
        <DemoComponent />
        <Route2 path="d">
          <DemoComponent />
        </Route2>
      </Route2>
    </Route2>

    <Route2> Nested under A </Route2>
    <Route2> Extra nested under A </Route2>
  </Route2>

  <!-- <Router>
    <Route path="/page/*"
      >Page
      <Link href="./page">Link</Link>
    </Route>
    <Route path="/other"
      >Other

      <Route path="/nest">Nested within Other</Route>
    </Route>
  </Router> -->
</template>
