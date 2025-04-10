This is a declarative router built for Vue 3.5+.

Vue seems to be very anti-declarative.
This router works for SPAs, but has not been tested for SSR.
Sometimes a SPA is what you need.

## Usage

Install via "vudiful" through your favorite package manager.

Your code can look something like this:

```vue
<script setup lang="ts">
import { VFRouter, VFRoute } from '../src/index.ts';
</script>

<template>
  <VFRouter>
    <VFRoute>
      <!-- Specify a :component, render inline, or both -->
      <VFRoute path="nested/paths" :component="YourOtherComponent" />
      <VFRoute path="has/:yourParamName/foo">
        You can render inline, but you need to be inside a component for `useParams()` to get
        "yourParamName"
      </VFRoute>
    </VFRoute>
    <VFRoute path="*">404</VFRoute>
  </VFRouter>
</template>
```

Within components, you can use `<VFLink href="...">...</VFLink>` to link to pages relative to the current matched route.
You can also specify the `root` property to root at the name of a param, e.g., you could use `root="yourParamName"`.

## Notes

Some notes on usage:

- `VFRouter` only operates on `window.location` and uses the whole pathname
- The components aren't registered globally by default
