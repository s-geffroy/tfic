import { describe, expect, it } from 'vitest';
import { CsvError, parseCsv, toCsv } from '../src/lib/csv.ts';

describe('parseCsv', () => {
  it('gère guillemets, virgules et guillemets doublés', () => {
    const rows = parseCsv('a,b\n"x, y","il dit ""oui"""\n');
    expect(rows).toEqual([{ a: 'x, y', b: 'il dit "oui"' }]);
  });
  it('retire le BOM et accepte CRLF', () => {
    expect(parseCsv('﻿a,b\r\n1,2\r\n')).toEqual([{ a: '1', b: '2' }]);
  });
  it('refuse une ligne au mauvais nombre de champs', () => {
    expect(() => parseCsv('a,b\n1,2,3\n')).toThrow(CsvError);
  });
  it('aller-retour toCsv/parseCsv', () => {
    const rows = [{ a: 'x,"y"', b: 'z\nw' }];
    expect(parseCsv(toCsv(['a', 'b'], rows))).toEqual(rows);
  });
});
