/** Chemins internes préfixés par la base GitHub Pages ; jamais de « /tfic/ » codé en dur. */
export function href(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const clean = path.replace(/^\/+/, '');
  if (clean === '') return `${base}/`;
  const withSlash = /\.[a-z0-9]+$/i.test(clean) || clean.includes('#') || clean.endsWith('/') ? clean : `${clean}/`;
  return `${base}/${withSlash}`;
}
