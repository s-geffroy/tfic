/**
 * Similarité descriptive sur traits mixtes avec couverture (TFIC-PN v0.4).
 * d_w(i,j) = sqrt( Σ_{k∈K_ij} w_k δ_k² / Σ_{k∈K_ij} w_k ),  κ_ij = |K_ij| / |K|.
 * Un trait inconnu (null) n'est PAS un zéro : il sort de K_ij.
 * Cette fonction ne crée JAMAIS de relation : elle renvoie un nombre.
 */
export type TraitValue = number | boolean | string | null;
export type TraitKind = 'binary' | 'numeric' | 'nominal';

export interface TraitSpec {
  key: string;
  kind: TraitKind;
  weight: number;
  /** Étendue pour normaliser les numériques dans [0,1]. */
  range?: number;
}

export interface SimilarityResult {
  distance: number | null;
  coverage: number;
  compared: string[];
}

function delta(spec: TraitSpec, a: TraitValue, b: TraitValue): number {
  if (spec.kind === 'numeric') {
    const r = spec.range && spec.range > 0 ? spec.range : 1;
    return Math.min(1, Math.abs(Number(a) - Number(b)) / r);
  }
  return a === b ? 0 : 1;
}

export function weightedDistance(
  specs: readonly TraitSpec[],
  x: Record<string, TraitValue>,
  y: Record<string, TraitValue>,
  minCompared = 1,
): SimilarityResult {
  const compared = specs.filter((s) => x[s.key] != null && y[s.key] != null && s.weight > 0);
  const coverage = specs.length === 0 ? 0 : compared.length / specs.length;
  if (compared.length < minCompared) return { distance: null, coverage, compared: [] };
  let num = 0;
  let den = 0;
  for (const s of compared) {
    const dk = delta(s, x[s.key] ?? null, y[s.key] ?? null);
    num += s.weight * dk * dk;
    den += s.weight;
  }
  return { distance: Math.sqrt(num / den), coverage, compared: compared.map((s) => s.key) };
}

/** Relation de proximité par seuil : réflexive et symétrique, PAS transitive. */
export function near(a: number, b: number, threshold: number): boolean {
  return Math.abs(a - b) <= threshold;
}

/** Cherche un triplet (a,b,c) avec a~b, b~c mais non a~c dans une liste ordonnée. */
export function findIntransitiveTriple(points: readonly number[], threshold: number): [number, number, number] | null {
  for (const a of points)
    for (const b of points)
      for (const c of points)
        if (near(a, b, threshold) && near(b, c, threshold) && !near(a, c, threshold)) return [a, b, c];
  return null;
}
