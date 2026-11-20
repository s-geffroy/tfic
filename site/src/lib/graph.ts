/**
 * Graphe typé et temporel. Les arêtes viennent EXCLUSIVEMENT des relations
 * déclarées (CSV) : aucune n'est calculée à partir de traits ou de similarités.
 */
import type { Dataset, Relation } from './model.ts';
import { edgeCategory, edgeEvidence, type EdgeCategory, type EdgeEvidence } from './semantics.ts';

export type GraphLevel = 'occurrences' | 'v04';

export interface GraphNode {
  id: string;
  label: string;
  year: number | null;
  lane: string;
  laneLabel: string;
  sourceId: string | null;
  kind: 'occurrence' | 'character' | 'v04_label';
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
  category: EdgeCategory;
  evidence: EdgeEvidence;
  status: string;
  locator: string;
  note: string;
  evidenceSourceIds: string[];
  proofUrl: string;
  corrections: string[];
}

export interface Graph {
  level: GraphLevel;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function toEdge(r: Relation): GraphEdge {
  const category = edgeCategory(r);
  if (!category) throw new Error(`relation ${r.id} sans catégorie`);
  return {
    id: r.id,
    from: r.subject,
    to: r.object,
    relation: r.relation,
    category,
    evidence: edgeEvidence(r),
    status: r.status,
    locator: r.locator,
    note: r.note,
    evidenceSourceIds: r.evidenceSourceIds,
    proofUrl: r.proofUrl,
    corrections: r.corrections,
  };
}

const V04_LANE: Record<string, string> = {
  FatherChristmas: 'C_FATHER_CHRISTMAS',
  Santa: 'C_SANTA_CLAUS',
  NastSanta: 'C_SANTA_CLAUS',
  Nicholas: 'C_NICHOLAS',
  Krampus: 'C_KRAMPUS',
  Sinterklaas: 'C_SINTERKLAAS',
  Servant: 'C_KNECHT',
  Rudolph: 'C_RUDOLPH',
};

export function buildGraph(d: Dataset, level: GraphLevel): Graph {
  const charLabel = new Map(d.characters.map((c) => [c.id, c.label]));
  if (level === 'occurrences') {
    const src = new Map(d.sourcesV05.map((s) => [s.id, s]));
    const nodes: GraphNode[] = d.occurrences.map((o) => ({
      id: o.id,
      label: `${o.designation} — ${src.get(o.sourceId)?.title ?? o.sourceId}`,
      year: src.get(o.sourceId)?.startYear ?? null,
      lane: o.characterId,
      laneLabel: charLabel.get(o.characterId) ?? o.characterId,
      sourceId: o.sourceId,
      kind: 'occurrence',
    }));
    const known = new Set(nodes.map((n) => n.id));
    for (const r of d.relationsV05) {
      for (const end of [r.subject, r.object]) {
        if (!known.has(end) && charLabel.has(end)) {
          nodes.push({ id: end, label: `${charLabel.get(end)} (personnage)`, year: null, lane: end, laneLabel: charLabel.get(end) ?? end, sourceId: null, kind: 'character' });
          known.add(end);
        }
      }
    }
    return { level, nodes, edges: d.relationsV05.map(toEdge) };
  }
  const nodes = new Map<string, GraphNode>();
  for (const r of d.relationsV04) {
    for (const end of [r.subject, r.object]) {
      if (nodes.has(end)) continue;
      const [name = end, scope = ''] = end.split('@');
      const y = scope.match(/\d{4}/);
      const lane = V04_LANE[name] ?? name;
      nodes.set(end, {
        id: end,
        label: `${name} @ ${scope}`,
        year: y ? Number(y[0]) : null,
        lane,
        laneLabel: charLabel.get(lane) ?? name,
        sourceId: null,
        kind: 'v04_label',
      });
    }
  }
  return { level, nodes: [...nodes.values()], edges: d.relationsV04.map(toEdge) };
}
