<script setup lang="ts">
import Route2 from '../src/Route2.vue';

import { provide, ref, watchEffect } from 'vue';
import Link2 from '../src/Link2.vue';
import { defaultRouterState, type RouterState, routerStateKey } from '../src/keys';
import { ensureTrailingSlash } from '../src/shared';

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

provide(routerStateKey, r);
</script>

<template>
  Hello from app

  <Route2 path="a">
    <Link2 href="b/c">To b/c</Link2>

    <Route2 path="b">
      <Route2 path="c">
        <Route2 path="d"> Within D </Route2>
      </Route2>
    </Route2>
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
