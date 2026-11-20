/** Libellés d'affichage. UNKNOWN ne se rend JAMAIS comme « absent », « non » ou « faux ». */
import type { State } from './model.ts';

export const STATE_LABEL: Record<State, string> = {
  PRESENT: 'attesté',
  ABSENT: 'nié explicitement',
  UNKNOWN: 'indéterminé (la source ne permet pas de conclure)',
  CONFLICT: 'témoins contradictoires',
  NA: 'non applicable',
};

export const STATE_SHORT: Record<State, string> = {
  PRESENT: 'attesté',
  ABSENT: 'nié',
  UNKNOWN: 'indéterminé',
  CONFLICT: 'conflit',
  NA: 's.o.',
};

export const GRADE_LABEL: Record<string, string> = {
  EDITORIAL_TRANSCRIPTION: 'Transcription éditoriale (pas d’inspection matérielle)',
  MODERN_RECENSION: 'Recension moderne (graphie d’origine non garantie)',
  PAGE_TRANSCRIPTION: 'Transcription de page identifiée',
  EDITION_TRANSCRIPTION: 'Transcription d’une édition datée',
  CATALOGUE_DESCRIPTION: 'Description de catalogue (codage non indépendant)',
  CATALOGUE_OBJECT: 'Notice d’objet institutionnelle',
  TRANSLATION_SECONDARY: 'Traduction moderne (original non vérifié)',
  catalogue: 'Notice de catalogue',
  secondary_trace: 'Trace secondaire',
  transcription: 'Transcription',
  translation: 'Traduction',
  corporate: 'Source d’entreprise (intéressée)',
  explicit: 'Mention explicite (catalogue)',
  secondary: 'Source secondaire',
  unknown: 'Non établi',
};

export function gradeLabel(code: string): string {
  return GRADE_LABEL[code] ?? code;
}

export const MEDIUM_LABEL: Record<string, string> = {
  theatre: 'théâtre',
  play: 'théâtre',
  poem: 'poème',
  illustrated_book: 'livre illustré',
  childrens_book: 'livre pour enfants',
  autobiography: 'autobiographie',
  engraving: 'gravure',
  etching: 'eau-forte',
  novel: 'roman',
  satire_cover: 'couverture satirique',
  cartoon: 'dessin de presse',
  memoir: 'récit',
  promotional_booklet: 'livret promotionnel',
  art_object: 'objet d’art',
  stained_glass: 'vitrail',
  painting: 'peinture',
  icon: 'icône',
  pamphlet: 'pamphlet',
  book_illustration: 'illustration de livre',
  photograph: 'photographie',
  stereograph: 'stéréographie',
  advertising_campaign: 'campagne publicitaire (série)',
  newspaper: 'presse',
};

export function mediumLabel(code: string): string {
  return MEDIUM_LABEL[code] ?? code.replace(/_/g, ' ');
}
