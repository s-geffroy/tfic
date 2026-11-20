/**
 * Revue de publication de dist/ (après astro build). Bloquant.
 * - routes attendues présentes (navigation directe / rechargement) ;
 * - tout lien ou ressource interne préfixé par la base et résolu dans dist/ ;
 * - aucune image d'archive, aucun gabarit participant, aucun statut APPROVED,
 *   aucun total « 62 », aucun motif de secret ou d'adresse personnelle.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const BASE = (process.env['BASE_PATH'] ?? '/tfic').replace(/\/+$/, '');
const errors: string[] = [];
const fail = (m: string) => errors.push(m);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

if (!existsSync(DIST)) {
  console.error('verify-publication: FAIL — dist/ absent (lancer astro build)');
  process.exit(1);
}
const files = walk(DIST);
const rel = files.map((f) => relative(DIST, f));

const ROUTES = [
  'index.html',
  'theorie/index.html',
  'corpus/index.html',
  'corpus/S07/index.html',
  'corpus/D023/index.html',
  'personnages/index.html',
  'personnages/krampus/index.html',
  'personnages/pere-fouettard/index.html',
  'reseau/index.html',
  'laboratoire/index.html',
  'methodologie/index.html',
  'bibliographie/index.html',
  'versions/index.html',
  'telechargements/index.html',
  'telechargements/tfic-pn-donnees-v0.5.1.json',
  '404.html',
  'sitemap-index.xml',
  'favicon.svg',
];
for (const r of ROUTES) if (!rel.includes(r)) fail(`route manquante : ${r}`);
const corpusPages = rel.filter((r) => /^corpus\/[^/]+\/index\.html$/.test(r)).length;
if (corpusPages !== 62) fail(`fiches corpus : ${corpusPages} générées, 62 attendues (11 v0.5 + 51 v0.4, pages distinctes)`);

const IMG = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.tif', '.tiff', '.bmp']);
for (const r of rel) if (IMG.has(extname(r).toLowerCase())) fail(`image publiée sans décision de droits : ${r}`);

const FORBIDDEN: [RegExp, string][] = [
  [/\bAPPROVED\b/, 'statut APPROVED'],
  [/participant_pseudonym|coder_id,coding_round|development_label_DO_NOT_SHOW|DO_NOT_SHOW/, 'gabarit participant ou étiquette de stimulus'],
  [/\b62\s+(notices|documents|sources|objets|témoins)/i, 'addition 51+11 présentée comme total'],
  [/(ghp_|github_pat_|sk-[A-Za-z0-9]{20}|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY)/, 'motif de secret'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]*[a-z]{2,}/, 'adresse électronique'],
  [/drive\.google\.com|docs\.google\.com/, 'lien Google Drive'],
];

const ATTR = /\s(?:href|src)="([^"]+)"/g;
let links = 0;
for (const f of files) {
  const ext = extname(f);
  if (!['.html', '.json', '.xml', '.csv', '.js', '.css'].includes(ext)) continue;
  const text = readFileSync(f, 'utf-8');
  const where = relative(DIST, f);
  for (const [re, what] of FORBIDDEN) if (re.test(text)) fail(`${where} : ${what}`);
  if (ext !== '.html') continue;
  for (const m of text.matchAll(ATTR)) {
    const url = m[1] ?? '';
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    links += 1;
    if (url !== BASE && !url.startsWith(`${BASE}/`)) {
      fail(`${where} : lien interne sans base « ${url} »`);
      continue;
    }
    const path = decodeURIComponent(url.slice(BASE.length).split('#')[0]?.split('?')[0] ?? '');
    const target = join(DIST, path);
    const ok = path === '' || path === '/' ? existsSync(join(DIST, 'index.html')) : existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html')));
    if (!ok) fail(`${where} : lien cassé « ${url} »`);
  }
}

for (const e of errors) console.error(`  ${e}`);
console.log(`verify-publication: ${errors.length ? 'FAIL' : 'PASS'} (${rel.length} fichiers, ${links} liens internes vérifiés, ${errors.length} problème(s))`);
process.exit(errors.length ? 1 : 0);
