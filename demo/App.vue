<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import DemoComponent from './DemoComponent.vue';
import WrapComponent from './WrapComponent.vue';
import PRoute from '../src/PRoute.vue';
import PRouter from '../src/PRouter.vue';

const matchFirst = ref(true);
const toggleMatchFirst = () => (matchFirst.value = !matchFirst.value);

const textRef = useTemplateRef('textRef');
const handleGoto = (e: Event) => {
  e.preventDefault();
  history.pushState(null, '', textRef.value?.value || '/');
  window.dispatchEvent(new CustomEvent('popstate')); // trigger our own listener
};
</script>

<template>
  Hello from app

  <button @click="toggleMatchFirst">Toggle</button>

  <!-- <Router>
    <Route match-first comment="Top">
      Top-level whatever

      <Route path="/createProject">
        Create Project
        <Link href="../">Goto top</Link>
      </Route>

      <Route sub-match comment="Sub match doohickey">
        Zero sth
        <Route path="/extra">Something a little extra</Route>
        <Route path="/complex">
          Default
          <Link href="../createProject">Goto createProject</Link>
        </Route>
      </Route>

      <Route path="/*"> Rest </Route>
    </Route>
  </Router> -->

  <form>
    <input type="text" ref="textRef" />
    <button @click="handleGoto">Goto</button>
  </form>

  <PRouter>
    <PRoute>
      <PRoute path="/extra/">
        <PRoute path="1" sub-match match-first>
          <PRoute path="2"><strong>First</strong></PRoute>
          <PRoute path="2"><strong>Second</strong></PRoute>
          <PRoute path="2a" sub-match>
            <PRoute path="3"></PRoute>
          </PRoute>
        </PRoute>
      </PRoute>
      <PRoute path="not-extra"></PRoute>
      <PRoute path="not-extra-123">
        <PRoute path="sub-extra"></PRoute>
      </PRoute>
    </PRoute>
  </PRouter>
</template>

<style>
.red {
  background: red;
}
.blue {
  background: blue;
}
</style>
