/** Mise en page déterministe (build-time) : x = année, y = couloir de personnage. */
import type { Graph, GraphEdge, GraphNode } from './graph.ts';
import type { EdgeCategory } from './semantics.ts';

export interface PlacedNode extends GraphNode {
  x: number;
  y: number;
  /** Décalage vertical de l'étiquette : alterne dessous/dessus dans un couloir. */
  labelDy: number;
}
export interface PlacedEdge extends GraphEdge {
  path: string;
  lx: number;
  ly: number;
}
export interface Layout {
  width: number;
  height: number;
  nodes: PlacedNode[];
  edges: PlacedEdge[];
  lanes: { id: string; label: string; y: number }[];
  ticks: { year: number; x: number }[];
}

export const EDGE_STYLE: Record<EdgeCategory, { dash: string; code: string }> = {
  distinction: { dash: '', code: '≠' },
  association: { dash: '8 4', code: '+' },
  filiation_hypothetique: { dash: '2 5', code: '?' },
  etiquette_catalogue: { dash: '12 4 2 4', code: '≡ét.' },
  identite_rejetee: { dash: '3 3', code: '✕=' },
};

const LANE_ORDER = [
  'C_NICHOLAS',
  'C_KRAMPUS',
  'C_SINTERKLAAS',
  'C_KNECHT',
  'C_FATHER_CHRISTMAS',
  'C_PERE_NOEL',
  'C_SANTA_CLAUS',
  'C_RUDOLPH',
];

export function layoutGraph(g: Graph): Layout {
  const laneIds = [...new Set(g.nodes.map((n) => n.lane))].sort(
    (a, b) => (LANE_ORDER.indexOf(a) + 100 * Number(!LANE_ORDER.includes(a))) - (LANE_ORDER.indexOf(b) + 100 * Number(!LANE_ORDER.includes(b))),
  );
  const laneH = 64;
  const top = 40;
  const left = 170;
  const right = 120;
  const width = 960;
  const years = g.nodes.map((n) => n.year).filter((y): y is number => y !== null);
  const minY = Math.floor((Math.min(...years) - 10) / 50) * 50;
  const maxY = Math.ceil((Math.max(...years) + 10) / 50) * 50;
  const span = Math.max(1, maxY - minY);
  const plotW = width - left - right;
  const xOf = (y: number | null) => (y === null ? width - right / 2 : left + ((y - minY) / span) * plotW);
  const lanes = laneIds.map((id, i) => ({
    id,
    label: g.nodes.find((n) => n.lane === id)?.laneLabel ?? id,
    y: top + i * laneH + laneH / 2,
  }));
  const laneY = new Map(lanes.map((l) => [l.id, l.y]));

  // Décale les nœuds d'un même couloir trop proches horizontalement.
  const placed: PlacedNode[] = [];
  for (const n of [...g.nodes].sort((a, b) => (a.year ?? 1e9) - (b.year ?? 1e9))) {
    let x = xOf(n.year);
    const y0 = laneY.get(n.lane) ?? top;
    let y = y0;
    const clash = placed.filter((p) => p.lane === n.lane && Math.abs(p.x - x) < 26).length;
    if (clash > 0) {
      y = y0 + (clash % 2 === 1 ? -14 : 14);
      x += 6 * clash;
    }
    const rank = placed.filter((p) => p.lane === n.lane).length;
    placed.push({ ...n, x, y, labelDy: rank % 2 === 0 ? 20 : -12 });
  }
  const pos = new Map(placed.map((p) => [p.id, p]));
  const edges: PlacedEdge[] = g.edges.map((e, i) => {
    const a = pos.get(e.from);
    const b = pos.get(e.to);
    if (!a || !b) throw new Error(`arête ${e.id} : nœud manquant`);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const bend = 28 + (i % 3) * 10;
    const cx = mx;
    const cy = my - bend;
    return { ...e, path: `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`, lx: cx, ly: my - bend / 2 };
  });
  const ticks: { year: number; x: number }[] = [];
  const step = span > 300 ? 50 : 25;
  for (let y = minY; y <= maxY; y += step) ticks.push({ year: y, x: xOf(y) });
  return { width, height: top + lanes.length * laneH + 30, nodes: placed, edges, lanes, ticks };
}
