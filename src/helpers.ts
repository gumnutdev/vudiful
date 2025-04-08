import { defaultRouterState, type RouterState } from './keys.ts';

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

  if (!routerPath.startsWith(propsPath)) {
    return defaultRouterState;
  }

  return {
    path: routerPath.substring(propsPath.length - 1),
    nest: routerPath.substring(0, propsPath.length),
    active: true,
  };
}
