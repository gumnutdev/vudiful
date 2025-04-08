import { inject, MaybeRef, toValue } from 'vue';
import { useRouter } from './useRouter.ts';
import { routerUrlKey } from './shared.ts';

const hrefIsRemote = (href: string) => href.startsWith('http://') || href.startsWith('https://');

export function gotoHref(hrefRef: MaybeRef<string | undefined>, e?: Event) {
  const href = toValue(hrefRef);
  if (!href) {
    return;
  }

  if (e instanceof MouseEvent) {
    if (hrefIsRemote(href) || e.metaKey || e.altKey || e.shiftKey) {
      return; // skip
    }
    e.preventDefault();
  }
  window.history.pushState(null, '', href);
  window.dispatchEvent(new CustomEvent('popstate')); // trigger our own listener
}

export function buildResolveUrl() {
  const parentUrl = inject(routerUrlKey, '/');
  const { paramBase } = useRouter();

  return (href: string | undefined, paramRoot?: string | undefined) => {
    if (href === undefined) {
      return undefined;
    }

    if (href.startsWith('/') || hrefIsRemote(href)) {
      return href;
    }

    let parent: string | undefined;

    if (paramRoot) {
      const base = paramBase[paramRoot];
      parent = base;
    }
    if (parent === undefined) {
      parent = toValue(parentUrl);
    }

    const u = new URL('http://localhost'); // use URL for its computing ability
    u.pathname = parent + href;
    // console.debug('converting URL', {
    //   parentUrl: toValue(parentUrl),
    //   href: href,
    //   out: u.pathname,
    // });
    return u.pathname;
  };
}
