/** Tests négatifs : les validations DOIVENT échouer sur des données fautives. */
import { describe, expect, it } from 'vitest';
import { loadDataset } from '../src/lib/data.ts';
import type { Dataset, Relation } from '../src/lib/model.ts';
import { validateDataset } from '../src/lib/validate.ts';
import { buildGraph } from '../src/lib/graph.ts';
import { weightedDistance, findIntransitiveTriple } from '../src/lib/similarity.ts';

const fresh = (): Dataset => structuredClone(loadDataset());

function rel(over: Partial<Relation>): Relation {
  return {
    id: 'XTEST',
    corpus: 'v0.5',
    subject: 'O10_NICH',
    object: 'O10_KRAM',
    relation: 'accompanied_by',
    evidenceSourceIds: ['S10'],
    proofUrl: '',
    locator: 'test',
    status: 'SUPPORTED',
    note: '',
    corrections: [],
    ...over,
  };
}

describe('validation : cas fautifs rejetés', () => {
  it('filiation promue en SUPPORTED_CATALOGUE (trou du vérificateur v0.5.0)', () => {
    const d = fresh();
    d.relationsV05.push(rel({ relation: 'documented_derivation', status: 'SUPPORTED_CATALOGUE', subject: 'O02_SANTA', object: 'O03_SANTA' }));
    expect(validateDataset(d).checks['identite_et_filiation']).toBe(false);
  });

  it('identité Krampus = Nicolas non rejetée', () => {
    const d = fresh();
    d.relationsV05.push(rel({ relation: 'same_character', status: 'UNKNOWN' }));
    expect(validateDataset(d).checks['identite_et_filiation']).toBe(false);
  });

  it('identité Rudolph = Santa attestée', () => {
    const d = fresh();
    d.relationsV05.push(rel({ relation: 'same_character', status: 'SUPPORTED', subject: 'C_RUDOLPH', object: 'C_SANTA_CLAUS' }));
    expect(validateDataset(d).checks['identite_et_filiation']).toBe(false);
  });

  it('ABSENT créé par silence (sans localisateur)', () => {
    const d = fresh();
    const a = d.assertionsV05[0];
    if (!a) throw new Error('jeu vide');
    a.state = 'ABSENT';
    a.value = '0';
    a.locator = '';
    expect(validateDataset(d).checks['etats']).toBe(false);
  });

  it('trait hors vocabulaire (ex. children_gifts)', () => {
    const d = fresh();
    const a = d.assertionsV05[2];
    if (!a) throw new Error('jeu vide');
    a.trait = 'children_gifts';
    expect(validateDataset(d).checks['vocabulaire']).toBe(false);
  });

  it('extrémité de relation inexistante', () => {
    const d = fresh();
    d.relationsV05.push(rel({ object: 'O99_FANTOME' }));
    expect(validateDataset(d).checks['references']).toBe(false);
  });

  it('fusion des deux occurrences de Karl Krinken', () => {
    const d = fresh();
    d.occurrences = d.occurrences.map((o) => (o.id === 'O07_FC' ? { ...o, characterId: 'C_SANTA_CLAUS' } : o));
    expect(validateDataset(d).checks['meme_livre_occurrences_distinctes']).toBe(false);
  });

  it('S07 rétro-daté 1853', () => {
    const d = fresh();
    const s = d.sourcesV05.find((x) => x.id === 'S07');
    if (!s) throw new Error('S07 absent');
    s.dateLabel = '1853';
    expect(validateDataset(d).checks['dates']).toBe(false);
  });
});

describe('A06 : aucune arête créée par similarité', () => {
  it('deux occurrences quasi identiques ne produisent aucune arête', () => {
    const d = fresh();
    const before = buildGraph(d, 'occurrences').edges.length;
    const sim = weightedDistance(
      [{ key: 'white_beard', kind: 'binary', weight: 1 }, { key: 'chimney_entry', kind: 'binary', weight: 1 }],
      { white_beard: true, chimney_entry: true },
      { white_beard: true, chimney_entry: true },
    );
    expect(sim.distance).toBe(0);
    // Le graphe ne dépend que des relations déclarées : la similarité n'y entre pas.
    expect(buildGraph(d, 'occurrences').edges.length).toBe(before);
    expect(buildGraph(d, 'occurrences').edges.length).toBe(d.relationsV05.length);
  });

  it('les arêtes hypothétiques et rejetées sont marquées, pas attestées', () => {
    const g = buildGraph(fresh(), 'occurrences');
    const x05 = g.edges.find((e) => e.id === 'X05');
    const x04 = g.edges.find((e) => e.id === 'X04');
    expect(x05?.evidence).toBe('hypothesis');
    expect(x04?.evidence).toBe('rejected');
  });
});

describe('similarité', () => {
  it('un trait inconnu n’est pas un zéro : il sort de la couverture', () => {
    const specs = [
      { key: 'a', kind: 'binary' as const, weight: 1 },
      { key: 'b', kind: 'binary' as const, weight: 1 },
    ];
    const r = weightedDistance(specs, { a: true, b: null }, { a: true, b: false });
    expect(r.distance).toBe(0);
    expect(r.coverage).toBe(0.5);
  });
  it('refuse de calculer sans trait comparable', () => {
    const r = weightedDistance([{ key: 'a', kind: 'binary', weight: 1 }], { a: null }, { a: true });
    expect(r.distance).toBeNull();
  });
  it('P1 : proximité par seuil non transitive (0 ; 0,6 ; 1,2 au seuil 0,7)', () => {
    expect(findIntransitiveTriple([0, 0.6, 1.2], 0.7)).toEqual([0, 0.6, 1.2]);
  });
});
