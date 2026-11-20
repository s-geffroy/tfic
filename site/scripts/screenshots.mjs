// Outil de contrôle visuel (dev uniquement) : sert dist/ sous /tfic/ et capture
// des pages en desktop et mobile, relève les erreurs console et teste les
// interactions principales. Sorties dans .shots/ (ignoré par Git).
// Usage : sudo appctl run shot sh -c 'cd /tmp && npm i -s playwright@1.65.1 && NODE_PATH=/tmp/node_modules node /site/scripts/screenshots.mjs'
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const require = createRequire('/tmp/');
const { chromium } = require('playwright');
const DIST = '/site/dist';
const OUT = '/site/.shots';
const BASE = '/tfic';
mkdirSync(OUT, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.csv': 'text/csv', '.xml': 'application/xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (!url.startsWith(`${BASE}/`)) { res.writeHead(404); return res.end('hors base'); }
  let p = join(DIST, url.slice(BASE.length));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { res.writeHead(404, { 'Content-Type': 'text/html' }); return res.end(readFileSync(join(DIST, '404.html'))); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(p)] ?? 'application/octet-stream' });
  res.end(readFileSync(p));
}).listen(4321);

const pages = ['', 'theorie/', 'corpus/', 'corpus/S07/', 'corpus/D005/', 'personnages/', 'personnages/krampus/', 'reseau/', 'laboratoire/', 'methodologie/', 'bibliographie/', 'versions/', 'telechargements/', 'inexistant/'];
const browser = await chromium.launch();
const problems = [];
for (const [name, viewport, scheme] of [['desktop', { width: 1280, height: 900 }, 'light'], ['mobile', { width: 390, height: 844 }, 'light'], ['dark', { width: 1280, height: 900 }, 'dark']]) {
  const ctx = await browser.newContext({ viewport, colorScheme: scheme });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`${name} console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`${name} pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`${name} requestfailed: ${r.url()}`));
  for (const p of name === 'dark' ? ['', 'reseau/', 'theorie/'] : pages) {
    const resp = await page.goto(`http://localhost:4321${BASE}/${p}`, { waitUntil: 'networkidle' });
    if (p !== 'inexistant/' && resp?.status() !== 200) problems.push(`${name} ${p}: HTTP ${resp?.status()}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) {
      const culprits = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); if (r.right <= window.innerWidth + 1) return false; for (let a = e.parentElement; a; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox === "auto" || ox === "scroll" || ox === "hidden") return false; } return true; }).slice(0, 4).map((e) => `${e.tagName.toLowerCase()}.${e.className} (${Math.round(e.getBoundingClientRect().right)}px)`));
      problems.push(`${name} ${p}: débordement horizontal : ${culprits.join(", ")}`);
    }
    await page.screenshot({ path: `${OUT}/${name}-${(p || 'accueil').replace(/\//g, '_')}.png`, fullPage: name !== 'mobile' || p === '' });
  }
  await ctx.close();
}

// Interactions
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(`http://localhost:4321${BASE}/corpus/`);
const before = await page.textContent('#count');
await page.selectOption('select[name=char]', 'C_KRAMPUS');
const after = await page.textContent('#count');
console.log(`corpus: « ${before} » → Krampus : « ${after} »`);
await page.goto(`http://localhost:4321${BASE}/reseau/`);
const visible = async (id) => page.locator(`section[data-level=occurrences] g.edge[data-edge=${id}]`).isVisible();
console.log(`réseau par défaut : X01=${await visible('X01')} X05=${await visible('X05')} X04=${await visible('X04')}`);
await page.check('input[name=hypothesis]');
console.log(`réseau + hypothèses : X05=${await visible('X05')} X04=${await visible('X04')}`);
await page.locator('section[data-level=occurrences] g.edge[data-edge=X01]').focus();
await page.keyboard.press('Enter');
console.log(`panneau : ${(await page.textContent('#edge-panel'))?.slice(0, 120)}`);
await page.screenshot({ path: `${OUT}/interaction-reseau.png`, fullPage: true });
await page.goto(`http://localhost:4321${BASE}/laboratoire/`);
console.log(`labo 1 : ${await page.textContent('#demo1-out')}`);
console.log(`labo 2 : ${(await page.textContent('#demo2-out'))?.slice(0, 160)}`);
await page.selectOption('form#demo4 select[name=rel]', 'same_character');
console.log(`labo 4 : ${(await page.textContent('#demo4-out'))?.slice(0, 120)}`);
await ctx.close();
await browser.close();
server.close();
console.log(problems.length ? `PROBLEMES:\n${problems.join('\n')}` : 'aucun problème console/réseau/débordement');
