/** Comptes affichés : uniquement des comptes de records, jamais des performances. */
import type { Dataset } from './model.ts';

export interface PublicStats {
  v04Records: number;
  v04WorkFamilies: number;
  v05Witnesses: number;
  v05Assertions: number;
  v05AssertionStates: Record<string, number>;
  v05Relations: number;
  stimulusCandidates: number;
  crosswalkLinks: number;
  participants: 0;
  independentCoders: 0;
  modelMetrics: null;
}

/** 12 candidats stimuli : manifeste NON publié (étiquettes de développement), seul le compte l'est. */
export const STIMULUS_CANDIDATES = 12;

export function publicStats(d: Dataset): PublicStats {
  const states: Record<string, number> = {};
  for (const a of d.assertionsV05) states[a.state] = (states[a.state] ?? 0) + 1;
  return {
    v04Records: d.sourcesV04.length,
    v04WorkFamilies: new Set(d.sourcesV04.map((s) => s.workFamily)).size,
    v05Witnesses: d.sourcesV05.length,
    v05Assertions: d.assertionsV05.length,
    v05AssertionStates: states,
    v05Relations: d.relationsV05.length,
    stimulusCandidates: STIMULUS_CANDIDATES,
    crosswalkLinks: d.crosswalk.length,
    participants: 0,
    independentCoders: 0,
    modelMetrics: null,
  };
}
