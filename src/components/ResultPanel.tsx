"use client";

import { OptimizationResult } from "@/types";
import { formatRadiansAsPi } from "@/lib/math/interval";

interface ResultPanelProps {
  results: OptimizationResult[];
  loading: boolean;
  error: string | null;
  piUnit?: boolean;
}

export default function ResultPanel({
  results,
  loading,
  error,
  piUnit = false,
}: ResultPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted">遗传算法搜索中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 bg-error/10 border border-error/20 rounded-lg" role="alert">
        <p className="text-error font-semibold">输入无效</p>
        <p className="text-error/80 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">配置函数和区间后，点击求解</p>
        <p className="text-sm mt-1">结果将显示在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, idx) => (
        <div
          key={idx}
          className="border border-border rounded-lg p-4 bg-bg-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                result.target === "max" ? "bg-cta" : "bg-primary"
              }`}
            />
            <h3 className="text-lg font-bold">
              {result.target === "max" ? "最大值" : "最小值"}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-muted">
                {result.qualitativeResult ? "趋近方式" : "近似 x 值"}
              </p>
              <p className="text-xl font-bold text-primary">
                {result.qualitativeResult?.xLabel ?? formatXValue(result.bestX, piUnit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">
                {result.qualitativeResult ? "函数趋势" : "近似 f(x) 值"}
              </p>
              <p className="text-xl font-bold text-cta">
                {result.qualitativeResult?.fxLabel ?? formatNumber(result.bestFx)}
              </p>
            </div>
          </div>

          {result.qualitativeResult && (
            <div className="mt-3 px-3 py-2 bg-primary/5 border border-primary/10 rounded-md">
              <p className="text-sm font-semibold text-primary">
                {result.qualitativeResult.title}
              </p>
              <p className="text-sm text-text-muted mt-1">
                {result.qualitativeResult.description}
              </p>
            </div>
          )}

          {!result.qualitativeResult && (
            <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-3 text-xs text-text-muted">
              <span>迭代次数: {result.generations}</span>
              {result.earlyStopped && (
                <span className="text-success">已提前收敛</span>
              )}
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="mt-3 px-3 py-2 bg-warning/10 border border-warning/20 rounded-md">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-sm text-warning">
                  {w}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="px-3 py-2 bg-primary/5 border border-primary/10 rounded-md text-xs text-text-muted">
        注意：以上结果为遗传算法数值近似解，并非精确解析解。不同运行可能产生略有差异的结果。
      </div>
    </div>
  );
}

function formatXValue(n: number, piUnit: boolean): string {
  return piUnit ? formatRadiansAsPi(n) : formatNumber(n);
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}
