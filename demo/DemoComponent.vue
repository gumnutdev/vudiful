<script lang="ts" setup>
import { useParams } from '../src/keys';

const startup = Math.random();

const params = useParams();
</script>

<template>
  <div>Start={{ startup }} params={{ params }}</div>
</template>
