'use client';

import { useEffect, useCallback } from 'react';
import {
  useRouter,
  usePathname,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';

export function useNavigate() {
  const router = useRouter();
  return useCallback((path: string) => router.push(path), [router]);
}

export function useLocation() {
  const pathname = usePathname() ?? '/';
  return { pathname, search: '', hash: '', state: null, key: 'default' };
}

export function useSearchParams(): [
  URLSearchParams,
  (params: URLSearchParams | Record<string, string>) => void,
] {
  const sp = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? '/';

  const params = new URLSearchParams(sp?.toString() ?? '');

  const setSearchParams = useCallback(
    (next: URLSearchParams | Record<string, string>) => {
      const qs =
        next instanceof URLSearchParams
          ? next.toString()
          : new URLSearchParams(next).toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname],
  );

  return [params, setSearchParams];
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router]);
  return null;
}
