import { PieSlice } from './models';

export interface PieArc {
  d: string;
  slice: PieSlice;
  percent: number;
}

const TAU = Math.PI * 2;
const FULL = TAU - 1e-6;

function point(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function donutCircle(cx: number, cy: number, outer: number, inner: number): string {
  return [
    `M ${cx - outer} ${cy}`,
    `A ${outer} ${outer} 0 1 1 ${cx + outer} ${cy}`,
    `A ${outer} ${outer} 0 1 1 ${cx - outer} ${cy}`,
    `M ${cx - inner} ${cy}`,
    `A ${inner} ${inner} 0 1 0 ${cx + inner} ${cy}`,
    `A ${inner} ${inner} 0 1 0 ${cx - inner} ${cy}`,
  ].join(' ');
}

function donutSlice(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
): string {
  const large = end - start > Math.PI ? 1 : 0;
  const a = point(cx, cy, outer, start);
  const b = point(cx, cy, outer, end);
  const c = point(cx, cy, inner, end);
  const d = point(cx, cy, inner, start);
  return [
    `M ${a.x} ${a.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y}`,
    `L ${c.x} ${c.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${d.x} ${d.y}`,
    'Z',
  ].join(' ');
}

export function pieArcs(
  slices: PieSlice[],
  cx = 80,
  cy = 80,
  outer = 72,
  inner = 40,
): PieArc[] {
  const live = slices.filter((slice) => slice.value > 0);
  const total = live.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) {
    return [];
  }

  let angle = -Math.PI / 2;
  return live.map((slice) => {
    const sweep = (slice.value / total) * TAU;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    const d =
      sweep >= FULL || live.length === 1
        ? donutCircle(cx, cy, outer, inner)
        : donutSlice(cx, cy, outer, inner, start, end);
    const raw = (slice.value / total) * 100;
    const percent = Number.isInteger(raw) ? raw : Math.round(raw * 10) / 10;
    return { d, slice, percent };
  });
}
