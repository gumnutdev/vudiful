import { InjectionKey, MaybeRef, provide, reactive, Ref } from 'vue';

// returns cleanup/deregister method
export type PathCheckFn = (path: string) => boolean;
export type RegisterSelf = (check: PathCheckFn) => () => void;

export const registerSelfKey = Symbol('register-self') as InjectionKey<RegisterSelf>;
export const pathnameKey = Symbol('pathname') as InjectionKey<Ref<string>>;
export const routerUrlKey = Symbol('router-url') as InjectionKey<MaybeRef<string>>;
export const routerParamsKey = Symbol('router-params') as InjectionKey<
  Record<string, { value: string; base: string }>
>;

export function ensureTrailingSlash(s: string) {
  return s.endsWith('/') ? s : `${s}/`;
}

export type PathMatcher = (
  s: string,
) =>
  | { params: Record<string, { base: string; value: string }>; matched: string; rest: string }
  | undefined;

export function buildMatcher(pathname: string): PathMatcher {
  if (!/\/[\?:\*]/.test(pathname)) {
    pathname = ensureTrailingSlash(pathname);
    return (check) => {
      if (check.startsWith(pathname)) {
        const rest = check.substring(pathname.length - 1) || '/';
        return { params: {}, rest, matched: check.substring(0, pathname.length) };
      }
    };
  }

  const segments = pathname.split('/').filter((x) => x);
  if (!segments.length) {
    throw new Error('panic: regexp wrong, missing : *');
  }

  return (check) => {
    const matched: string[] = [];
    const cs = check.split('/').filter((x) => x);
    const params: Record<string, { base: string; value: string }> = {};

    for (let i = 0; i < segments.length; ++i) {
      if (segments[i][0] === '?') {
        // like ':', but optional
        if (!cs.length) {
          break;
        }
      }

      if (!cs.length) {
        return;
      }

      switch (segments[i][0]) {
        case '?':
        case ':': {
          const key = segments[i].substring(1);
          const next = cs.shift()!;
          if (key) {
            params[key] = { base: ensureSlash(matched), value: next };
            matched.push(next);
          }
          break;
        }
        case '*': {
          const key = segments[i].substring(1);
          if (key) {
            params[key] = { base: ensureSlash(matched), value: cs.join('/') }; // TODO: not quite right if there's // or whatever
          }
          return { params, rest: '/', matched: '/' };
        }
        default: {
          const next = cs.shift()!;
          if (next !== segments[i]) {
            return;
          }
          matched.push(next);
        }
      }
    }
    return { params, rest: ensureSlash(cs), matched: ensureSlash(matched) };
  };
}

function ensureSlash(parts: string[]) {
  return ensureTrailingSlash('/' + parts.join('/'));
}

export function mangeRouteChildren() {
  const children = reactive(new Set<PathCheckFn>());

  provide(registerSelfKey, (check) => {
    children.add(check);
    return () => {
      children.delete(check);
    };
  });

  return children;
}
