import { describe, expect, it } from 'vitest';
import { loadDataset } from '../src/lib/data.ts';
import { validateDataset } from '../src/lib/validate.ts';
import { publicStats } from '../src/lib/stats.ts';
import { STATE_LABEL, STATE_SHORT } from '../src/lib/labels.ts';

const d = loadDataset();

describe('jeu de données publié', () => {
  it('passe toutes les règles bloquantes', () => {
    const r = validateDataset(d);
    expect(r.errors).toEqual([]);
  });

  it('A03 : 51 notices v0.4 et 11 témoins v0.5, jamais additionnés', () => {
    const s = publicStats(d);
    expect(s.v04Records).toBe(51);
    expect(s.v05Witnesses).toBe(11);
    expect(JSON.stringify(s)).not.toContain('62');
  });

  it('46 pré-annotations, une seule passe éditoriale, aucun participant', () => {
    const s = publicStats(d);
    expect(s.v05Assertions).toBe(46);
    expect(s.participants).toBe(0);
    expect(s.independentCoders).toBe(0);
    expect(s.modelMetrics).toBeNull();
  });

  it('A05 : Karl Krinken = édition 1878, deux occurrences distinctes', () => {
    const s07 = d.sourcesV05.find((s) => s.id === 'S07');
    expect(s07?.dateLabel).toBe('1878');
    const occ = d.occurrences.filter((o) => o.sourceId === 'S07');
    expect(occ.map((o) => o.characterId).sort()).toEqual(['C_FATHER_CHRISTMAS', 'C_SANTA_CLAUS']);
  });

  it('A14 : Jonson v0.4 corrigé en surcouche (1616–1617), fichier source intact', () => {
    const d005 = d.sourcesV04.find((s) => s.id === 'D005');
    expect(d005?.dateLabel).toMatch(/1616–1617/);
    expect(d005?.corrections.join(' ')).toMatch(/1615/);
  });

  it('v0.4 : valeurs numériques sorties de la colonne état', () => {
    const a025 = d.assertionsV04.find((a) => a.id === 'A025');
    expect(a025?.state).toBe('PRESENT');
    expect(a025?.value).toBe('1');
    expect(a025?.supersededBy).toBe('V05A010');
  });

  it('A04 : UNKNOWN n’est jamais libellé comme absent, faux ou non', () => {
    for (const label of [STATE_LABEL.UNKNOWN, STATE_SHORT.UNKNOWN]) {
      expect(label).not.toMatch(/absent|faux|non\b|nié/i);
    }
  });

  it('A07 : Krampus et Rudolph ne sont jamais rattachés à Santa Claus', () => {
    const kram = d.occurrences.find((o) => o.id === 'O10_KRAM');
    const rud = d.occurrences.find((o) => o.id === 'O11_RUD');
    expect(kram?.characterId).toBe('C_KRAMPUS');
    expect(rud?.characterId).toBe('C_RUDOLPH');
    const x04 = d.relationsV05.find((r) => r.id === 'X04');
    expect(x04?.status).toBe('REJECTED');
  });

  it('Sand 1855 rattachée au Père Noël, pas à Santa Claus', () => {
    expect(d.sourcesV04.find((s) => s.id === 'D019')?.characterIds).toEqual(['C_PERE_NOEL']);
    expect(d.sourcesV05.find((s) => s.id === 'S05')?.characterIds).toEqual(['C_PERE_NOEL']);
  });
});
