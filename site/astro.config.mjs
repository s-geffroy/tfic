// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site de projet GitHub Pages : https://s-geffroy.github.io/tfic/
// Pour un domaine personnalise : changer SITE_URL, mettre BASE_PATH a '/'.
const SITE_URL = process.env.SITE_URL ?? 'https://s-geffroy.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/tfic';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
