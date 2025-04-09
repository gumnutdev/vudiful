<script lang="ts" setup>
import { useParams, useBindLink, useGotoHref } from '../src/hooks';

const gotoHref = useGotoHref();

const startup = Math.random();

const params = useParams();
</script>

<template>
  <div>Start={{ startup }} params={{ params }}</div>
  <a v-bind="useBindLink('zing-magic')">ZingMagic</a><br />
  <button @click="gotoHref('./whatever')">Go whatever</button>
</template>
