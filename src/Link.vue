<script lang="ts" setup>
import { computed, inject } from 'vue';
import { ensureTrailingSlash, pathnameKey } from './shared';
import { buildResolveUrl, gotoHref } from './goto';

/**
 * Does this comment on A
 */
const props = defineProps<{
  href?: string;
  activeClass?: string;
  nestedClass?: string;
  paramRoot?: string;
}>();

const resolveUrl = buildResolveUrl();
const href = computed(() => resolveUrl(props.href, props.paramRoot));

const pagePathname = inject(pathnameKey, undefined);

const className = computed(() => {
  if (!pagePathname || href.value === undefined) {
    return undefined;
  }
  const hrefValue = ensureTrailingSlash(href.value);

  if (pagePathname.value === hrefValue) {
    return props.activeClass || props.nestedClass || undefined;
  } else if (pagePathname.value.startsWith(hrefValue)) {
    return props.nestedClass || undefined;
  }

  return undefined;
});

const onClick = (e: MouseEvent) => gotoHref(href, e);
</script>

<template>
  <a :href="href" :class="className" @click="onClick"><slot></slot></a>
</template>
