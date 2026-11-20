/** Types publiés du site TFIC-PN. Un type par notion ; aucune fusion implicite. */

export const STATES = ['PRESENT', 'ABSENT', 'UNKNOWN', 'CONFLICT', 'NA'] as const;
export type State = (typeof STATES)[number];

export type Corpus = 'v0.4' | 'v0.5';

/** Notice ou témoin. v0.4 = registre large ; v0.5 = témoin ciblé. Jamais additionnés. */
export interface SourceEntry {
  id: string;
  corpus: Corpus;
  title: string;
  creator: string;
  /** Date telle qu'écrite par le témoin/registre (peut être incertaine : « 1616? »). */
  dateLabel: string;
  /** Bornes d'année pour tri/filtre uniquement ; null si non déterminable. */
  startYear: number | null;
  endYear: number | null;
  witness: string;
  area: string;
  medium: string;
  /** Niveau d'accès/preuve dans le vocabulaire de la version d'origine. */
  evidenceGrade: string;
  url: string;
  repository: string;
  locator: string;
  limitations: string;
  workFamily: string;
  /** Personnages rattachés (v0.5 : via occurrences ; v0.4 : catégorie du registre, corrigée). */
  characterIds: string[];
  /** v0.4 : catégorie de personnage du registre (étiquette de catalogue). */
  registryCharacter: string;
  /** Corrections apportées en surcouche (le fichier d'origine reste intact). */
  corrections: string[];
}

export interface Occurrence {
  id: string;
  sourceId: string;
  characterId: string;
  designation: string;
  note: string;
}

export interface Character {
  id: string;
  label: string;
  kind: 'individual' | 'type' | 'auxiliary' | 'family';
  note: string;
  slug: string;
}

export interface Assertion {
  id: string;
  corpus: Corpus;
  sourceId: string;
  occurrenceId: string | null;
  trait: string;
  state: State;
  value: string | null;
  locator: string;
  evidenceGrade: string;
  inference: string;
  annotator: string;
  note: string;
  corrections: string[];
  supersededBy: string | null;
}

export type RelationStatus = string;

export interface Relation {
  id: string;
  corpus: Corpus;
  subject: string;
  object: string;
  relation: string;
  evidenceSourceIds: string[];
  proofUrl: string;
  locator: string;
  status: RelationStatus;
  note: string;
  corrections: string[];
}

export interface VocabEntry {
  domain: string;
  code: string;
  kind: string;
  definition: string;
}

export interface Crosswalk {
  v05: string;
  v04: string;
  link: string;
  note: string;
}

export interface CorrectionRecord {
  id: string;
  file: string;
  recordId: string;
  field: string;
  before: string;
  after: string;
  reason: string;
}

export interface Dataset {
  sourcesV05: SourceEntry[];
  sourcesV04: SourceEntry[];
  occurrences: Occurrence[];
  characters: Character[];
  assertionsV05: Assertion[];
  assertionsV04: Assertion[];
  relationsV05: Relation[];
  relationsV04: Relation[];
  vocabulary: VocabEntry[];
  crosswalk: Crosswalk[];
  corrections: CorrectionRecord[];
}
