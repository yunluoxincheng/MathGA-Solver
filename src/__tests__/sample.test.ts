import { sampleFunction } from "@/lib/math/sample";

function makeEvaluator(fn: (x: number) => number): (x: number) => number | null {
  return (x) => {
    try {
      const y = fn(x);
      return Number.isFinite(y) ? y : null;
    } catch {
      return null;
    }
  };
}

describe("sampleFunction", () => {
  it("samples a normal continuous function across the full interval", () => {
    const eval_ = makeEvaluator((x) => x * x);
    const result = sampleFunction(eval_, {
      left: 0,
      right: 2,
      includeLeft: true,
      includeRight: true,
    });

    expect(result.segments.length).toBe(1);
    expect(result.xDomain).toEqual([0, 2]);
    expect(result.yDomain[0]).toBeLessThan(0);
    expect(result.yDomain[1]).toBeGreaterThan(4);
  });

  it("creates a gap for sqrt invalid region (x < 0)", () => {
    const eval_ = makeEvaluator((x) => Math.sqrt(x));
    const result = sampleFunction(eval_, {
      left: -1,
      right: 1,
      includeLeft: true,
      includeRight: true,
    });

    expect(result.segments.length).toBeGreaterThanOrEqual(1);
    const validSeg = result.segments.find(
      (seg) => seg.points.length > 0 && seg.points[0].x >= 0
    );
    expect(validSeg).toBeDefined();
    const invalidSeg = result.segments.find(
      (seg) => seg.points.length > 0 && seg.points.every((p) => p.x < 0 && p.y === null)
    );
    expect(invalidSeg).toBeUndefined();
  });

  it("splits at reciprocal asymptote around x = 0", () => {
    const eval_ = makeEvaluator((x) => 1 / x);
    const result = sampleFunction(eval_, {
      left: -1,
      right: 1,
      includeLeft: true,
      includeRight: true,
    });

    expect(result.segments.length).toBeGreaterThanOrEqual(2);
  });

  it("respects open endpoint - excludes right endpoint sample", () => {
    const eval_ = makeEvaluator((x) => x);
    const result = sampleFunction(eval_, {
      left: 0,
      right: 1,
      includeLeft: true,
      includeRight: false,
    });

    const lastPoint = result.segments[result.segments.length - 1].points.at(-1)!;
    expect(lastPoint.attained).toBe(false);
  });

  it("respects open endpoint - excludes left endpoint sample", () => {
    const eval_ = makeEvaluator((x) => x);
    const result = sampleFunction(eval_, {
      left: 0,
      right: 1,
      includeLeft: false,
      includeRight: true,
    });

    const firstPoint = result.segments[0].points[0];
    expect(firstPoint.attained).toBe(false);
  });

  it("includes finite markers in y-domain", () => {
    const eval_ = makeEvaluator((x) => x * x);
    const result = sampleFunction(
      eval_,
      { left: 0, right: 2, includeLeft: true, includeRight: true },
      50,
      [{ x: 1, y: 100 }]
    );

    expect(result.yDomain[1]).toBeGreaterThan(100);
  });

  it("detects trimming when segments are split", () => {
    const eval_ = makeEvaluator((x) => 1 / x);
    const result = sampleFunction(eval_, {
      left: -1,
      right: 1,
      includeLeft: true,
      includeRight: true,
    });

    expect(result.trimmed).toBe(true);
  });

  it("y-domain excludes asymptote-adjacent extremes for reciprocal", () => {
    const eval_ = makeEvaluator((x) => 1 / x);
    const result = sampleFunction(eval_, {
      left: -1,
      right: 1,
      includeLeft: true,
      includeRight: true,
    });

    expect(Math.abs(result.yDomain[0])).toBeLessThan(50);
    expect(Math.abs(result.yDomain[1])).toBeLessThan(50);
  });

  it("trims asymptote-adjacent extremes when the invalid point is the open left endpoint", () => {
    const eval_ = makeEvaluator((x) => 1 / x);
    const result = sampleFunction(eval_, {
      left: 0,
      right: 5,
      includeLeft: false,
      includeRight: true,
    });

    expect(result.trimmed).toBe(true);
    expect(result.yDomain[1]).toBeLessThan(50);
  });

  it("trims endpoint asymptotes even on tiny intervals", () => {
    const eval_ = makeEvaluator((x) => 1 / x);
    const result = sampleFunction(eval_, {
      left: 0,
      right: 0.001,
      includeLeft: false,
      includeRight: true,
    });

    expect(result.trimmed).toBe(true);
    expect(result.yDomain[1]).toBeLessThan(50000);
  });

  it("continuous function has single segment and no trimming", () => {
    const eval_ = makeEvaluator((x) => Math.sin(x));
    const result = sampleFunction(eval_, {
      left: 0,
      right: 6.28,
      includeLeft: true,
      includeRight: true,
    });

    expect(result.segments.length).toBe(1);
    expect(result.trimmed).toBe(false);
  });

  it("handles fully invalid function", () => {
    const eval_ = () => null;
    const result = sampleFunction(eval_, {
      left: 0,
      right: 1,
      includeLeft: true,
      includeRight: true,
    });

    expect(result.segments.length).toBe(0);
    expect(result.yDomain).toEqual([-1, 1]);
  });
});
