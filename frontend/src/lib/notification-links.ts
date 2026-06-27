const PUBLIC_PREFIXES = [
  '/login',
  '/register',
  '/pricing',
  '/help',
  '/blog',
  '/careers',
  '/privacy',
  '/terms',
];

/** Map legacy notification paths to Next.js app routes. */
export function normalizeNotificationLink(link: string): string {
  const trimmed = link.trim();
  if (!trimmed) return '';

  const queryIndex = trimmed.indexOf('?');
  const path = queryIndex === -1 ? trimmed : trimmed.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : trimmed.slice(queryIndex);

  if (path.startsWith('/app/') || path === '/app') return trimmed;

  if (PUBLIC_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return trimmed;
  }

  if (path.startsWith('/')) return `/app${path}${query}`;

  return trimmed;
}
