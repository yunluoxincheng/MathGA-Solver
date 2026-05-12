import { GAConfig, Interval, OptimizeTarget, OptimizationResult, DEFAULT_GA_CONFIG } from "@/types";
import { CompiledFunction } from "@/lib/math/evaluate";
import { runGA } from "@/lib/ga/engine";
import { isNearEndpoint, normalizeDisplayZero } from "@/lib/math/interval";

type ApproachSide = "left" | "right";

interface UnboundedBehavior {
  point: number;
  side: ApproachSide;
  direction: "positive" | "negative";
}

interface ExcludedEndpointLimit {
  point: number;
  side: ApproachSide;
  value: number;
}

function checkPopulationValidity(
  compiledFn: CompiledFunction,
  interval: Interval,
  populationSize: number
): { valid: boolean; warning?: string } {
  const sampleSize = Math.min(populationSize, 60);
  let validCount = 0;
  for (let i = 0; i < sampleSize; i++) {
    const x = interval.left + (i / sampleSize) * (interval.right - interval.left);
    const fx = compiledFn.evaluate(x);
    if (fx !== null) validCount++;
  }

  if (validCount === 0) {
    return { valid: false, warning: "函数在该区间内可能完全无定义，无法进行有效搜索" };
  }

  if (validCount / sampleSize < 0.1) {
    return { valid: true, warning: "函数在该区间的大部分区域可能无定义，搜索结果可能不可靠" };
  }

  return { valid: true };
}

function detectUnboundedBehavior(
  compiledFn: CompiledFunction,
  interval: Interval,
  minimize: boolean
): UnboundedBehavior | null {
  const candidates: { point: number; sides: ApproachSide[] }[] = [
    { point: interval.left, sides: ["right"] },
    { point: interval.right, sides: ["left"] },
  ];

  if (interval.left < 0 && interval.right > 0 && compiledFn.evaluate(0) === null) {
    candidates.push({ point: 0, sides: ["left", "right"] });
  }

  for (const candidate of candidates) {
    for (const side of candidate.sides) {
      const behavior = probeUnboundedSide(compiledFn, interval, candidate.point, side);
      if (!behavior) continue;

      if (!minimize && behavior.direction === "positive") {
        return behavior;
      }

      if (minimize && behavior.direction === "negative") {
        return behavior;
      }
    }
  }

  return null;
}

function probeUnboundedSide(
  compiledFn: CompiledFunction,
  interval: Interval,
  point: number,
  side: ApproachSide
): UnboundedBehavior | null {
  const range = interval.right - interval.left;
  const distances = Array.from(
    new Set([range * 1e-2, range * 1e-4, range * 1e-8, 1e-8, 1e-10])
  )
    .filter((distance) => distance > 0 && distance < range)
    .sort((a, b) => b - a);

  const values = distances
    .map((distance) => (side === "right" ? point + distance : point - distance))
    .filter((x) => x > interval.left && x < interval.right)
    .map((x) => compiledFn.evaluate(x))
    .filter((fx): fx is number => fx !== null);

  if (values.length < 3) return null;

  const absValues = values.map(Math.abs);
  const first = absValues[0];
  const middle = absValues[Math.floor(absValues.length / 2)];
  const last = absValues[absValues.length - 1];
  const growsQuickly = middle > first * 20 && last > middle * 20 && last > 1e6;

  if (!growsQuickly) return null;

  const signs = values.map(Math.sign);
  const samePositive = signs.every((sign) => sign > 0);
  const sameNegative = signs.every((sign) => sign < 0);

  if (!samePositive && !sameNegative) return null;

  return {
    point,
    side,
    direction: samePositive ? "positive" : "negative",
  };
}

function createUnboundedResult(
  behavior: UnboundedBehavior,
  minimize: boolean
): OptimizationResult {
  const targetName = minimize ? "最小值" : "最大值";
  const infinityLabel = behavior.direction === "positive" ? "+∞" : "-∞";
  const sideLabel = behavior.side === "right" ? "右侧" : "左侧";
  const approachSymbol = behavior.side === "right" ? "+" : "-";
  const pointLabel = formatPoint(behavior.point);

  return {
    target: minimize ? "min" : "max",
    bestX: NaN,
    bestFx: NaN,
    generations: 0,
    earlyStopped: false,
    warnings: [
      `函数在 x 接近 ${pointLabel} 的${sideLabel}时会趋向 ${infinityLabel}，不存在有限${targetName}。`,
    ],
    qualitativeResult: {
      title: `无有限${targetName}`,
      description: `当 x 从${sideLabel}趋近 ${pointLabel} 时，f(x) 趋向 ${infinityLabel}。因此这里不应把某个很靠近端点的采样值当作真正${targetName}。`,
      xLabel: `x → ${pointLabel}${approachSymbol}`,
      fxLabel: `f(x) → ${infinityLabel}`,
    },
  };
}

function detectExcludedEndpointLimit(
  compiledFn: CompiledFunction,
  interval: Interval,
  currentBest: number,
  minimize: boolean
): ExcludedEndpointLimit | null {
  const endpointLimits: ExcludedEndpointLimit[] = [];

  if (!interval.includeLeft) {
    const leftFx = compiledFn.evaluate(interval.left);
    if (leftFx !== null) {
      endpointLimits.push({ point: interval.left, side: "right", value: leftFx });
    }
  }

  if (!interval.includeRight) {
    const rightFx = compiledFn.evaluate(interval.right);
    if (rightFx !== null) {
      endpointLimits.push({ point: interval.right, side: "left", value: rightFx });
    }
  }

  const unattainedLimits = endpointLimits.filter((limit) =>
    isMeaningfullyBetter(limit.value, currentBest, minimize)
  );

  if (unattainedLimits.length === 0) return null;

  return unattainedLimits.sort((a, b) =>
    minimize ? a.value - b.value : b.value - a.value
  )[0];
}

function isMeaningfullyBetter(candidate: number, currentBest: number, minimize: boolean): boolean {
  return minimize ? candidate < currentBest : candidate > currentBest;
}

function createExcludedEndpointLimitResult(
  limit: ExcludedEndpointLimit,
  minimize: boolean,
  generations: number,
  earlyStopped: boolean,
  warnings: string[]
): OptimizationResult {
  const targetName = minimize ? "最小值" : "最大值";
  const boundName = minimize ? "下确界" : "上确界";
  const sideLabel = limit.side === "right" ? "右侧" : "左侧";
  const approachSymbol = limit.side === "right" ? "+" : "-";
  const pointLabel = formatPoint(limit.point);
  const valueLabel = formatPoint(limit.value);

  return {
    target: minimize ? "min" : "max",
    bestX: NaN,
    bestFx: limit.value,
    generations,
    earlyStopped,
    warnings: [
      ...warnings,
      `区间不包含 x = ${pointLabel}，函数只能从${sideLabel}趋近该端点，因此不存在真正的${targetName}。`,
    ],
    qualitativeResult: {
      title: `无${targetName}`,
      description: `当 x 从${sideLabel}趋近 ${pointLabel} 时，f(x) 趋近 ${valueLabel}。该值是${boundName}，但不在当前区间内取到。`,
      xLabel: `x → ${pointLabel}${approachSymbol}`,
      fxLabel: `f(x) → ${valueLabel}`,
    },
  };
}

function formatPoint(value: number): string {
  const normalizedValue = normalizeDisplayZero(value, 5e-7);
  return Number.isInteger(normalizedValue)
    ? normalizedValue.toString()
    : normalizedValue.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

function solveSingle(
  compiledFn: CompiledFunction,
  interval: Interval,
  config: GAConfig,
  minimize: boolean
): OptimizationResult {
  const unboundedBehavior = detectUnboundedBehavior(compiledFn, interval, minimize);
  if (unboundedBehavior) {
    return createUnboundedResult(unboundedBehavior, minimize);
  }

  const validity = checkPopulationValidity(compiledFn, interval, config.populationSize);
  if (!validity.valid) {
    return {
      target: minimize ? "min" : "max",
      bestX: NaN,
      bestFx: NaN,
      generations: 0,
      earlyStopped: false,
      warnings: [validity.warning!],
    };
  }

  const gaResult = runGA(compiledFn, interval, config, minimize);

  const warnings: string[] = [];
  if (validity.warning) warnings.push(validity.warning);

  let endpointCorrection: { x: number; fx: number } | undefined;

  if (interval.includeLeft) {
    const leftFx = compiledFn.evaluate(interval.left);
    if (leftFx !== null) {
      const currentBest = gaResult.best.fitness;
      if (minimize ? leftFx < currentBest : leftFx > currentBest) {
        endpointCorrection = { x: interval.left, fx: leftFx };
        gaResult.best = { x: interval.left, fitness: leftFx };
      }
    }
  }

  if (interval.includeRight) {
    const rightFx = compiledFn.evaluate(interval.right);
    if (rightFx !== null) {
      const currentBest = gaResult.best.fitness;
      if (minimize ? rightFx < currentBest : rightFx > currentBest) {
        endpointCorrection = { x: interval.right, fx: rightFx };
        gaResult.best = { x: interval.right, fitness: rightFx };
      }
    }
  }

  const endpointLimit = detectExcludedEndpointLimit(
    compiledFn,
    interval,
    gaResult.best.fitness,
    minimize
  );
  if (endpointLimit) {
    return createExcludedEndpointLimitResult(
      endpointLimit,
      minimize,
      gaResult.generations,
      gaResult.earlyStopped,
      warnings
    );
  }

  const endpointCheck = isNearEndpoint(gaResult.best.x, interval);
  if (endpointCheck.near) {
    warnings.push(endpointCheck.warning);
  }

  return {
    target: minimize ? "min" : "max",
    bestX: gaResult.best.x,
    bestFx: gaResult.best.fitness,
    generations: gaResult.generations,
    earlyStopped: gaResult.earlyStopped,
    warnings,
    history: gaResult.history,
    endpointCorrection,
  };
}

export function optimize(
  compiledFn: CompiledFunction,
  interval: Interval,
  target: OptimizeTarget,
  config: GAConfig = DEFAULT_GA_CONFIG
): OptimizationResult[] {
  const results: OptimizationResult[] = [];

  if (target === "max" || target === "both") {
    results.push(solveSingle(compiledFn, interval, config, false));
  }

  if (target === "min" || target === "both") {
    results.push(solveSingle(compiledFn, interval, config, true));
  }

  return results;
}
