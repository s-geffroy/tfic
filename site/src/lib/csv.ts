/**
 * Parseur CSV RFC 4180 minimal (guillemets, guillemets doubles, CRLF, BOM).
 * Volontairement sans dépendance : les CSV du corpus sont petits, et un
 * parseur testé ici vaut mieux qu'une découpe naïve sur les virgules.
 */
export type CsvRecord = Record<string, string>;

export class CsvError extends Error {}

export function parseCsvRows(text: string): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      if (field.length > 0) throw new CsvError(`guillemet inattendu ligne ${rows.length + 1}`);
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
    } else {
      field += ch;
    }
    i += 1;
  }
  if (inQuotes) throw new CsvError('guillemet non fermé en fin de fichier');
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

export function parseCsv(text: string, name = 'csv'): CsvRecord[] {
  const rows = parseCsvRows(text);
  const header = rows[0];
  if (!header) return [];
  const seen = new Set<string>();
  for (const h of header) {
    if (seen.has(h)) throw new CsvError(`${name}: colonne dupliquée « ${h} »`);
    seen.add(h);
  }
  return rows.slice(1).map((r, idx) => {
    if (r.length !== header.length) {
      throw new CsvError(`${name}: ligne ${idx + 2} a ${r.length} champs, ${header.length} attendus`);
    }
    const rec: CsvRecord = {};
    header.forEach((h, j) => {
      rec[h] = (r[j] ?? '').trim();
    });
    return rec;
  });
}

export function toCsv(header: readonly string[], rows: readonly CsvRecord[]): string {
  const esc = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [header.map(esc).join(',')];
  for (const r of rows) lines.push(header.map((h) => esc(r[h] ?? '')).join(','));
  return lines.join('\n') + '\n';
}
