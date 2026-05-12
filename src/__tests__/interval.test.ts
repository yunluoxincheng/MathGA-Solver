import {
  validateInterval,
  randomInRange,
  isNearEndpoint,
  applyPiUnit,
  formatEndpoint,
  formatRadiansAsPi,
} from "@/lib/math/interval";

describe("validateInterval", () => {
  it("accepts valid closed interval", () => {
    const result = validateInterval({ left: 0, right: 5, includeLeft: true, includeRight: true });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects left > right", () => {
    const result = validateInterval({ left: 5, right: 0, includeLeft: true, includeRight: true });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("左端点不能大于右端点");
  });

  it("rejects equal endpoints with open interval", () => {
    const result = validateInterval({ left: 3, right: 3, includeLeft: false, includeRight: true });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("端点相同时不能为开区间");
  });

  it("accepts equal endpoints with fully closed interval", () => {
    const result = validateInterval({ left: 3, right: 3, includeLeft: true, includeRight: true });
    expect(result.valid).toBe(true);
  });

  it("accepts open interval with distinct endpoints", () => {
    const result = validateInterval({ left: 0, right: 5, includeLeft: false, includeRight: false });
    expect(result.valid).toBe(true);
  });
});

describe("randomInRange", () => {
  it("returns value within closed interval", () => {
    const interval = { left: 0, right: 10, includeLeft: true, includeRight: true };
    for (let i = 0; i < 100; i++) {
      const val = randomInRange(interval);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it("returns value strictly inside open interval", () => {
    const interval = { left: 0, right: 10, includeLeft: false, includeRight: false };
    for (let i = 0; i < 100; i++) {
      const val = randomInRange(interval);
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThan(10);
    }
  });
});

describe("isNearEndpoint", () => {
  it("warns when near excluded left endpoint", () => {
    const interval = { left: 0, right: 10, includeLeft: false, includeRight: true };
    // threshold = max(1e-6, 10*1e-4) = 0.001
    const result = isNearEndpoint(0.0005, interval);
    expect(result.near).toBe(true);
    expect(result.warning).toContain("左端点");
  });

  it("warns when near excluded right endpoint", () => {
    const interval = { left: 0, right: 10, includeLeft: true, includeRight: false };
    // threshold = max(1e-6, 10*1e-4) = 0.001
    const result = isNearEndpoint(9.9995, interval);
    expect(result.near).toBe(true);
    expect(result.warning).toContain("右端点");
  });

  it("does not warn when near included endpoint", () => {
    const interval = { left: 0, right: 10, includeLeft: true, includeRight: true };
    const result = isNearEndpoint(0.001, interval);
    expect(result.near).toBe(false);
  });

  it("does not warn when far from endpoints", () => {
    const interval = { left: 0, right: 10, includeLeft: false, includeRight: false };
    const result = isNearEndpoint(5, interval);
    expect(result.near).toBe(false);
  });
});

describe("π interval helpers", () => {
  it("converts π-unit endpoints only when solving", () => {
    const original = {
      left: 1,
      right: 5,
      includeLeft: true,
      includeRight: true,
    };
    const interval = applyPiUnit(original);

    expect(original.left).toBe(1);
    expect(original.right).toBe(5);
    expect(interval.left).toBeCloseTo(Math.PI);
    expect(interval.right).toBeCloseTo(5 * Math.PI);
  });

  it("formats endpoint coefficients with π suffix when π unit is enabled", () => {
    expect(formatEndpoint(1, true)).toBe("π");
    expect(formatEndpoint(5, true)).toBe("5π");
    expect(formatEndpoint(0, true)).toBe("0");
    expect(formatEndpoint(1.5, true)).toBe("1.5π");
  });

  it("normalizes negative zero in endpoint display", () => {
    expect(formatEndpoint(-0)).toBe("0");
    expect(formatEndpoint(-0.00004)).toBe("0");
    expect(formatEndpoint(-0, true)).toBe("0");
  });

  it("formats solved radian x values as π multiples", () => {
    expect(formatRadiansAsPi(Math.PI)).toBe("π");
    expect(formatRadiansAsPi(1.5 * Math.PI)).toBe("1.5π");
    expect(formatRadiansAsPi(-0.5 * Math.PI)).toBe("-0.5π");
  });

  it("normalizes negative zero in π result display", () => {
    expect(formatRadiansAsPi(-0)).toBe("0");
    expect(formatRadiansAsPi(-0.00004 * Math.PI)).toBe("0");
  });
});
