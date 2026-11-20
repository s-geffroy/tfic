/** Deux axes de version distincts : science (corpus/théorie) et site (logiciel). */
export const SCIENCE_VERSION = '0.5.1';
export const SCIENCE_STATUS = 'DRAFT' as const;
export const SCIENCE_DATE = '2026-11-20';
export const SITE_VERSION = '1.0.0';
export const ALLOWED_STATUSES = ['DRAFT', 'EXPERIMENTAL', 'NOT_TESTED'] as const;

export interface VersionRecord {
  version: string;
  date: string;
  status: (typeof ALLOWED_STATUSES)[number];
  summary: string;
}

export const VERSION_HISTORY: readonly VersionRecord[] = [
  {
    version: '0.3.0',
    date: '2026-11-13',
    status: 'DRAFT',
    summary: 'Cadre formel : quatre relations distinctes, invariants I1–I8, propositions P1–P4, corpus de 13 sources.',
  },
  {
    version: '0.4.0',
    date: '2026-11-13',
    status: 'DRAFT',
    summary: 'Registre large de 51 notices, 66 assertions, 7 relations ; benchmark M0/M1/M2 déclaré BLOQUÉ.',
  },
  {
    version: '0.5.0',
    date: '2026-11-13',
    status: 'DRAFT',
    summary: 'Audit des témoins primaires (Jonson, Karl Krinken, attributions), 11 témoins ciblés, codebook et protocole non exécuté.',
  },
  {
    version: '0.5.1',
    date: '2026-11-20',
    status: 'DRAFT',
    summary: 'Revue critique : vocabulaire contrôlé, occurrences et personnages explicites, 15 corrections tracées, vérificateur durci.',
  },
];
