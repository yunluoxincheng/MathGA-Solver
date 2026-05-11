import { Interval } from "@/types";

export interface IntervalValidation {
  valid: boolean;
  errors: string[];
}

export function validateInterval(interval: Interval): IntervalValidation {
  const errors: string[] = [];
  const { left, right, includeLeft, includeRight } = interval;

  if (left > right) {
    errors.push("左端点不能大于右端点");
  }

  if (left === right && (!includeLeft || !includeRight)) {
    errors.push("端点相同时不能为开区间");
  }

  return { valid: errors.length === 0, errors };
}

export function clampToInterval(value: number, interval: Interval): number {
  const { left, right, includeLeft, includeRight } = interval;
  const epsilon = (right - left) * 1e-6;

  let clamped = Math.max(left, Math.min(right, value));
  if (!includeLeft && clamped <= left) {
    clamped = left + epsilon;
  }
  if (!includeRight && clamped >= right) {
    clamped = right - epsilon;
  }

  return clamped;
}

export function randomInRange(interval: Interval): number {
  const { left, right, includeLeft, includeRight } = interval;
  const epsilon = (right - left) * 1e-6;
  const lo = includeLeft ? left : left + epsilon;
  const hi = includeRight ? right : right - epsilon;
  return lo + Math.random() * (hi - lo);
}

export function isNearEndpoint(
  value: number,
  interval: Interval
): { near: boolean; warning: string } {
  const { left, right, includeLeft, includeRight } = interval;
  const range = right - left;
  const absThreshold = Math.max(1e-6, range * 1e-4);

  if (!includeLeft && Math.abs(value - left) < absThreshold) {
    return {
      near: true,
      warning: `结果接近不包含的左端点 ${left}，该值可能是下确界而非真正的最小值`,
    };
  }

  if (!includeRight && Math.abs(value - right) < absThreshold) {
    return {
      near: true,
      warning: `结果接近不包含的右端点 ${right}，该值可能是上确界而非真正的最大值`,
    };
  }

  return { near: false, warning: "" };
}

export function applyPiUnit(interval: Interval): Interval {
  return {
    ...interval,
    left: interval.left * Math.PI,
    right: interval.right * Math.PI,
  };
}

export function formatEndpoint(value: number, piUnit = false): string {
  if (piUnit) {
    return formatPiCoefficient(value);
  }

  if (value === 0) return "0";

  const multiple = value / Math.PI;
  const roundedMultiple = Math.round(multiple);
  if (Math.abs(multiple - roundedMultiple) < 1e-10) {
    if (roundedMultiple === 1) return "π";
    if (roundedMultiple === -1) return "-π";
    return `${roundedMultiple}π`;
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/\.?0+$/, "");
}

export function formatRadiansAsPi(value: number): string {
  return formatPiCoefficient(value / Math.PI);
}

function formatPiCoefficient(value: number): string {
  if (value === 0) return "0";
  if (value === 1) return "π";
  if (value === -1) return "-π";

  const displayValue = Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/\.?0+$/, "");
  return `${displayValue}π`;
}
