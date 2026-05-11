import { GAConfig, Interval, OptimizeTarget, OptimizationResult, DEFAULT_GA_CONFIG } from "@/types";
import { CompiledFunction } from "@/lib/math/evaluate";
import { runGA } from "@/lib/ga/engine";
import { isNearEndpoint } from "@/lib/math/interval";

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

function solveSingle(
  compiledFn: CompiledFunction,
  interval: Interval,
  config: GAConfig,
  minimize: boolean
): OptimizationResult {
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

  if (interval.includeLeft) {
    const leftFx = compiledFn.evaluate(interval.left);
    if (leftFx !== null) {
      const currentBest = gaResult.best.fitness;
      if (minimize ? leftFx < currentBest : leftFx > currentBest) {
        gaResult.best = { x: interval.left, fitness: leftFx };
      }
    }
  }

  if (interval.includeRight) {
    const rightFx = compiledFn.evaluate(interval.right);
    if (rightFx !== null) {
      const currentBest = gaResult.best.fitness;
      if (minimize ? rightFx < currentBest : rightFx > currentBest) {
        gaResult.best = { x: interval.right, fitness: rightFx };
      }
    }
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
