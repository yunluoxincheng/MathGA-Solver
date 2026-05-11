"use client";

import { useState, useCallback } from "react";
import {
  FunctionDefinition,
  Interval,
  OptimizeTarget,
  OptimizationResult,
  SolverMode,
  DEFAULT_GA_CONFIG,
} from "@/types";
import { buildExpression } from "@/lib/math/templates";
import { compileExpression } from "@/lib/math/evaluate";
import { applyPiUnit, validateInterval } from "@/lib/math/interval";
import { optimize } from "@/lib/solvers/optimize";
import FunctionTemplateInput from "@/components/FunctionTemplateInput";
import IntervalInput from "@/components/IntervalInput";
import TargetSelection from "@/components/TargetSelection";
import ResultPanel from "@/components/ResultPanel";

const MODES: { id: SolverMode; label: string; available: boolean }[] = [
  { id: "optimize", label: "函数最值", available: true },
  { id: "equation", label: "方程求解", available: false },
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

export default function SolverPage() {
  const [fnDef, setFnDef] = useState<FunctionDefinition>(DEFAULT_FUNCTION);
  const [interval, setInterval] = useState<Interval>(DEFAULT_INTERVAL);
  const [piUnit, setPiUnit] = useState(false);
  const [target, setTarget] = useState<OptimizeTarget>("both");
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [resultPiUnit, setResultPiUnit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTrigTemplate = fnDef.templateId === "sine" || fnDef.templateId === "cosine";

  const handleFunctionChange = useCallback((nextFnDef: FunctionDefinition) => {
    setFnDef(nextFnDef);
    if (nextFnDef.templateId !== "sine" && nextFnDef.templateId !== "cosine") {
      setPiUnit(false);
    }
  }, []);

  const handleSolve = useCallback(() => {
    setError(null);
    setResults([]);

    const intervalValidation = validateInterval(interval);
    if (!intervalValidation.valid) {
      setError(intervalValidation.errors.join("；"));
      return;
    }

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
      } catch (e) {
        setError(e instanceof Error ? e.message : "求解过程出错");
      } finally {
        setLoading(false);
      }
    }, 0);
  }, [fnDef, interval, piUnit, target]);

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold">MathGA Solver</h1>
          <p className="text-white/80 mt-1">遗传算法数学数值求解器</p>
        </div>
      </header>

      <nav className="border-b border-border bg-bg-card">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              disabled={!mode.available}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 whitespace-nowrap
                ${
                  mode.available
                    ? "bg-primary text-white cursor-pointer"
                    : "bg-bg text-text-muted opacity-50 cursor-not-allowed"
                }`}
            >
              {mode.label}
              {!mode.available && (
                <span className="ml-1 text-xs">(即将推出)</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
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
              <ResultPanel
                results={results}
                loading={loading}
                error={error}
                piUnit={resultPiUnit}
              />
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
