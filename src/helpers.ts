import { toValue, type MaybeRef } from 'vue';
import { defaultRouterState, type RouterState } from './keys.ts';

const splitRoute = (x: string): string[] => {
  if (x === '/' || !x) {
    return [];
  }
  const parts = x.split('/');
  parts.pop();
  parts.shift();
  return parts;
};

const assembleRoute = (x: string[]) => {
  if (!x.length) {
    return '/';
  }
  return '/' + x.join('/') + '/';
};

const splitPart = (part: string) => {
  switch (part[0]) {
    case '?':
    case ':':
    case '*':
      return { controlCode: part[0], rest: part.substring(1) };
  }
  return { controlCode: '', rest: part };
};

export function matchPath(propsPath: string, routerPath: string): RouterState {
  if (!routerPath.endsWith('/')) {
    return defaultRouterState;
  }

  // TODO: hasChildren?
  if (!propsPath.startsWith('/')) {
    propsPath = `/${propsPath}`;
  }
  if (!propsPath.endsWith('/')) {
    propsPath += '/';
  }

  const propsParts = splitRoute(propsPath);
  const routerParts = splitRoute(routerPath);
  let propsPartsLength = propsParts.length;

  let paramsBase: Record<string, string> | undefined;
  let params: Record<string, string> | undefined;

  outer: for (let i = 0; i < propsPartsLength; ++i) {
    const { controlCode, rest } = splitPart(propsParts[i]);

    if (i === routerParts.length) {
      if (controlCode === '?') {
        paramsBase ??= {};
        paramsBase[rest] = assembleRoute(routerParts.slice(0, i));
        break; // optional; don't need to match more
      }
      return defaultRouterState;
    }

    switch (controlCode) {
      case '?':
      case ':': {
        params ??= {};
        paramsBase ??= {};
        params[rest] = routerParts[i];
        paramsBase[rest] = assembleRoute(routerParts.slice(0, i));
        continue;
      }

      case '*': {
        params ??= {};
        paramsBase ??= {};
        params[rest] = routerParts.slice(i).join('/');
        paramsBase[rest] = assembleRoute(routerParts.slice(0, i));
        propsPartsLength = i;
        break outer;
      }
    }

    if (propsParts[i] !== routerParts[i]) {
      return defaultRouterState;
    }
  }
  return {
    path: assembleRoute(routerParts.slice(propsPartsLength)),
    nest: assembleRoute(routerParts.slice(0, propsPartsLength)),
    active: true,
    params,
    paramsBase,
  };
}

export const hrefIsRemote = (href?: string) =>
  href ? href.startsWith('http://') || href.startsWith('https://') : false;

export const ensureTrailingSlash = (href: string) => (href.endsWith('/') ? href : href + '/');

export const mergeHref = (arg: { href?: string; state?: RouterState; root?: string }) => {
  if (!arg.href || arg.href.startsWith('/')) {
    return arg.href;
  }

  if (!arg.state) {
    return '';
  }

  let base: string;
  if (arg.root !== undefined) {
    const paramBase = arg.state.paramsBase?.[arg.root];
    if (paramBase === undefined) {
      return '/';
    }
    base = paramBase;
  } else {
    base = arg.state.nest;
  }

  const u = new URL('http://localhost'); // use URL for its computing ability
  u.pathname = base + arg.href;

  return u.pathname;
};

export const gotoHref = (hrefRef: MaybeRef<string | undefined>, e?: MouseEvent) => {
  const href = toValue(hrefRef);

  if (e) {
    if (hrefIsRemote(href) || e.metaKey || e.altKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
  } else if (hrefIsRemote(href)) {
    window.location.href = href!;
    return;
  }

  window.history.pushState(null, '', href);
  window.dispatchEvent(new CustomEvent('popstate')); // trigger our own listener
};
