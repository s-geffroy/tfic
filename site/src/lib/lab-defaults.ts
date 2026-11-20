/** Valeurs SYNTHÉTIQUES du laboratoire : inventées pour l'exemple, pas tirées du corpus. */
import type { TraitSpec } from './similarity.ts';

export interface DemoTrait extends TraitSpec {
  label: string;
}

export const DEMO_TRAITS: readonly DemoTrait[] = [
  { key: 'white_beard', label: 'barbe blanche', kind: 'binary', weight: 1 },
  { key: 'red_coat', label: 'manteau rouge', kind: 'binary', weight: 1 },
  { key: 'child_gifts', label: 'dons aux enfants', kind: 'binary', weight: 2 },
  { key: 'reindeer_vehicle', label: 'rennes', kind: 'binary', weight: 1 },
  { key: 'moral_judgement', label: 'jugement moral', kind: 'binary', weight: 1.5 },
  { key: 'chimney_entry', label: 'cheminée', kind: 'binary', weight: 1 },
];

export const DEMO_A: Readonly<Record<string, boolean | null>> = {
  white_beard: true,
  red_coat: null,
  child_gifts: true,
  reindeer_vehicle: true,
  moral_judgement: true,
  chimney_entry: true,
};

export const DEMO_B: Readonly<Record<string, boolean | null>> = {
  white_beard: true,
  red_coat: true,
  child_gifts: true,
  reindeer_vehicle: false,
  moral_judgement: null,
  chimney_entry: true,
};
