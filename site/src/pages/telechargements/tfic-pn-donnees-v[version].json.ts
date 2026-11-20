import type { APIRoute } from 'astro';
import { jsonExport } from '../../lib/exports.ts';
import { SCIENCE_VERSION } from '../../lib/version.ts';

export function getStaticPaths() {
  return [{ params: { version: SCIENCE_VERSION } }];
}

export const GET: APIRoute = () =>
  new Response(jsonExport(), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
