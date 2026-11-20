/** Exports publiables : uniquement les fichiers de data/source (sélection explicite). */
import { createHash } from 'node:crypto';
import { DATA_FILES, dataset, readRaw, type DataFileKey } from './data.ts';
import { SCIENCE_DATE, SCIENCE_STATUS, SCIENCE_VERSION } from './version.ts';

export interface ExportFile {
  key: DataFileKey;
  name: string;
  bytes: number;
  sha256: string;
  description: string;
}

const DESCRIPTION: Record<DataFileKey, string> = {
  v05_sources: 'Témoins ciblés v0.5.1 (11)',
  v05_assertions: 'Pré-annotations v0.5.1, une passe éditoriale (46)',
  v05_relations: 'Relations typées v0.5.1 (7)',
  v05_occurrences: 'Occurrences v0.5.1 (14)',
  v05_characters: 'Personnages v0.5.1',
  v05_vocabulary: 'Vocabulaire contrôlé v0.5.1',
  v05_corrections: 'Journal des corrections v0.5.1',
  v05_crosswalk: 'Correspondance explicite v0.4 ↔ v0.5',
  v04_registry: 'Registre v0.4 d’origine (51 notices, non corrigé)',
  v04_assertions: 'Assertions v0.4 d’origine (non corrigées)',
  v04_relations: 'Relations v0.4 d’origine (non corrigées)',
};

export function exportFiles(): ExportFile[] {
  return (Object.keys(DATA_FILES) as DataFileKey[]).map((key) => {
    const raw = readRaw(key);
    return {
      key,
      name: DATA_FILES[key],
      bytes: Buffer.byteLength(raw, 'utf-8'),
      sha256: createHash('sha256').update(raw, 'utf-8').digest('hex'),
      description: DESCRIPTION[key],
    };
  });
}

export function jsonExport(): string {
  const d = dataset();
  return JSON.stringify(
    {
      project: 'TFIC-PN',
      science_version: SCIENCE_VERSION,
      status: SCIENCE_STATUS,
      date: SCIENCE_DATE,
      licence: 'CC BY-SA 4.0 (données dérivées) ; les sources citées restent sous les droits de leurs institutions',
      warning: 'Pré-annotation d’une seule passe éditoriale ; aucun résultat de reconnaissance humaine ; v0.4 normalisé avec surcouches de correction tracées.',
      human_participants: 0,
      independent_coders: 0,
      files: exportFiles().map(({ name, sha256, bytes }) => ({ name, sha256, bytes })),
      data: d,
    },
    null,
    2,
  );
}
