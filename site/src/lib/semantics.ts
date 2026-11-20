/**
 * Sémantique des relations : une seule table, utilisée par la validation, le
 * graphe et les tests. Aucune relation n'est jamais DÉDUITE d'une autre.
 */
import type { Relation } from './model.ts';

export type EdgeCategory =
  | 'distinction'
  | 'association'
  | 'filiation_hypothetique'
  | 'etiquette_catalogue'
  | 'identite_rejetee';

export const LINEAGE_RELATIONS = new Set([
  'historical_direct_descent',
  'documented_derivation',
  'hypothesized_cultural_continuity',
  'derived_from',
]);

export const IDENTITY_RELATIONS = new Set(['same_character', 'same_person', 'is_santa']);

const CATEGORY: Record<string, EdgeCategory> = {
  distinct_roles_in_witness: 'distinction',
  distinct_in_source: 'distinction',
  distinct_roles: 'distinction',
  accompanied_by: 'association',
  accompanies: 'association',
  associated_character: 'association',
  historical_direct_descent: 'filiation_hypothetique',
  documented_derivation: 'filiation_hypothetique',
  hypothesized_cultural_continuity: 'filiation_hypothetique',
  shared_catalogue_label: 'etiquette_catalogue',
  same_illustrated_named_character: 'etiquette_catalogue',
  same_character: 'identite_rejetee',
  same_person: 'identite_rejetee',
};

export function edgeCategory(rel: Relation): EdgeCategory | null {
  return CATEGORY[rel.relation] ?? null;
}

/** Statuts considérés comme ATTESTÉS (v0.5 : SUPPORTED* ; v0.4 : interprétation sourcée). */
const ATTESTED_V04 = new Set(['institutional_interpretation', 'translation', 'catalogue']);

export type EdgeEvidence = 'attested' | 'hypothesis' | 'rejected';

export function edgeEvidence(rel: Relation): EdgeEvidence {
  if (rel.status === 'REJECTED') return 'rejected';
  if (rel.corpus === 'v0.5') return rel.status.startsWith('SUPPORTED') ? 'attested' : 'hypothesis';
  return ATTESTED_V04.has(rel.status) ? 'attested' : 'hypothesis';
}

export const CATEGORY_LABEL: Record<EdgeCategory, string> = {
  distinction: 'Distinction dans le témoin',
  association: 'Association / accompagnement',
  filiation_hypothetique: 'Filiation non documentée (hypothèse)',
  etiquette_catalogue: 'Même étiquette de catalogue',
  identite_rejetee: 'Identité rejetée (contrôle négatif)',
};

export const RELATION_LABEL: Record<string, string> = {
  distinct_roles_in_witness: 'rôles distincts dans le même témoin',
  distinct_in_source: 'distincts dans la source',
  distinct_roles: 'rôles distincts',
  accompanied_by: 'accompagné par',
  accompanies: 'accompagne',
  associated_character: 'personnage associé',
  historical_direct_descent: 'descendance historique directe',
  documented_derivation: 'dérivation documentée',
  hypothesized_cultural_continuity: 'continuité culturelle supposée',
  shared_catalogue_label: 'même étiquette de catalogue',
  same_illustrated_named_character: 'même personnage nommé (catalogue)',
  same_character: 'même personnage',
  same_person: 'même personne',
};
