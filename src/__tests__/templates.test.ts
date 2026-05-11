import { buildExpression, buildPreview, getAllTemplates } from "@/lib/math/templates";

describe("Template metadata", () => {
  it("returns all 9 template types", () => {
    const templates = getAllTemplates();
    expect(templates).toHaveLength(9);
  });

  it("each non-custom template has buildExpression and buildPreview", () => {
    const templates = getAllTemplates().filter((t) => t.id !== "custom");
    templates.forEach((t) => {
      expect(typeof t.buildExpression).toBe("function");
      expect(typeof t.buildPreview).toBe("function");
    });
  });
});

describe("buildExpression", () => {
  it("generates quadratic expression from parameters", () => {
    const expr = buildExpression("quadratic", { a: 1, b: -4, c: 3 }, "x");
    expect(expr).toBe("1*x^2 + (-4)*x + (3)");
  });

  it("generates sine expression", () => {
    const expr = buildExpression("sine", { a: 2, b: 1, c: 0, d: 0 }, "x");
    expect(expr).toBe("2 * sin(1*x + (0)) + (0)");
  });

  it("generates sqrt expression", () => {
    const expr = buildExpression("sqrt", { a: 3, b: -1 }, "x");
    expect(expr).toBe("3 * sqrt(x) + (-1)");
  });
});

describe("buildPreview", () => {
  it("renders quadratic preview with a=1, b=-4, c=3", () => {
    const preview = buildPreview("quadratic", { a: 1, b: -4, c: 3 }, "x");
    expect(preview).toBe("x² - 4x + 3");
  });

  it("renders positive middle coefficients with a plus sign", () => {
    expect(buildPreview("quadratic", { a: 1, b: 4, c: 3 }, "x")).toBe("x² + 4x + 3");
    expect(buildPreview("cubic", { a: 1, b: 2, c: 3, d: 4 }, "x")).toBe(
      "x³ + 2x² + 3x + 4"
    );
  });

  it("renders absolute value template", () => {
    const preview = buildPreview("absolute", { a: 1, b: 0 }, "x");
    expect(preview).toContain("|x|");
  });

  it("renders sqrt template", () => {
    const preview = buildPreview("sqrt", { a: 1, b: 0 }, "x");
    expect(preview).toContain("√x");
  });
});
