export * from './hooks.ts';
import { useBindLink } from './hooks.ts';
import { Component } from 'vue';
import LinkImport from './Link.vue';
import RouteImport from './Link.vue';
import RouterImport from './Link.vue';

/**
 * Used to create a router-aware `<a href="...">` element.
 *
 * You can also use {@link useBindLink} to `v-bind` an existing `<a>`.
 */
export class Link extends LinkImport {
  href?: string;

  /**
   * If specified, roots this href at the location where we found the named key (like ":key" or "?key").
   */
  root?: string;

  /**
   * If specified, used when the browser is exactly on this page.
   */
  activeClass?: string;

  /**
   * If specified, used when the browser is on or underneath this page.
   */
  nestedClass?: string;
}

/**
 * Describes a declarative route.
 */
export class Route extends RouteImport {
  path?: string;

  /**
   * The component to render if this route is matched.
   *
   * This is not required; you can simply place the component inside your declarative router definition.
   * The convenience here is that the children of the `<Route>` will automatically be slotted inside your component.
   * This might be more urgonomic especially for "layout" components.
   */
  component?: Component;

  /**
   * If true, will only match the first direct descendant `<Route>`, not all valid ones.
   */
  matchFirst?: boolean;

  /**
   * By default, the contained component will be recreated if the params here (e.g., "/:foo") change.
   * This is done by changing the "key" based on the params.
   * This enables developers to be lazy: the values in `useParams` can be immutable, as if they change, the component will be unmounted/remounted.
   *
   * Set this to `true` to instead retain.
   */
  retainOnParamsChange?: boolean;
}

/**
 * The top-level router.
 * This is not configurable and just uses `window.location.pathname` to determine the current route.
 */
export class Router extends RouterImport {}
