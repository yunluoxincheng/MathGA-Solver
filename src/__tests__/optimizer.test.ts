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
  it("reports an unattained maximum when a linear function approaches an excluded endpoint", () => {
    const compiled = compileExpression("x", "x");
    const interval = { left: 0, right: 10, includeLeft: true, includeRight: false };
    const results = optimize(compiled, interval, "max", SMALL_CONFIG);

    expect(results[0].qualitativeResult?.title).toBe("无最大值");
    expect(results[0].qualitativeResult?.xLabel).toBe("x → 10-");
    expect(results[0].qualitativeResult?.fxLabel).toBe("f(x) → 10");
  });

  it("reports unattained quadratic bounds on a fully open interval", () => {
    const compiled = compileExpression("x^2", "x");
    const interval = { left: 0, right: 5, includeLeft: false, includeRight: false };
    const results = optimize(compiled, interval, "both", SMALL_CONFIG);

    expect(results[0].qualitativeResult?.title).toBe("无最大值");
    expect(results[0].qualitativeResult?.xLabel).toBe("x → 5-");
    expect(results[0].qualitativeResult?.fxLabel).toBe("f(x) → 25");
    expect(results[1].qualitativeResult?.title).toBe("无最小值");
    expect(results[1].qualitativeResult?.xLabel).toBe("x → 0+");
    expect(results[1].qualitativeResult?.fxLabel).toBe("f(x) → 0");
  });

  it("keeps an attained interior minimum while reporting an unattained endpoint maximum", () => {
    const compiled = compileExpression("x^2", "x");
    const interval = { left: -1, right: 1, includeLeft: false, includeRight: false };
    const results = optimize(compiled, interval, "both", SMALL_CONFIG);

    expect(results[0].qualitativeResult?.title).toBe("无最大值");
    expect(results[0].qualitativeResult?.fxLabel).toBe("f(x) → 1");
    expect(results[1].qualitativeResult).toBeUndefined();
    expect(results[1].bestX).toBeCloseTo(0, 1);
    expect(results[1].bestFx).toBeCloseTo(0, 1);
  });

  it("keeps an attained shifted-parabola minimum even when the interval endpoints are open", () => {
    const compiled = compileExpression("(x - 2)^2", "x");
    const interval = { left: 0, right: 5, includeLeft: false, includeRight: false };
    const results = optimize(compiled, interval, "both", SMALL_CONFIG);

    expect(results[0].qualitativeResult?.title).toBe("无最大值");
    expect(results[0].qualitativeResult?.xLabel).toBe("x → 5-");
    expect(results[0].qualitativeResult?.fxLabel).toBe("f(x) → 9");
    expect(results[1].qualitativeResult).toBeUndefined();
    expect(results[1].bestX).toBeCloseTo(2, 1);
    expect(results[1].bestFx).toBeCloseTo(0, 1);
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

describe("optimizer - history propagation", () => {
  const compiled = compileExpression("x^2 - 4*x + 3", "x");
  const interval = { left: 0, right: 5, includeLeft: true, includeRight: true };

  it("includes generation history for finite GA-backed results", () => {
    const results = optimize(compiled, interval, "min", SMALL_CONFIG);
    const minResult = results[0];

    expect(minResult.history).toBeDefined();
    expect(minResult.history!.length).toBeGreaterThan(0);
    expect(minResult.history![0].generation).toBe(1);
    expect(typeof minResult.history![0].bestFitness).toBe("number");
    expect(typeof minResult.history![0].avgFitness).toBe("number");
  });

  it("includes history for both targets independently", () => {
    const results = optimize(compiled, interval, "both", SMALL_CONFIG);

    expect(results[0].history).toBeDefined();
    expect(results[1].history).toBeDefined();
    expect(results[0].history!.length).toBeGreaterThan(0);
    expect(results[1].history!.length).toBeGreaterThan(0);
  });
});

describe("optimizer - endpoint correction", () => {
  const tinyConfig: GAConfig = {
    populationSize: 4,
    generations: 1,
    crossoverRate: 0,
    mutationRate: 0,
    eliteCount: 1,
    tolerance: 1e-8,
    patience: 5,
  };

  it("records endpoint correction when right included endpoint beats GA best for max", () => {
    const compiled = compileExpression("x^2", "x");
    const interval = { left: 0, right: 10, includeLeft: true, includeRight: true };
    const results = optimize(compiled, interval, "max", tinyConfig);

    expect(results[0].bestX).toBe(10);
    expect(results[0].bestFx).toBe(100);
    expect(results[0].endpointCorrection).toBeDefined();
    expect(results[0].endpointCorrection!.x).toBe(10);
    expect(results[0].endpointCorrection!.fx).toBe(100);
  });

  it("records endpoint correction when left included endpoint beats GA best for min", () => {
    const compiled = compileExpression("x^2", "x");
    const interval = { left: 0, right: 10, includeLeft: true, includeRight: true };
    const results = optimize(compiled, interval, "min", tinyConfig);

    expect(results[0].bestX).toBe(0);
    expect(results[0].bestFx).toBe(0);
    expect(results[0].endpointCorrection).toBeDefined();
    expect(results[0].endpointCorrection!.x).toBe(0);
    expect(results[0].endpointCorrection!.fx).toBe(0);
  });

  it("does not record endpoint correction when GA finds interior optimum", () => {
    const compiled = compileExpression("-(x - 5)^2 + 10", "x");
    const interval = { left: 0, right: 10, includeLeft: true, includeRight: true };
    const results = optimize(compiled, interval, "max", SMALL_CONFIG);

    expect(results[0].bestX).toBeGreaterThan(1);
    expect(results[0].bestX).toBeLessThan(9);
    expect(results[0].endpointCorrection).toBeUndefined();
  });
});

describe("optimizer - qualitative results have no history", () => {
  it("unbounded results have no history", () => {
    const compiled = compileExpression("1/x", "x");
    const interval = { left: 0, right: 5, includeLeft: false, includeRight: true };
    const results = optimize(compiled, interval, "max", SMALL_CONFIG);

    expect(results[0].qualitativeResult).toBeDefined();
    expect(results[0].history).toBeUndefined();
  });

  it("excluded endpoint limit results have no history", () => {
    const compiled = compileExpression("x", "x");
    const interval = { left: 0, right: 10, includeLeft: true, includeRight: false };
    const results = optimize(compiled, interval, "max", SMALL_CONFIG);

    expect(results[0].qualitativeResult).toBeDefined();
  });
});
