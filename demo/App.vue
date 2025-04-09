<script setup lang="ts">
import { Router, Route, Link } from '../src/index';
import { ref } from 'vue';
import DemoComponent from './DemoComponent.vue';
import WrapComponent from './WrapComponent.vue';

const matchFirst = ref(true);
const toggleMatchFirst = () => (matchFirst.value = !matchFirst.value);
</script>

<template>
  Hello from app

  <button @click="toggleMatchFirst">Toggle</button>

  <Router>
    <Route path="a" :match-first="matchFirst">
      <Link href="b/c/d">To b/c/d</Link><br />
      <Link href="b/something/d">To b/something/d</Link><br />

      <Route path="b">
        <DemoComponent />

        <Link href="zing" active-class="red" nested-class="blue">Zing!</Link><br />

        Nested under B
        <Route path="?anything" :component="WrapComponent">
          <DemoComponent />
          <Route path="d">
            <DemoComponent />
            <Link href="zing">Under D no key</Link><br />
            <Link href="zing" root="anything">Under D with key</Link><br />
          </Route>
        </Route>
      </Route>

      <Route> Nested under A </Route>
      <Route> Extra nested under A </Route>
    </Route>

    <Route path="x/*what">
      Default X route
      <Link href="/x-zing">XZing rooted</Link><br />
      <Link href="./x-zing">XZing</Link>

      <DemoComponent />
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
