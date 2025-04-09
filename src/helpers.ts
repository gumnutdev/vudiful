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

  let params: Record<string, string> | undefined;

  outer: for (let i = 0; i < propsPartsLength; ++i) {
    const controlCode = propsParts[i][0];
    if (i === routerParts.length) {
      if (controlCode === '?') {
        break; // optional; don't need to match more
      }
      return defaultRouterState;
    }

    switch (controlCode) {
      case '?':
      case ':': {
        const key = propsParts[i].substring(1);
        params ??= {};
        params[key] = routerParts[i];
        continue;
      }

      case '*': {
        const key = propsParts[i].substring(1);
        params ??= {};
        params[key] = routerParts.slice(i).join('/');
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
  };
}

export const hrefIsRemote = (href: string) =>
  href.startsWith('http://') || href.startsWith('https://');
