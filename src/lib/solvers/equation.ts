import { GAConfig, Interval, DEFAULT_GA_CONFIG, DEFAULT_EQUATION_RESIDUAL_TOLERANCE, EquationResult } from "@/types";
import { CompiledFunction, compileExpression } from "@/lib/math/evaluate";
import { buildExpression } from "@/lib/math/templates";
import { runGA } from "@/lib/ga/engine";

function compileEquationSide(
  definition: { templateId: string; parameters: Record<string, number>; customExpression?: string; variable: string },
  variable: string
): CompiledFunction {
  const expression =
    definition.templateId === "custom"
      ? (definition.customExpression ?? "")
      : buildExpression(definition.templateId as never, definition.parameters, variable);
  return compileExpression(expression, variable);
}

interface ResidualCandidate {
  x: number;
  residual: number;
}

function evaluateResidual(leftFn: CompiledFunction, rightFn: CompiledFunction, x: number): number | null {
  const leftVal = leftFn.evaluate(x);
  const rightVal = rightFn.evaluate(x);
  if (leftVal === null || rightVal === null) return null;
  return Math.abs(leftVal - rightVal);
}

function collectEndpointCandidates(
  leftFn: CompiledFunction,
  rightFn: CompiledFunction,
  interval: Interval
): ResidualCandidate[] {
  const candidates: ResidualCandidate[] = [];

  if (interval.includeLeft) {
    const r = evaluateResidual(leftFn, rightFn, interval.left);
    if (r !== null) candidates.push({ x: interval.left, residual: r });
  }

  if (interval.includeRight) {
    const r = evaluateResidual(leftFn, rightFn, interval.right);
    if (r !== null) candidates.push({ x: interval.right, residual: r });
  }

  return candidates;
}

function collectDeterministicSamples(
  leftFn: CompiledFunction,
  rightFn: CompiledFunction,
  interval: Interval,
  sampleCount: number
): ResidualCandidate[] {
  const candidates: ResidualCandidate[] = [];
  const range = interval.right - interval.left;
  const epsilon = range * 1e-6;
  const lo = interval.includeLeft ? interval.left : interval.left + epsilon;
  const hi = interval.includeRight ? interval.right : interval.right - epsilon;

  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const x = lo + t * (hi - lo);
    const r = evaluateResidual(leftFn, rightFn, x);
    if (r !== null) candidates.push({ x, residual: r });
  }

  return candidates;
}

function localRefine(
  leftFn: CompiledFunction,
  rightFn: CompiledFunction,
  x0: number,
  interval: Interval,
  iterations: number
): ResidualCandidate {
  const range = interval.right - interval.left;
  const epsilon = range * 1e-6;
  const lo = interval.includeLeft ? interval.left : interval.left + epsilon;
  const hi = interval.includeRight ? interval.right : interval.right - epsilon;

  let bestX = x0;
  let bestR = evaluateResidual(leftFn, rightFn, x0) ?? Infinity;
  let step = range * 0.01;

  for (let i = 0; i < iterations; i++) {
    const candidates = [
      Math.max(lo, bestX - step),
      Math.min(hi, bestX + step),
    ];

    for (const cx of candidates) {
      const r = evaluateResidual(leftFn, rightFn, cx);
      if (r !== null && r < bestR) {
        bestR = r;
        bestX = cx;
      }
    }

    step *= 0.5;
  }

  return { x: bestX, residual: bestR };
}

function detectManySolutions(
  leftFn: CompiledFunction,
  rightFn: CompiledFunction,
  interval: Interval,
  tolerance: number
): boolean {
  const samples = collectDeterministicSamples(leftFn, rightFn, interval, 50);
  const belowTolerance = samples.filter((s) => s.residual <= tolerance);
  if (belowTolerance.length < 10) return false;

  const range = interval.right - interval.left;
  const distinct = new Set<number>();
  for (const s of belowTolerance) {
    let found = false;
    for (const d of distinct) {
      if (Math.abs(s.x - d) > range * 0.05) continue;
      found = true;
      break;
    }
    if (!found) distinct.add(s.x);
  }

  return distinct.size >= 3;
}

function checkExcludedEndpointRoot(
  leftFn: CompiledFunction,
  rightFn: CompiledFunction,
  interval: Interval,
  best: ResidualCandidate,
  tolerance: number
): string | null {
  const range = interval.right - interval.left;

  if (!interval.includeLeft) {
    const endpointResidual = evaluateResidual(leftFn, rightFn, interval.left);
    if (endpointResidual !== null && endpointResidual <= tolerance) {
      // Endpoint is a root. Check if best candidate is converging toward it.
      const distance = Math.abs(best.x - interval.left);
      if (distance < range * 1e-3 && best.residual > endpointResidual) {
        return "唯一精确根位于被排除的左端点，区间内无有效根。";
      }
    }
  }

  if (!interval.includeRight) {
    const endpointResidual = evaluateResidual(leftFn, rightFn, interval.right);
    if (endpointResidual !== null && endpointResidual <= tolerance) {
      const distance = Math.abs(best.x - interval.right);
      if (distance < range * 1e-3 && best.residual > endpointResidual) {
        return "唯一精确根位于被排除的右端点，区间内无有效根。";
      }
    }
  }

  return null;
}

export interface SolveEquationOptions {
  gaConfig?: GAConfig;
  tolerance?: number;
  deterministicSamples?: number;
  refineIterations?: number;
}

export function solveEquation(
  leftDefinition: { templateId: string; parameters: Record<string, number>; customExpression?: string; variable: string },
  rightConstant: number | null,
  rightDefinition: { templateId: string; parameters: Record<string, number>; customExpression?: string; variable: string } | null,
  interval: Interval,
  options: SolveEquationOptions = {}
): EquationResult {
  const gaConfig = options.gaConfig ?? DEFAULT_GA_CONFIG;
  const tolerance = options.tolerance ?? DEFAULT_EQUATION_RESIDUAL_TOLERANCE;
  const sampleCount = options.deterministicSamples ?? 50;
  const refineIterations = options.refineIterations ?? 30;

  const variable = leftDefinition.variable === "theta" ? "theta" : leftDefinition.variable;
  const leftFn = compileEquationSide(leftDefinition, variable);
  if (!leftFn.valid) {
    return { rootX: null, residual: Infinity, generations: 0, earlyStopped: false, warnings: ["左侧表达式编译失败: " + (leftFn.error ?? "未知错误")] };
  }

  const rightFn = rightDefinition
    ? compileEquationSide(rightDefinition, variable)
    : compileExpression(String(rightConstant ?? 0), variable);

  if (!rightFn.valid) {
    return { rootX: null, residual: Infinity, generations: 0, earlyStopped: false, warnings: ["右侧表达式编译失败: " + (rightFn.error ?? "未知错误")] };
  }

  const residualFn: CompiledFunction = {
    valid: true,
    evaluate: (x: number) => evaluateResidual(leftFn, rightFn, x),
  };

  // Deterministic pre-checks
  const allCandidates: ResidualCandidate[] = [
    ...collectEndpointCandidates(leftFn, rightFn, interval),
    ...collectDeterministicSamples(leftFn, rightFn, interval, sampleCount),
  ];

  if (allCandidates.length === 0) {
    return { rootX: null, residual: Infinity, generations: 0, earlyStopped: false, warnings: ["区间内没有有效的候选值"] };
  }

  // Run GA search
  const gaResult = runGA(residualFn, interval, gaConfig, true);
  const gaCandidate: ResidualCandidate = { x: gaResult.best.x, residual: gaResult.best.fitness };
  if (Number.isFinite(gaCandidate.residual)) {
    allCandidates.push(gaCandidate);
  }

  // Also check GA endpoints
  allCandidates.push(...collectEndpointCandidates(leftFn, rightFn, interval));

  // Find best candidate
  let best = allCandidates.reduce((a, b) => (a.residual < b.residual ? a : b));

  // Local refinement on best
  const refined = localRefine(leftFn, rightFn, best.x, interval, refineIterations);
  if (refined.residual < best.residual) {
    best = refined;
  }

  const warnings: string[] = [];

  // Check for many solutions
  if (detectManySolutions(leftFn, rightFn, interval, tolerance)) {
    warnings.push("该方程在给定区间内可能有多个甚至无穷多个解，以下仅为其中一个近似解。");
  }

  if (best.residual > tolerance) {
    warnings.push("未找到满足精度要求的近似根，以下为最优候选值（残差偏大）。");
    return {
      rootX: null,
      residual: best.residual,
      generations: gaResult.generations,
      earlyStopped: gaResult.earlyStopped,
      warnings,
      history: gaResult.history,
    };
  }

  // Reject candidates that are essentially standing in for an excluded endpoint root.
  // Only reject when: the excluded endpoint itself has low residual (is a root),
  // AND the best candidate is converging toward that endpoint.
  const excludedEndpointCheck = checkExcludedEndpointRoot(
    leftFn, rightFn, interval, best, tolerance
  );
  if (excludedEndpointCheck) {
    warnings.push(excludedEndpointCheck);
    return {
      rootX: null,
      residual: best.residual,
      generations: gaResult.generations,
      earlyStopped: gaResult.earlyStopped,
      warnings,
      history: gaResult.history,
    };
  }

  return {
    rootX: best.x,
    residual: best.residual,
    generations: gaResult.generations,
    earlyStopped: gaResult.earlyStopped,
    warnings,
    history: gaResult.history,
  };
}
