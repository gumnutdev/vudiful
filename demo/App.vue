<script setup lang="ts">
import Route from '../src/Route.vue';

import { provide, ref, watchEffect } from 'vue';
import Link from '../src/Link.vue';
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

  <Route path="a" :match-first="matchFirst">
    <Link href="b/c/d">To b/c/d</Link><br />
    <Link href="b/something/d">To b/something/d</Link><br />

    <Route path="b">
      <DemoComponent />

      <Link href="zing">Zing</Link>

      Nested under B
      <Route path="?anything" :component="WrapComponent">
        <DemoComponent />
        <Route path="d">
          <DemoComponent />
        </Route>
      </Route>
    </Route>

    <Route> Nested under A </Route>
    <Route> Extra nested under A </Route>
  </Route>

  <Route path="x/*what">
    Default route

    <DemoComponent />
  </Route>

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
