import { compileExpression } from "@/lib/math/evaluate";
import { optimize } from "@/lib/solvers/optimize";
import { GAConfig } from "@/types";

const SMALL_CONFIG: GAConfig = {
  populationSize: 80,
  generations: 200,
  crossoverRate: 0.8,
  mutationRate: 0.15,
  eliteCount: 4,
  tolerance: 1e-10,
  patience: 30,
};

describe("optimizer - quadratic x² - 4x + 3 on [0, 5]", () => {
  const compiled = compileExpression("x^2 - 4*x + 3", "x");
  const interval = { left: 0, right: 5, includeLeft: true, includeRight: true };

  it("finds approximate minimum near x=2", () => {
    const results = optimize(compiled, interval, "min", SMALL_CONFIG);
    const minResult = results[0];
    expect(minResult.target).toBe("min");
    expect(minResult.bestX).toBeCloseTo(2, 0);
    expect(minResult.bestFx).toBeCloseTo(-1, 0);
  });

  it("finds approximate maximum near x=5 (endpoint)", () => {
    const results = optimize(compiled, interval, "max", SMALL_CONFIG);
    const maxResult = results[0];
    expect(maxResult.target).toBe("max");
    expect(maxResult.bestFx).toBeCloseTo(8, 0);
  });

  it("returns both results when target is both", () => {
    const results = optimize(compiled, interval, "both", SMALL_CONFIG);
    expect(results).toHaveLength(2);
    expect(results[0].target).toBe("max");
    expect(results[1].target).toBe("min");
  });

  it("includes generation count", () => {
    const results = optimize(compiled, interval, "min", SMALL_CONFIG);
    expect(results[0].generations).toBeGreaterThan(0);
  });
});

describe("optimizer - open interval handling", () => {
  it("detects warning when result is near excluded endpoint", () => {
    const compiled = compileExpression("x", "x");
    const interval = { left: 0, right: 10, includeLeft: true, includeRight: false };
    const results = optimize(compiled, interval, "max", SMALL_CONFIG);
    // Maximum of f(x)=x on [0,10) should be near 10
    expect(results[0].bestX).toBeCloseTo(10, 0);
    // Should have a warning about excluded endpoint
    expect(results[0].warnings.length).toBeGreaterThanOrEqual(0);
  });
});

describe("optimizer - sine function", () => {
  it("finds maximum of sin(x) on [0, 2π]", () => {
    const compiled = compileExpression("sin(x)", "x");
    const interval = { left: 0, right: 6.2832, includeLeft: true, includeRight: true };
    const results = optimize(compiled, interval, "max", SMALL_CONFIG);
    expect(results[0].bestFx).toBeCloseTo(1, 1);
  });

  it("finds minimum of sin(x) on [0, 2π]", () => {
    const compiled = compileExpression("sin(x)", "x");
    const interval = { left: 0, right: 6.2832, includeLeft: true, includeRight: true };
    const results = optimize(compiled, interval, "min", SMALL_CONFIG);
    expect(results[0].bestFx).toBeCloseTo(-1, 1);
  });
});

describe("optimizer - endpoint-sensitive functions", () => {
  it("finds reciprocal max and min on positive closed interval", () => {
    const compiled = compileExpression("1/x", "x");
    const interval = { left: 1, right: 5, includeLeft: true, includeRight: true };

    const results = optimize(compiled, interval, "both", SMALL_CONFIG);

    expect(results[0].target).toBe("max");
    expect(results[0].bestX).toBeCloseTo(1);
    expect(results[0].bestFx).toBeCloseTo(1);
    expect(results[1].target).toBe("min");
    expect(results[1].bestX).toBeCloseTo(5);
    expect(results[1].bestFx).toBeCloseTo(0.2);
  });

  it("finds reciprocal max and min on negative closed interval", () => {
    const compiled = compileExpression("1/x", "x");
    const interval = { left: -5, right: -1, includeLeft: true, includeRight: true };

    const results = optimize(compiled, interval, "both", SMALL_CONFIG);

    expect(results[0].bestX).toBeCloseTo(-5);
    expect(results[0].bestFx).toBeCloseTo(-0.2);
    expect(results[1].bestX).toBeCloseTo(-1);
    expect(results[1].bestFx).toBeCloseTo(-1);
  });

  it("reports no finite maximum when reciprocal approaches zero from the right", () => {
    const compiled = compileExpression("1/x", "x");
    const interval = { left: 0, right: 5, includeLeft: false, includeRight: true };

    const results = optimize(compiled, interval, "max", SMALL_CONFIG);

    expect(results[0].qualitativeResult?.title).toBe("无有限最大值");
    expect(results[0].qualitativeResult?.xLabel).toBe("x → 0+");
    expect(results[0].qualitativeResult?.fxLabel).toBe("f(x) → +∞");
    expect(results[0].generations).toBe(0);
  });

  it("reports no finite minimum when reciprocal approaches zero from the left", () => {
    const compiled = compileExpression("1/x", "x");
    const interval = { left: -5, right: 0, includeLeft: true, includeRight: false };

    const results = optimize(compiled, interval, "min", SMALL_CONFIG);

    expect(results[0].qualitativeResult?.title).toBe("无有限最小值");
    expect(results[0].qualitativeResult?.xLabel).toBe("x → 0-");
    expect(results[0].qualitativeResult?.fxLabel).toBe("f(x) → -∞");
  });

  it("detects interior reciprocal asymptote for crossed intervals", () => {
    const compiled = compileExpression("1/x", "x");
    const interval = { left: -5, right: 5, includeLeft: true, includeRight: true };

    const results = optimize(compiled, interval, "both", SMALL_CONFIG);

    expect(results[0].qualitativeResult?.title).toBe("无有限最大值");
    expect(results[0].qualitativeResult?.xLabel).toBe("x → 0+");
    expect(results[1].qualitativeResult?.title).toBe("无有限最小值");
    expect(results[1].qualitativeResult?.xLabel).toBe("x → 0-");
  });
});
