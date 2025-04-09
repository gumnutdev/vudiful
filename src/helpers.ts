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

  //  console.info('cmp', { propsParts, routerParts });

  let params: Record<string, string> | undefined;

  for (let i = 0; i < propsParts.length; ++i) {
    if (i === routerParts.length) {
      return defaultRouterState;
    }

    switch (propsParts[i][0]) {
      case ':': {
        const key = propsParts[i].substring(1);
        params ??= {};
        params[key] = routerParts[i];
        continue;
      }
    }

    if (propsParts[i] !== routerParts[i]) {
      return defaultRouterState;
    }
  }

  const l = propsParts.length;
  return {
    path: assembleRoute(routerParts.slice(l)),
    nest: assembleRoute(routerParts.slice(0, l)),
    active: true,
    params,
  };
}

export const hrefIsRemote = (href: string) =>
  href.startsWith('http://') || href.startsWith('https://');
