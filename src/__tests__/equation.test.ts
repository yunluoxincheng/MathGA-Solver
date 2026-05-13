import { solveEquation } from "@/lib/solvers/equation";
import { GAConfig, DEFAULT_EQUATION_RESIDUAL_TOLERANCE } from "@/types";

const SMALL_CONFIG: GAConfig = {
  populationSize: 40,
  generations: 100,
  crossoverRate: 0.8,
  mutationRate: 0.15,
  eliteCount: 2,
  tolerance: 1e-10,
  patience: 20,
};

function makeLeftDef(templateId: string, params: Record<string, number>, variable = "x", customExpression?: string) {
  return { templateId, parameters: params, variable, customExpression };
}

function closedInterval(left: number, right: number) {
  return { left, right, includeLeft: true, includeRight: true };
}

// 5.1 Simple equation solving
describe("equation solver - simple equations", () => {
  it("solves x^2 - 4 = 0 on [-10, 10]", () => {
    const result = solveEquation(
      makeLeftDef("quadratic", { a: 1, b: 0, c: -4 }),
      0,
      null,
      closedInterval(-10, 10),
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.rootX).not.toBeNull();
    const error = Math.abs(result.rootX! - 2);
    const error2 = Math.abs(result.rootX! - (-2));
    expect(error < 0.01 || error2 < 0.01).toBe(true);
    expect(result.residual).toBeLessThan(DEFAULT_EQUATION_RESIDUAL_TOLERANCE);
    expect(result.generations).toBeGreaterThan(0);
  });

  it("solves 2x + 3 = 7 on [-10, 10]", () => {
    const result = solveEquation(
      makeLeftDef("linear", { a: 2, b: 3 }),
      7,
      null,
      closedInterval(-10, 10),
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.rootX).not.toBeNull();
    expect(result.rootX!).toBeCloseTo(2, 1);
    expect(result.residual).toBeLessThan(DEFAULT_EQUATION_RESIDUAL_TOLERANCE);
  });

  it("solves with expression right side: x^2 = 2x on [-5, 5]", () => {
    const result = solveEquation(
      makeLeftDef("quadratic", { a: 1, b: 0, c: 0 }),
      null,
      makeLeftDef("linear", { a: 2, b: 0 }),
      closedInterval(-5, 5),
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.rootX).not.toBeNull();
    const error = Math.abs(result.rootX!);
    const error2 = Math.abs(result.rootX! - 2);
    expect(error < 0.01 || error2 < 0.01).toBe(true);
    expect(result.residual).toBeLessThan(DEFAULT_EQUATION_RESIDUAL_TOLERANCE);
  });
});

// 5.2 Multiple-root intervals
describe("equation solver - multiple roots", () => {
  it("returns one candidate for x^2 - 4 = 0 even though there are two roots", () => {
    const result = solveEquation(
      makeLeftDef("quadratic", { a: 1, b: 0, c: -4 }),
      0,
      null,
      closedInterval(-10, 10),
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.rootX).not.toBeNull();
    expect(Number.isFinite(result.rootX!)).toBe(true);
  });

  it("does not claim all roots were found", () => {
    const result = solveEquation(
      makeLeftDef("quadratic", { a: 1, b: 0, c: -4 }),
      0,
      null,
      closedInterval(-10, 10),
      { gaConfig: SMALL_CONFIG }
    );

    const allRootsFound = result.warnings.some((w) =>
      w.includes("所有根") || w.includes("全部解")
    );
    expect(allRootsFound).toBe(false);
  });
});

// 5.3 Residual above tolerance and invalid cases
describe("equation solver - residual and invalid cases", () => {
  it("reports no root when residual is above tolerance", () => {
    const result = solveEquation(
      makeLeftDef("quadratic", { a: 1, b: 0, c: 0 }),
      -100,
      null,
      closedInterval(1, 5),
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.rootX).toBeNull();
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("精度"))).toBe(true);
  });

  it("returns error for invalid left expression", () => {
    const result = solveEquation(
      makeLeftDef("custom", {}, "x", "invalid ##$$ expr"),
      0,
      null,
      closedInterval(-10, 10)
    );

    expect(result.rootX).toBeNull();
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("returns no-result state when expression evaluates invalid everywhere", () => {
    const result = solveEquation(
      makeLeftDef("custom", {}, "x", "sqrt(-1)"),
      0,
      null,
      closedInterval(1, 5),
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.rootX).toBeNull();
    expect(result.residual).toBe(Infinity);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("有效"))).toBe(true);
  });
});

// 5.4 Endpoint roots
describe("equation solver - endpoint roots", () => {
  it("accepts included endpoint as root: x^2 = 0 on [0, 5]", () => {
    const result = solveEquation(
      makeLeftDef("quadratic", { a: 1, b: 0, c: 0 }),
      0,
      null,
      closedInterval(0, 5),
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.rootX).not.toBeNull();
    expect(result.rootX!).toBeCloseTo(0, 2);
    expect(result.residual).toBeLessThan(DEFAULT_EQUATION_RESIDUAL_TOLERANCE);
  });

  it("does not accept excluded endpoint as root: x = 0 on (0, 5]", () => {
    const result = solveEquation(
      makeLeftDef("linear", { a: 1, b: 0 }),
      0,
      null,
      { left: 0, right: 5, includeLeft: false, includeRight: true },
      { gaConfig: SMALL_CONFIG }
    );

    // Root at x=0 is excluded; no root exists inside (0, 5]
    expect(result.rootX).toBeNull();
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("does not accept excluded endpoint for flat equation: x^2 = 0 on (0, 5]", () => {
    const result = solveEquation(
      makeLeftDef("quadratic", { a: 1, b: 0, c: 0 }),
      0,
      null,
      { left: 0, right: 5, includeLeft: false, includeRight: true },
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.rootX).toBeNull();
    expect(result.warnings.some((w) => w.includes("左端点"))).toBe(true);
  });

  it("accepts legitimate interior root near excluded endpoint: x - 0.0001 = 0 on (0, 5]", () => {
    const result = solveEquation(
      makeLeftDef("linear", { a: 1, b: -0.0001 }),
      0,
      null,
      { left: 0, right: 5, includeLeft: false, includeRight: true },
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.rootX).not.toBeNull();
    expect(result.rootX!).toBeCloseTo(0.0001, 2);
  });
});

// 5.5 Identity-like equations
describe("equation solver - identity equations", () => {
  it("warns about many solutions for x = x on [-5, 5]", () => {
    const result = solveEquation(
      makeLeftDef("linear", { a: 1, b: 0 }),
      null,
      makeLeftDef("linear", { a: 1, b: 0 }),
      closedInterval(-5, 5),
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.warnings.some((w) => w.includes("多个") || w.includes("无穷多"))).toBe(true);
  });

  it("warns about many solutions for 0 = 0 on [-5, 5]", () => {
    const result = solveEquation(
      makeLeftDef("linear", { a: 0, b: 0 }),
      0,
      null,
      closedInterval(-5, 5),
      { gaConfig: SMALL_CONFIG }
    );

    expect(result.warnings.some((w) => w.includes("多个") || w.includes("无穷多"))).toBe(true);
  });
});

// 5.6 Deterministic solving
describe("equation solver - deterministic behavior", () => {
  it("produces consistent results for x - 3 = 0 across multiple runs", () => {
    const leftDef = makeLeftDef("linear", { a: 1, b: -3 });
    const interval = closedInterval(-10, 10);
    const options = { gaConfig: SMALL_CONFIG, deterministicSamples: 100, refineIterations: 50 };

    const results = Array.from({ length: 5 }, () =>
      solveEquation(leftDef, 0, null, interval, options)
    );

    for (const r of results) {
      expect(r.rootX).not.toBeNull();
      expect(r.rootX!).toBeCloseTo(3, 2);
    }
  });

  it("classifies accepted or rejected consistently", () => {
    const leftDef = makeLeftDef("quadratic", { a: 1, b: 0, c: -4 });
    const interval = closedInterval(-10, 10);
    const options = { gaConfig: SMALL_CONFIG, deterministicSamples: 100, refineIterations: 50 };

    const results = Array.from({ length: 5 }, () =>
      solveEquation(leftDef, 0, null, interval, options)
    );

    const classifications = results.map((r) => r.rootX !== null ? "accepted" : "rejected");
    expect(new Set(classifications).size).toBe(1);
  });
});

// 5.7 Integration: equation input preview and mode switching
import { compileExpression } from "@/lib/math/evaluate";
import { buildExpression, buildPreview } from "@/lib/math/templates";

describe("equation input preview and mode switching", () => {
  it("builds correct expression for quadratic left side with constant right side", () => {
    const expr = buildExpression("quadratic", { a: 1, b: 0, c: -4 }, "x");
    expect(expr).toBeTruthy();
    const compiled = compileExpression(expr, "x");
    expect(compiled.valid).toBe(true);
    expect(compiled.evaluate(2)).toBeCloseTo(0);
    expect(compiled.evaluate(-2)).toBeCloseTo(0);
  });

  it("builds matching preview for both sides", () => {
    const leftPreview = buildPreview("quadratic", { a: 1, b: 0, c: -4 }, "x");
    expect(leftPreview).toContain("x");
    const rightPreview = buildPreview("linear", { a: 2, b: 0 }, "x");
    expect(rightPreview).toContain("x");
  });

  it("compiles theta variable correctly for both sides", () => {
    const leftExpr = buildExpression("sine", { a: 1, b: 1, c: 0, d: 0 }, "theta");
    const rightExpr = buildExpression("cosine", { a: 1, b: 1, c: 0, d: 0 }, "theta");
    const leftCompiled = compileExpression(leftExpr, "theta");
    const rightCompiled = compileExpression(rightExpr, "theta");
    expect(leftCompiled.valid).toBe(true);
    expect(rightCompiled.valid).toBe(true);
  });

  it("theta preview displays as θ", () => {
    const preview = buildPreview("sine", { a: 1, b: 1, c: 0, d: 0 }, "θ");
    expect(preview).toContain("θ");
  });
});
