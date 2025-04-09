<script lang="ts" setup>
import { effect, inject, provide, reactive } from 'vue';
import { prouteStateKey, SomeState } from './keys';

const reactiveSelf = reactive<SomeState>({ r: Math.random() });
const parentState = inject(prouteStateKey, undefined);

let controller = new AbortController();
effect(() => {
  controller.abort();
  controller = new AbortController();

  const c = parentState?.children;
  if (!c) {
    return;
  }

  c.add(reactiveSelf);
  controller.signal.addEventListener('abort', () => c.delete(reactiveSelf));
  return () => controller.abort();
});

const children = reactive(new Set<SomeState>());
provide(prouteStateKey, { children });
</script>

<template>
  <div style="border: 2px solid red; margin: 8px">
    My number={{ reactiveSelf.r }}<br />
    My children's numbers={{ [...children].map((x) => x.r).join(' ~ ') }}<br />

    <button @click="reactiveSelf.r = Math.random()">Change my number</button>

    <slot></slot>
  </div>
</template>
