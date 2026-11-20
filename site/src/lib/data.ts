/**
 * Chargement build-time des CSV publiés (data/source/) et adaptateurs versionnés.
 *
 * Règles : les fichiers d'origine ne sont jamais réécrits ; les corrections
 * v0.5.1 sur la v0.4 sont des SURCOUCHES tracées (champ `corrections`) ; les
 * corpus v0.4 et v0.5 restent séparés et ne sont reliés que par la table de
 * correspondance explicite, jamais par ressemblance de titre.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseCsv, type CsvRecord } from './csv.ts';
import {
  STATES,
  type Assertion,
  type Character,
  type CorrectionRecord,
  type Crosswalk,
  type Dataset,
  type Occurrence,
  type Relation,
  type SourceEntry,
  type State,
  type VocabEntry,
} from './model.ts';

export const DATA_DIR = process.env['TFIC_DATA_DIR'] ?? join(process.cwd(), 'data', 'source');

export const DATA_FILES = {
  v05_sources: 'v05_sources_critiques.csv',
  v05_assertions: 'v05_assertions_pilote.csv',
  v05_relations: 'v05_relations.csv',
  v05_occurrences: 'v05_occurrences.csv',
  v05_characters: 'v05_personnages.csv',
  v05_vocabulary: 'v05_vocabulaire.csv',
  v05_corrections: 'v05_corrections.csv',
  v05_crosswalk: 'v05_correspondance_v04_v05.csv',
  v04_registry: 'v04_registre_sources.csv',
  v04_assertions: 'v04_assertions.csv',
  v04_relations: 'v04_relations.csv',
} as const;

export type DataFileKey = keyof typeof DATA_FILES;

export function readRaw(key: DataFileKey, dir = DATA_DIR): string {
  return readFileSync(join(dir, DATA_FILES[key]), 'utf-8');
}

function load(key: DataFileKey, dir: string): CsvRecord[] {
  return parseCsv(readRaw(key, dir), DATA_FILES[key]);
}

const f = (r: CsvRecord, k: string): string => r[k] ?? '';

function years(label: string): [number | null, number | null] {
  const ys = (label.match(/\d{4}/g) ?? []).map(Number);
  if (ys.length === 0) return [null, null];
  return [Math.min(...ys), Math.max(...ys)];
}

export const CHARACTER_SLUGS: Record<string, string> = {
  C_NICHOLAS: 'saint-nicolas',
  C_SINTERKLAAS: 'sinterklaas',
  C_SANTA_CLAUS: 'santa-claus',
  C_FATHER_CHRISTMAS: 'father-christmas',
  C_PERE_NOEL: 'pere-noel',
  C_KNECHT: 'serviteur-de-sinterklaas',
  C_KRAMPUS: 'krampus',
  C_PERE_FOUETTARD: 'pere-fouettard',
  C_RUDOLPH: 'rudolph',
};

/** Catégories du registre v0.4 -> personnages. Étiquettes de catalogue, pas vérité terrain. */
const V04_CATEGORY: Record<string, string[]> = {
  Nicholas: ['C_NICHOLAS'],
  Sinterklaas: ['C_SINTERKLAAS'],
  Santa: ['C_SANTA_CLAUS'],
  FatherChristmas: ['C_FATHER_CHRISTMAS'],
  Krampus: ['C_KRAMPUS'],
  Rudolph: ['C_RUDOLPH'],
  mixed_Santa_FatherChristmas: ['C_SANTA_CLAUS', 'C_FATHER_CHRISTMAS'],
};

/** Surcouches de correction v0.5.1 sur le registre v0.4 (cf. v05_corrections.csv). */
const V04_SOURCE_OVERLAYS: Record<string, (s: SourceEntry) => void> = {
  D005: (s) => {
    s.dateLabel = '1616–1617 probable (registre v0.4 : 1610)';
    s.startYear = 1615;
    s.endYear = 1617;
    s.corrections.push(
      'K11 — Datation 1610 non retenue : le témoin Folger J.a.1 est daté 1615, représentation 1616–1617 probable (v0.5, C1).',
    );
  },
  D019: (s) => {
    s.characterIds = ['C_PERE_NOEL'];
    s.corrections.push('Le registre v0.4 classe cette notice « Santa » ; le témoin dit « père Noël » (v0.5.1, correspondance S05).');
  },
  D023: (s) => {
    s.corrections.push(
      'Date 1864 issue de la LOC ; le texte effectivement consulté (v0.5, S07) est l’édition 1878. Préface datée 1853 : ne date pas les scènes.',
    );
  },
  D047: (s) => {
    s.url = 'https://americanhistory.si.edu/collections/object/nmah_1200958';
    s.corrections.push('K13 — URL Smithsonian harmonisée avec S11.');
  },
};

function adaptSourcesV05(rows: CsvRecord[], occ: Occurrence[]): SourceEntry[] {
  return rows.map((r) => {
    const id = f(r, 'source_id');
    const [startYear, endYear] = years(f(r, 'edition_date'));
    const note = f(r, 'correction_note');
    return {
      id,
      corpus: 'v0.5',
      title: f(r, 'title'),
      creator: f(r, 'creator'),
      dateLabel: f(r, 'edition_date'),
      startYear,
      endYear,
      witness: f(r, 'witness'),
      area: f(r, 'context'),
      medium: f(r, 'medium'),
      evidenceGrade: f(r, 'access_grade'),
      url: f(r, 'url'),
      repository: '',
      locator: f(r, 'locator'),
      limitations: f(r, 'limitations'),
      workFamily: f(r, 'work_family'),
      characterIds: [...new Set(occ.filter((o) => o.sourceId === id).map((o) => o.characterId))],
      registryCharacter: '',
      corrections: note ? [note] : [],
    };
  });
}

function adaptSourcesV04(rows: CsvRecord[]): SourceEntry[] {
  return rows.map((r) => {
    const start = Number(f(r, 'start_year'));
    const end = Number(f(r, 'end_year'));
    const s: SourceEntry = {
      id: f(r, 'id'),
      corpus: 'v0.4',
      title: f(r, 'title'),
      creator: '',
      dateLabel: start === end ? String(start) : `${start}–${end}`,
      startYear: Number.isFinite(start) ? start : null,
      endYear: Number.isFinite(end) ? end : null,
      witness: f(r, 'verified_detail'),
      area: f(r, 'country'),
      medium: f(r, 'medium'),
      evidenceGrade: f(r, 'evidence_level'),
      url: f(r, 'url'),
      repository: f(r, 'repository'),
      locator: '',
      limitations: f(r, 'limitations'),
      workFamily: f(r, 'work_family'),
      characterIds: V04_CATEGORY[f(r, 'character')] ?? [],
      registryCharacter: f(r, 'character'),
      corrections: [],
    };
    V04_SOURCE_OVERLAYS[s.id]?.(s);
    return s;
  });
}

function asState(raw: string, where: string): State {
  if ((STATES as readonly string[]).includes(raw)) return raw as State;
  throw new Error(`${where}: état non admis « ${raw} »`);
}

function adaptAssertionsV05(rows: CsvRecord[]): Assertion[] {
  return rows.map((r) => {
    const id = f(r, 'assertion_id');
    const note = f(r, 'correction_note');
    return {
      id,
      corpus: 'v0.5',
      sourceId: f(r, 'source_id'),
      occurrenceId: f(r, 'occurrence_id') || null,
      trait: f(r, 'trait'),
      state: asState(f(r, 'state'), id),
      value: f(r, 'value') || null,
      locator: f(r, 'locator'),
      evidenceGrade: f(r, 'evidence_grade'),
      inference: f(r, 'inference'),
      annotator: f(r, 'annotator_id'),
      note: f(r, 'note'),
      corrections: note ? [note] : [],
      supersededBy: null,
    };
  });
}

/** v0.4 : la colonne `state` contient parfois une VALEUR (1, 8). Normalisation tracée. */
const V04_SUPERSEDED: Record<string, string> = { A025: 'V05A010' };

function adaptAssertionsV04(rows: CsvRecord[]): Assertion[] {
  return rows.map((r) => {
    const id = f(r, 'assertion_id');
    const raw = f(r, 'state');
    const corrections: string[] = [];
    let state: State;
    let value: string | null = null;
    if (/^\d+$/.test(raw)) {
      state = 'PRESENT';
      value = raw;
      corrections.push(`K10 — Valeur « ${raw} » trouvée dans la colonne état : normalisée en PRESENT, valeur ${raw}.`);
    } else {
      state = asState(raw, id);
    }
    const sup = V04_SUPERSEDED[id] ?? null;
    if (sup) corrections.push(`K14 — Remplacée par ${sup} (v0.5) : nombre de rennes non établi dans le texte de 1821.`);
    return {
      id,
      corpus: 'v0.4',
      sourceId: f(r, 'document_id'),
      occurrenceId: null,
      trait: f(r, 'trait'),
      state,
      value,
      locator: f(r, 'evidence_locator'),
      evidenceGrade: f(r, 'evidence_class'),
      inference: '',
      annotator: 'PILOT_EDITOR_V04',
      note: f(r, 'limitation'),
      corrections,
      supersededBy: sup,
    };
  });
}

function adaptRelationsV05(rows: CsvRecord[]): Relation[] {
  return rows.map((r) => {
    const note = f(r, 'correction_note');
    return {
      id: f(r, 'relation_id'),
      corpus: 'v0.5',
      subject: f(r, 'subject'),
      object: f(r, 'object'),
      relation: f(r, 'relation'),
      evidenceSourceIds: f(r, 'evidence_source_ids').split(';').filter(Boolean),
      proofUrl: '',
      locator: f(r, 'locator'),
      status: f(r, 'status'),
      note: f(r, 'note'),
      corrections: note ? [note] : [],
    };
  });
}

function adaptRelationsV04(rows: CsvRecord[]): Relation[] {
  return rows.map((r) => {
    const rel: Relation = {
      id: f(r, 'id'),
      corpus: 'v0.4',
      subject: f(r, 'left'),
      object: f(r, 'right'),
      relation: f(r, 'relation'),
      evidenceSourceIds: [],
      proofUrl: f(r, 'proof_url'),
      locator: f(r, 'scope'),
      status: f(r, 'evidence_status'),
      note: '',
      corrections: [],
    };
    if (rel.id === 'R005') {
      rel.proofUrl = 'https://americanhistory.si.edu/collections/object/nmah_1200958';
      rel.corrections.push('K13 — URL Smithsonian harmonisée.');
    }
    if (rel.id === 'R007') {
      rel.corrections.push('K12 — « 1610 » : datation Jonson à lire 1616–1617 probable (v0.5, C1).');
    }
    return rel;
  });
}

export function loadDataset(dir = DATA_DIR): Dataset {
  const occurrences: Occurrence[] = load('v05_occurrences', dir).map((r) => ({
    id: f(r, 'occurrence_id'),
    sourceId: f(r, 'source_id'),
    characterId: f(r, 'character_id'),
    designation: f(r, 'designation_in_witness'),
    note: f(r, 'note'),
  }));
  const characters: Character[] = load('v05_characters', dir).map((r) => {
    const id = f(r, 'character_id');
    return {
      id,
      label: f(r, 'label_fr'),
      kind: f(r, 'kind') as Character['kind'],
      note: f(r, 'note'),
      slug: CHARACTER_SLUGS[id] ?? id.toLowerCase(),
    };
  });
  const vocabulary: VocabEntry[] = load('v05_vocabulary', dir).map((r) => ({
    domain: f(r, 'domain'),
    code: f(r, 'code'),
    kind: f(r, 'kind'),
    definition: f(r, 'definition'),
  }));
  const crosswalk: Crosswalk[] = load('v05_crosswalk', dir).map((r) => ({
    v05: f(r, 'v05_source_id'),
    v04: f(r, 'v04_id'),
    link: f(r, 'link'),
    note: f(r, 'note'),
  }));
  const corrections: CorrectionRecord[] = load('v05_corrections', dir).map((r) => ({
    id: f(r, 'correction_id'),
    file: f(r, 'file'),
    recordId: f(r, 'record_id'),
    field: f(r, 'field'),
    before: f(r, 'before'),
    after: f(r, 'after'),
    reason: f(r, 'reason'),
  }));
  return {
    sourcesV05: adaptSourcesV05(load('v05_sources', dir), occurrences),
    sourcesV04: adaptSourcesV04(load('v04_registry', dir)),
    occurrences,
    characters,
    assertionsV05: adaptAssertionsV05(load('v05_assertions', dir)),
    assertionsV04: adaptAssertionsV04(load('v04_assertions', dir)),
    relationsV05: adaptRelationsV05(load('v05_relations', dir)),
    relationsV04: adaptRelationsV04(load('v04_relations', dir)),
    vocabulary,
    crosswalk,
    corrections,
  };
}

let cached: Dataset | null = null;
/** Jeu de données mis en cache pour la compilation des pages. */
export function dataset(): Dataset {
  cached ??= loadDataset();
  return cached;
}
