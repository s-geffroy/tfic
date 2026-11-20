/**
 * Règles BLOQUANTES de publication (spec v1.0 §5) + contrôles du vérificateur
 * v0.5.1. Toute erreur fait échouer `npm run build`.
 */
import type { Dataset, Relation } from './model.ts';
import { IDENTITY_RELATIONS, LINEAGE_RELATIONS, edgeCategory, edgeEvidence } from './semantics.ts';

export interface ValidationReport {
  errors: string[];
  checks: Record<string, boolean>;
}

const COMPANIONS = new Set(['C_KRAMPUS', 'C_KNECHT', 'C_PERE_FOUETTARD', 'C_RUDOLPH']);
/** Paires que la publication ne doit JAMAIS présenter comme identiques. */
const FORBIDDEN_IDENTITY = /krampus|rudolph|knecht|servant|fouettard/i;

export function validateDataset(d: Dataset): ValidationReport {
  const errors: string[] = [];
  const checks: Record<string, boolean> = {};
  const rule = (name: string, problems: string[]) => {
    checks[name] = problems.length === 0;
    for (const p of problems) errors.push(`[${name}] ${p}`);
  };
  const vocab = (domain: string) => new Set(d.vocabulary.filter((v) => v.domain === domain).map((v) => v.code));

  const sid05 = new Set(d.sourcesV05.map((s) => s.id));
  const sid04 = new Set(d.sourcesV04.map((s) => s.id));
  const occ = new Map(d.occurrences.map((o) => [o.id, o]));
  const chars = new Set(d.characters.map((c) => c.id));

  // R8 — identifiants uniques, y compris entre corpus.
  const dupes = (ids: string[]) => ids.filter((x, i) => ids.indexOf(x) !== i);
  rule('ids_uniques', [
    ...dupes([...d.sourcesV05, ...d.sourcesV04].map((s) => s.id)).map((x) => `source dupliquée ${x}`),
    ...dupes([...d.assertionsV05, ...d.assertionsV04].map((a) => a.id)).map((x) => `assertion dupliquée ${x}`),
    ...dupes([...d.relationsV05, ...d.relationsV04].map((r) => r.id)).map((x) => `relation dupliquée ${x}`),
    ...dupes(d.occurrences.map((o) => o.id)).map((x) => `occurrence dupliquée ${x}`),
    ...dupes(d.characters.map((c) => c.id)).map((x) => `personnage dupliqué ${x}`),
  ]);

  // R1 — intégrité référentielle.
  rule('references', [
    ...d.assertionsV05.filter((a) => !sid05.has(a.sourceId)).map((a) => `${a.id} → source inconnue ${a.sourceId}`),
    ...d.assertionsV04.filter((a) => !sid04.has(a.sourceId)).map((a) => `${a.id} → notice inconnue ${a.sourceId}`),
    ...d.assertionsV05
      .filter((a) => !a.occurrenceId || !occ.has(a.occurrenceId))
      .map((a) => `${a.id} → occurrence inconnue ${a.occurrenceId ?? '∅'}`),
    ...d.assertionsV05
      .filter((a) => a.occurrenceId && occ.get(a.occurrenceId)?.sourceId !== a.sourceId)
      .map((a) => `${a.id} : occurrence et source incohérentes`),
    ...d.occurrences.filter((o) => !sid05.has(o.sourceId)).map((o) => `${o.id} → source inconnue`),
    ...d.occurrences.filter((o) => !chars.has(o.characterId)).map((o) => `${o.id} → personnage inconnu`),
    ...d.relationsV05
      .filter((r) => !(occ.has(r.subject) || chars.has(r.subject)) || !(occ.has(r.object) || chars.has(r.object)))
      .map((r) => `${r.id} : extrémité inexistante`),
    ...d.relationsV05.flatMap((r) =>
      r.evidenceSourceIds.filter((s) => !sid05.has(s)).map((s) => `${r.id} → preuve inconnue ${s}`),
    ),
    ...d.crosswalk
      .filter((c) => !sid05.has(c.v05) || !sid04.has(c.v04))
      .map((c) => `correspondance ${c.v05}↔${c.v04} invalide`),
    ...d.sourcesV04.flatMap((s) => s.characterIds.filter((c) => !chars.has(c)).map((c) => `${s.id} → ${c}`)),
  ]);

  // R2 — états ; ABSENT jamais par silence : exige un localisateur explicite.
  const states = vocab('state');
  rule('etats', [
    ...[...d.assertionsV05, ...d.assertionsV04]
      .filter((a) => !states.has(a.state))
      .map((a) => `${a.id} : état ${a.state} hors vocabulaire`),
    ...[...d.assertionsV05, ...d.assertionsV04]
      .filter((a) => a.state === 'ABSENT' && a.locator.trim() === '')
      .map((a) => `${a.id} : ABSENT sans localisateur de négation explicite`),
    ...d.assertionsV05
      .filter((a) => ['UNKNOWN', 'CONFLICT', 'NA'].includes(a.state) && a.value !== null)
      .map((a) => `${a.id} : valeur renseignée pour un état ${a.state}`),
    ...d.assertionsV05
      .filter((a) => ['PRESENT', 'ABSENT'].includes(a.state) && a.value === null)
      .map((a) => `${a.id} : ${a.state} sans valeur`),
    ...d.assertionsV05.filter((a) => !a.locator).map((a) => `${a.id} : localisateur absent`),
  ]);

  // Vocabulaire contrôlé v0.5.1.
  const traits = vocab('trait');
  const grades = vocab('evidence_grade');
  const inferences = vocab('inference');
  const rels = vocab('relation');
  const statuses = vocab('relation_status');
  rule('vocabulaire', [
    ...d.assertionsV05.filter((a) => !traits.has(a.trait)).map((a) => `${a.id} : trait ${a.trait} non défini`),
    ...d.assertionsV05.filter((a) => !grades.has(a.evidenceGrade)).map((a) => `${a.id} : grade ${a.evidenceGrade}`),
    ...d.assertionsV05.filter((a) => !inferences.has(a.inference)).map((a) => `${a.id} : inférence ${a.inference}`),
    ...d.sourcesV05.filter((s) => !grades.has(s.evidenceGrade)).map((s) => `${s.id} : accès ${s.evidenceGrade}`),
    ...d.relationsV05.filter((r) => !rels.has(r.relation)).map((r) => `${r.id} : relation ${r.relation}`),
    ...d.relationsV05.filter((r) => !statuses.has(r.status)).map((r) => `${r.id} : statut ${r.status}`),
    ...[...d.relationsV05, ...d.relationsV04]
      .filter((r) => edgeCategory(r) === null)
      .map((r) => `${r.id} : relation ${r.relation} sans catégorie d'affichage`),
  ]);

  // R3 — dates : pas de date d'édition vide ; intervalles ordonnés.
  rule('dates', [
    ...[...d.sourcesV05, ...d.sourcesV04].filter((s) => !s.dateLabel).map((s) => `${s.id} : date absente`),
    ...[...d.sourcesV05, ...d.sourcesV04]
      .filter((s) => s.startYear !== null && s.endYear !== null && s.startYear > s.endYear)
      .map((s) => `${s.id} : intervalle inversé`),
    ...(d.sourcesV05.find((s) => s.id === 'S07')?.dateLabel === '1878' ? [] : ['S07 doit être daté 1878 (édition consultée)']),
  ]);

  // R4 — occurrences du même livre : même source, donc même work_family, et distinctes.
  const s07 = d.occurrences.filter((o) => o.sourceId === 'S07');
  rule('meme_livre_occurrences_distinctes', [
    ...(s07.length === 2 && new Set(s07.map((o) => o.characterId)).size === 2
      ? []
      : ['Karl Krinken (S07) doit porter deux occurrences de personnages distincts']),
    ...(d.relationsV05.some(
      (r) => r.subject === 'O07_SANTA' && r.object === 'O07_FC' && r.relation === 'distinct_roles_in_witness',
    )
      ? []
      : ['relation de distinction O07_SANTA / O07_FC manquante']),
  ]);

  // R6 — identité et filiation.
  const charOf = (n: string) => occ.get(n)?.characterId ?? n;
  const idProblems = (r: Relation): string[] => {
    const out: string[] = [];
    if (IDENTITY_RELATIONS.has(r.relation)) {
      if (!['REJECTED', 'UNKNOWN'].includes(r.status)) out.push(`${r.id} : identité ${r.status} (admis : REJECTED/UNKNOWN)`);
      const touchesCompanion =
        COMPANIONS.has(charOf(r.subject)) || COMPANIONS.has(charOf(r.object)) || FORBIDDEN_IDENTITY.test(`${r.subject} ${r.object}`);
      if (touchesCompanion && r.status !== 'REJECTED') out.push(`${r.id} : identité compagnon non rejetée`);
    }
    if (LINEAGE_RELATIONS.has(r.relation) && edgeEvidence(r) === 'attested') {
      out.push(`${r.id} : filiation promue au rang d'attestée (${r.status})`);
    }
    return out;
  };
  rule('identite_et_filiation', [...d.relationsV05, ...d.relationsV04].flatMap(idProblems));

  // R5 — niveau d'accès : aucun grade ne prétend une inspection de fac-similé.
  rule('pas_de_facsimile_pretendu', [
    ...[...d.sourcesV05, ...d.assertionsV05]
      .filter((x) => /FACSIMILE|ORIGINAL_INSPECTED/i.test(x.evidenceGrade))
      .map((x) => `${x.id} : grade ${x.evidenceGrade} non autorisé sans collation`),
  ]);

  // Annotation : une seule passe éditoriale déclarée, pas de faux annotateurs.
  rule('annotation_simple_declaree', [
    ...d.assertionsV05.filter((a) => a.annotator !== 'PILOT_EDITOR').map((a) => `${a.id} : annotateur ${a.annotator}`),
  ]);

  // Liens externes : https absolu.
  rule('urls', [
    ...[...d.sourcesV05, ...d.sourcesV04]
      .filter((s) => !/^https:\/\/[^\s]+$/.test(s.url))
      .map((s) => `${s.id} : URL non https « ${s.url} »`),
  ]);

  return { errors, checks };
}
