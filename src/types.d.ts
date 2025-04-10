import type { useBindLink } from './hooks.ts';
import type { Component, DefineComponent } from 'vue';
export * from './hooks.ts';

// TODO(samthor): the top-level comments here don't actually show up in TS.

/**
 * The top-level router.
 * This is not configurable and just uses `window.location.pathname` to determine the current route.
 */
export const VFRouter: DefineComponent<{
  /**
   * Render all subordinate routes that match, not just the first.
   *
   * If the route has no children, this has no effect: the route matches anyway.
   * If the route path is a glob, this has no effect: the route matches anyway.
   * (You can force this to `false` to change the behavior.)
   */
  matchAll?: boolean;
}>;

/**
 * Used to create a router-aware `<a href="...">` element.
 *
 * You can also use {@link useBindLink} to `v-bind` an existing `<a>`.
 */
export const VFLink: DefineComponent<{
  /**
   * The href to use for this `<a href="...">`.
   */
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
}>;

export const VFRoute: DefineComponent<{
  /**
   * The path to match.
   * The string "/" and "" are the same, you can also prefix/suffix the path if you want.
   */
  path?: string;

  /**
   * The component to render if this route is matched.
   *
   * This is not required; you can simply place the component inside your declarative router definition.
   * The convenience here is that the children of the `<VFRoute>` will automatically be slotted inside your component.
   * This might be more urgonomic especially for "layout" components.
   */
  component?: Component;

  /**
   * Render all subordinate routes that match, not just the first.
   *
   * If the route has no children, this has no effect: the route matches anyway.
   * If the route path is a glob, this has no effect: the route matches anyway.
   * (You can force this to `false` to change the behavior.)
   */
  matchAll?: boolean;

  /**
   * Normally, if this `<VFRoute>` has children, it will not match unless a child matches.
   *
   * Set this to display the `<VFRoute>` regardless.
   */
  matchSelf?: boolean;

  /**
   * By default, the contained component will be recreated if the params here (e.g., "/:foo") change.
   * This is done by changing the "key" based on the params.
   * This enables developers to be lazy: the values in `useParams` can be immutable, as if they change, the component will be unmounted/remounted.
   *
   * Set this to `true` to instead retain.
   */
  retainOnParamsChange?: boolean;
}>;
