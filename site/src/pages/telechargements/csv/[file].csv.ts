import type { APIRoute } from 'astro';
import { DATA_FILES, readRaw, type DataFileKey } from '../../../lib/data.ts';

export function getStaticPaths() {
  return (Object.keys(DATA_FILES) as DataFileKey[]).map((key) => ({ params: { file: DATA_FILES[key].replace(/\.csv$/, '') }, props: { key } }));
}

export const GET: APIRoute = ({ props }) => {
  const key = (props as { key: DataFileKey }).key;
  return new Response(readRaw(key), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
