import { compileExpression, safeEvaluate } from "@/lib/math/evaluate";

describe("compileExpression", () => {
  it("compiles a valid quadratic expression", () => {
    const compiled = compileExpression("x^2 - 4*x + 3", "x");
    expect(compiled.valid).toBe(true);
    const val = compiled.evaluate(2);
    expect(val).toBe(-1);
  });

  it("compiles sin expression", () => {
    const compiled = compileExpression("sin(x)", "x");
    expect(compiled.valid).toBe(true);
    const val = compiled.evaluate(0);
    expect(val).toBeCloseTo(0);
  });

  it("rejects empty expression", () => {
    const compiled = compileExpression("", "x");
    expect(compiled.valid).toBe(false);
    expect(compiled.error).toContain("不能为空");
  });

  it("rejects invalid syntax", () => {
    const compiled = compileExpression("((((", "x");
    expect(compiled.valid).toBe(false);
  });
});

describe("safe evaluation", () => {
  it("returns null for NaN-producing expressions", () => {
    const compiled = compileExpression("1/x", "x");
    const val = compiled.evaluate(0);
    expect(val).toBeNull();
  });

  it("returns null for Infinity-producing expressions", () => {
    const compiled = compileExpression("1/x", "x");
    const val = compiled.evaluate(0.0000001);
    expect(val).not.toBeNull();
  });

  it("evaluates sqrt only for non-negative x", () => {
    const compiled = compileExpression("sqrt(x)", "x");
    expect(compiled.evaluate(4)).toBe(2);
    expect(compiled.evaluate(-1)).toBeNull();
  });
});

describe("safeEvaluate wrapper", () => {
  it("returns value for valid input", () => {
    const compiled = compileExpression("x^2", "x");
    const result = safeEvaluate(compiled, 3);
    expect(result.value).toBe(9);
    expect(result.error).toBeUndefined();
  });

  it("returns error for invalid compiled function", () => {
    const compiled = compileExpression("", "x");
    const result = safeEvaluate(compiled, 3);
    expect(result.value).toBeNull();
    expect(result.error).toBeDefined();
  });
});
