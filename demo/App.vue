<script setup lang="ts">
import { useTemplateRef } from 'vue';
import DemoComponent from './DemoComponent.vue';
import WrapComponent from './WrapComponent.vue';
import { Route, Router, Link } from '../src/index.ts';

const textRef = useTemplateRef('textRef');
const handleGoto = (e: Event) => {
  e.preventDefault();
  history.pushState(null, '', textRef.value?.value || '/');
  window.dispatchEvent(new CustomEvent('popstate')); // trigger our own listener
};
</script>

<template>
  Hello from app

  <form>
    <input type="text" ref="textRef" />
    <button @click="handleGoto">Goto</button>
  </form>

  <Router>
    <Route>
      <Route path="/extra/">
        <Route path="1" match-self>
          <Route path="2"><strong>First</strong></Route>
          <Route path="2"><strong>Second</strong></Route>
          <Route path="2a">
            I'm a 2a
            <Route path="3">I'm 3 and I should display</Route>
          </Route>
          <Route path="*">
            No route matched
            <Link href="2" active-class="red">To page 2</Link>

            <Route path="butt"> But butt </Route>
          </Route>
        </Route>
      </Route>
      <Route path="not-extra"></Route>
      <Route path="not-extra-123">
        <Route path="sub-extra"></Route>
      </Route>
    </Route>
  </Router>
</template>

<style>
.red {
  background: red;
}
.blue {
  background: blue;
}
</style>
