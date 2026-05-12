export interface SamplePoint {
  x: number;
  y: number | null;
  attained: boolean;
}

export interface CurveSegment {
  points: SamplePoint[];
  trimStart?: boolean;
  trimEnd?: boolean;
}

export interface SamplingResult {
  segments: CurveSegment[];
  xDomain: [number, number];
  yDomain: [number, number];
  trimmed: boolean;
}

type Evaluator = (x: number) => number | null;

const DEFAULT_SAMPLE_COUNT = 200;
const EDGE_TRIM_RATIO = 0.05;

export function sampleFunction(
  evaluator: Evaluator,
  interval: { left: number; right: number; includeLeft: boolean; includeRight: boolean },
  sampleCount = DEFAULT_SAMPLE_COUNT,
  finiteMarkers: { x: number; y: number }[] = []
): SamplingResult {
  const { left, right, includeLeft, includeRight } = interval;
  const range = right - left;

  const rawPoints: SamplePoint[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const x = left + t * range;
    const y = evaluator(x);

    let attained = true;
    if (i === 0 && !includeLeft) attained = false;
    if (i === sampleCount && !includeRight) attained = false;

    rawPoints.push({ x, y, attained });
  }

  if (includeLeft) {
    const leftY = evaluator(left);
    if (leftY !== null && !rawPoints[0].attained) {
      rawPoints[0] = { x: left, y: leftY, attained: true };
    }
  }

  const segments = splitSegments(rawPoints);
  const yDomainResult = computeYDomainFromInner(segments, finiteMarkers);
  const trimmed = yDomainResult.trimmed || segments.length > 1;

  return {
    segments,
    xDomain: [left, right],
    yDomain: yDomainResult.domain,
    trimmed,
  };
}

function splitSegments(points: SamplePoint[]): CurveSegment[] {
  if (points.length === 0) return [];

  const segments: CurveSegment[] = [];
  let current: SamplePoint[] = [];
  let currentTrimStart = false;
  let pendingTrimStart = false;

  const medianJump = computeMedianFiniteAdjacentJump(points);
  const allFinite = points.filter((p) => p.y !== null).map((p) => p.y!);
  const ySpan = allFinite.length >= 2 ? Math.max(...allFinite) - Math.min(...allFinite) : 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    if (p.y === null) {
      if (current.length > 0) {
        segments.push({ points: current, trimStart: currentTrimStart, trimEnd: true });
        current = [];
        currentTrimStart = false;
      }
      pendingTrimStart = true;
      continue;
    }

    if (current.length > 0) {
      const prev = current[current.length - 1];
      if (prev.y !== null && isSuspiciousJump(prev.y, p.y, medianJump, ySpan)) {
        segments.push({ points: current, trimStart: currentTrimStart, trimEnd: true });
        current = [];
        currentTrimStart = true;
      }
    }

    if (current.length === 0) {
      currentTrimStart = currentTrimStart || pendingTrimStart;
      pendingTrimStart = false;
    }

    current.push(p);
  }

  if (current.length > 0) {
    segments.push({ points: current, trimStart: currentTrimStart });
  }

  return segments;
}

function computeMedianFiniteAdjacentJump(points: SamplePoint[]): number {
  const jumps: number[] = [];
  let prevFinite: number | null = null;

  for (const p of points) {
    if (p.y !== null) {
      if (prevFinite !== null) {
        jumps.push(Math.abs(p.y - prevFinite));
      }
      prevFinite = p.y;
    } else {
      prevFinite = null;
    }
  }

  if (jumps.length === 0) return Infinity;

  jumps.sort((a, b) => a - b);
  const mid = Math.floor(jumps.length / 2);
  return jumps.length % 2 !== 0 ? jumps[mid] : (jumps[mid - 1] + jumps[mid]) / 2;
}

function isSuspiciousJump(prevY: number, currY: number, medianJump: number, ySpan: number): boolean {
  const absJump = Math.abs(currY - prevY);
  if (medianJump === 0 || ySpan === 0) return false;
  return absJump > 10 * medianJump && absJump > 0.1 * ySpan;
}

function computeYDomainFromInner(
  segments: CurveSegment[],
  markers: { x: number; y: number }[]
): { domain: [number, number]; trimmed: boolean } {
  const values: number[] = [];
  let trimmed = false;

  for (const seg of segments) {
    const { points } = seg;
    if (points.length < 3) continue;

    const startSkip = seg.trimStart ? edgeTrimCount(points) : 0;
    const endSkip = seg.trimEnd ? edgeTrimCount(points) : 0;
    const start = startSkip;
    const end = points.length - endSkip;

    if (startSkip > 0 || endSkip > 0) {
      trimmed = true;
    }

    for (let i = start; i < end; i++) {
      const p = points[i];
      if (p.y !== null && Number.isFinite(p.y)) {
        values.push(p.y);
      }
    }
  }

  for (const m of markers) {
    if (Number.isFinite(m.y)) {
      values.push(m.y);
    }
  }

  if (values.length === 0) return { domain: [-1, 1], trimmed };

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return { domain: [min - 1, max + 1], trimmed };
  }

  const padding = (max - min) * 0.05;
  return { domain: [min - padding, max + padding], trimmed };
}

function edgeTrimCount(points: SamplePoint[]): number {
  return Math.min(
    Math.max(3, Math.ceil(points.length * EDGE_TRIM_RATIO)),
    Math.floor(points.length / 4)
  );
}
