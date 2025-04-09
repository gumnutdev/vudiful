<script lang="ts" setup>
import { useParams, useBindLink } from '../src/hooks';

const startup = Math.random();

const params = useParams();
</script>

<template>
  <div>Start={{ startup }} params={{ params }}</div>
  <a v-bind="useBindLink('zing-magic')">ZingMagic</a><br />
</template>
