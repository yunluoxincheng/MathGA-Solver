"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import {
  EquationDefinition,
  FunctionDefinition,
  Interval,
  OptimizeTarget,
  OptimizationResult,
  SolverMode,
  VisualizationSnapshot,
  DEFAULT_GA_CONFIG,
} from "@/types";
import { buildExpression } from "@/lib/math/templates";
import { compileExpression } from "@/lib/math/evaluate";
import { applyPiUnit, validateInterval } from "@/lib/math/interval";
import { optimize } from "@/lib/solvers/optimize";
import { solveEquation } from "@/lib/solvers/equation";
import EquationInput from "@/components/EquationInput";
import FunctionTemplateInput from "@/components/FunctionTemplateInput";
import IntervalInput from "@/components/IntervalInput";
import TargetSelection from "@/components/TargetSelection";
import ResultPanel from "@/components/ResultPanel";
import EquationResultPanel from "@/components/EquationResultPanel";
import StartupSplash from "@/components/StartupSplash";
import { EquationResult } from "@/types";

const MODES: { id: SolverMode; label: string; available: boolean }[] = [
  { id: "optimize", label: "函数最值", available: true },
  { id: "equation", label: "方程求解", available: true },
  { id: "fitting", label: "函数拟合", available: false },
  { id: "inverse", label: "反函数", available: false },
  { id: "geometry", label: "几何优化", available: false },
  { id: "inequality", label: "不等式", available: false },
];

const DEFAULT_FUNCTION: FunctionDefinition = {
  templateId: "quadratic",
  variable: "x",
  parameters: { a: 1, b: -4, c: 3 },
};

const DEFAULT_INTERVAL: Interval = {
  left: 0,
  right: 5,
  includeLeft: true,
  includeRight: true,
};

const DEFAULT_EQUATION: EquationDefinition = {
  left: {
    templateId: "quadratic",
    variable: "x",
    parameters: { a: 1, b: 0, c: -4 },
  },
  right: { type: "constant", value: 0 },
};

export default function SolverPage() {
  const [mode, setMode] = useState<SolverMode>("optimize");
  const [fnDef, setFnDef] = useState<FunctionDefinition>(DEFAULT_FUNCTION);
  const [eqDef, setEqDef] = useState<EquationDefinition>(DEFAULT_EQUATION);
  const [interval, setInterval] = useState<Interval>(DEFAULT_INTERVAL);
  const [piUnit, setPiUnit] = useState(false);
  const [target, setTarget] = useState<OptimizeTarget>("both");
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [equationResult, setEquationResult] = useState<EquationResult | null>(null);
  const [resultPiUnit, setResultPiUnit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vizSnapshot, setVizSnapshot] = useState<VisualizationSnapshot | null>(null);

  const isTrigTemplate =
    mode === "optimize"
      ? fnDef.templateId === "sine" || fnDef.templateId === "cosine"
      : hasTrigSide(eqDef);

  const handleFunctionChange = useCallback((nextFnDef: FunctionDefinition) => {
    setFnDef(nextFnDef);
    if (nextFnDef.templateId !== "sine" && nextFnDef.templateId !== "cosine") {
      setPiUnit(false);
    }
  }, []);

  const handleEquationChange = useCallback((nextEqDef: EquationDefinition) => {
    setEqDef(nextEqDef);
    if (!hasTrigSide(nextEqDef)) {
      setPiUnit(false);
    }
  }, []);

  const handleModeChange = useCallback((newMode: SolverMode) => {
    setMode(newMode);
    setError(null);
    setResults([]);
    setEquationResult(null);
    setVizSnapshot(null);
    setPiUnit(false);
  }, []);

  const handleOptimizeSolve = useCallback(() => {
    const internalVar = fnDef.variable === "theta" ? "theta" : fnDef.variable;
    const expression =
      fnDef.templateId === "custom"
        ? (fnDef.customExpression ?? "")
        : buildExpression(fnDef.templateId, fnDef.parameters, internalVar);

    if (!expression.trim()) {
      setError("表达式不能为空");
      return;
    }

    const compiled = compileExpression(expression, internalVar);
    if (!compiled.valid) {
      setError(compiled.error ?? "表达式编译失败");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const solvingInterval = piUnit ? applyPiUnit(interval) : interval;
        const res = optimize(compiled, solvingInterval, target, DEFAULT_GA_CONFIG);
        setResultPiUnit(piUnit);
        setResults(res);
        setEquationResult(null);
        setVizSnapshot({
          compiledFn: compiled.evaluate,
          solvedInterval: solvingInterval,
          displayInterval: interval,
          piUnit,
          expression,
          results: res,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "求解过程出错");
      } finally {
        setLoading(false);
      }
    }, 0);
  }, [fnDef, interval, piUnit, target]);

  const handleEquationSolve = useCallback(() => {
    const leftDef = eqDef.left;
    const rightConstant = eqDef.right.type === "constant" ? eqDef.right.value : null;
    const rightDef = eqDef.right.type === "expression" ? eqDef.right.definition : null;

    setLoading(true);

    setTimeout(() => {
      try {
        const solvingInterval = piUnit ? applyPiUnit(interval) : interval;
        const result = solveEquation(leftDef, rightConstant, rightDef, solvingInterval);
        setResultPiUnit(piUnit);
        setEquationResult(result);
        setResults([]);
        setVizSnapshot(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "求解过程出错");
      } finally {
        setLoading(false);
      }
    }, 0);
  }, [eqDef, interval, piUnit]);

  const handleSolve = useCallback(() => {
    setError(null);

    const intervalValidation = validateInterval(interval);
    if (!intervalValidation.valid) {
      setError(intervalValidation.errors.join("；"));
      return;
    }

    if (mode === "optimize") {
      handleOptimizeSolve();
    } else {
      handleEquationSolve();
    }
  }, [mode, handleOptimizeSolve, handleEquationSolve, interval]);

  return (
    <div className="min-h-screen">
      <StartupSplash />

      <header className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white shadow-sm shadow-primary-dark/20">
              <Image
                src="/mathga-icon-192.png"
                alt=""
                width={42}
                height={42}
                priority
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">MathGA Solver</h1>
              <p className="text-white/80 mt-1">遗传算法数学数值求解器</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-bg-card">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              disabled={!m.available}
              onClick={() => m.available && handleModeChange(m.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 whitespace-nowrap
                ${
                  !m.available
                    ? "bg-bg text-text-muted opacity-50 cursor-not-allowed"
                    : mode === m.id
                      ? "bg-primary text-white cursor-pointer"
                      : "bg-bg-card text-text border border-border hover:bg-primary/10 cursor-pointer"
                }`}
            >
              {m.label}
              {!m.available && (
                <span className="ml-1 text-xs">(即将推出)</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {mode === "optimize" ? (
              <>
                <section className="border border-border rounded-xl p-5 bg-bg-card">
                  <h2 className="text-lg font-bold mb-4">函数定义</h2>
                  <FunctionTemplateInput value={fnDef} onChange={handleFunctionChange} />
                </section>

                <section className="border border-border rounded-xl p-5 bg-bg-card">
                  <h2 className="text-lg font-bold mb-4">搜索区间</h2>
                  <IntervalInput
                    value={interval}
                    onChange={setInterval}
                    showPiControls={isTrigTemplate}
                    piUnit={piUnit}
                    onPiUnitChange={setPiUnit}
                  />
                </section>

                <section className="border border-border rounded-xl p-5 bg-bg-card">
                  <h2 className="text-lg font-bold mb-4">优化目标</h2>
                  <TargetSelection value={target} onChange={setTarget} />
                </section>
              </>
            ) : (
              <>
                <section className="border border-border rounded-xl p-5 bg-bg-card">
                  <h2 className="text-lg font-bold mb-4">方程定义</h2>
                  <EquationInput value={eqDef} onChange={handleEquationChange} />
                </section>

                <section className="border border-border rounded-xl p-5 bg-bg-card">
                  <h2 className="text-lg font-bold mb-4">搜索区间</h2>
                  <IntervalInput
                    value={interval}
                    onChange={setInterval}
                    showPiControls={isTrigTemplate}
                    piUnit={piUnit}
                    onPiUnitChange={setPiUnit}
                  />
                </section>
              </>
            )}

            <button
              type="button"
              onClick={handleSolve}
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-colors duration-200 cursor-pointer
                bg-cta hover:bg-cta-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "搜索中..." : "开始求解"}
            </button>
          </div>

          <div>
            <section className="border border-border rounded-xl p-5 bg-bg-card sticky top-4">
              <h2 className="text-lg font-bold mb-4">求解结果</h2>
              {mode === "optimize" ? (
                <ResultPanel
                  results={results}
                  loading={loading}
                  error={error}
                  piUnit={resultPiUnit}
                  vizSnapshot={vizSnapshot}
                />
              ) : (
                <EquationResultsView
                  result={equationResult}
                  loading={loading}
                  error={error}
                  piUnit={resultPiUnit}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-text-muted">
          MathGA Solver — 基于遗传算法的数学近似求解器 | 所有计算在浏览器本地完成
        </div>
      </footer>
    </div>
  );
}

function hasTrigSide(eq: EquationDefinition): boolean {
  const isTrig = (def: FunctionDefinition) =>
    def.templateId === "sine" || def.templateId === "cosine";
  if (isTrig(eq.left)) return true;
  return eq.right.type === "expression" && isTrig(eq.right.definition);
}

interface EquationResultsViewProps {
  result: EquationResult | null;
  loading: boolean;
  error: string | null;
  piUnit?: boolean;
}

function EquationResultsView({ result, loading, error, piUnit }: EquationResultsViewProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted">方程求解中...</p>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="px-4 py-3 bg-error/10 border border-error/20 rounded-lg" role="alert">
        <p className="text-error font-semibold">输入无效</p>
        <p className="text-error/80 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">定义方程和搜索区间后，点击求解</p>
        <p className="text-sm mt-1">结果将显示在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-3 bg-error/10 border border-error/20 rounded-lg" role="alert">
          <p className="text-error font-semibold">输入无效</p>
          <p className="text-error/80 text-sm mt-1">{error}</p>
        </div>
      )}
      <EquationResultPanel result={result} piUnit={piUnit} />
    </div>
  );
}
