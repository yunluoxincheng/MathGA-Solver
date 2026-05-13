"use client";

import { EquationResult } from "@/types";
import { formatRadiansAsPi, normalizeDisplayZero } from "@/lib/math/interval";

interface EquationResultPanelProps {
  result: EquationResult;
  piUnit?: boolean;
}

export default function EquationResultPanel({ result, piUnit = false }: EquationResultPanelProps) {
  return (
    <div className="border border-border rounded-lg p-4 bg-bg-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-3 h-3 rounded-full bg-cta" />
        <h3 className="text-lg font-bold">近似根</h3>
      </div>

      {result.rootX !== null ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-muted">近似 x 值</p>
            <p className="text-xl font-bold text-primary">
              {piUnit ? formatRadiansAsPi(result.rootX) : formatNumber(result.rootX)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted">残差</p>
            <p className="text-xl font-bold text-cta">
              {formatNumber(result.residual)}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-muted">最佳候选 x</p>
              <p className="text-xl font-bold text-text-muted italic">无有效根</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">残差</p>
              <p className="text-xl font-bold text-text-muted">
                {Number.isFinite(result.residual) ? formatNumber(result.residual) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-3 text-xs text-text-muted">
        <span>迭代次数: {result.generations}</span>
        {result.earlyStopped && (
          <span className="text-success">已提前收敛</span>
        )}
      </div>

      {result.warnings.length > 0 && (
        <div className="mt-3 px-3 py-2 bg-warning/10 border border-warning/20 rounded-md">
          {result.warnings.map((w, i) => (
            <p key={i} className="text-sm text-warning">
              {w}
            </p>
          ))}
        </div>
      )}

      <div className="mt-3 px-3 py-2 bg-primary/5 border border-primary/10 rounded-md text-xs text-text-muted">
        注意：以上结果为遗传算法数值近似解，并非精确解析解。不同运行可能产生略有差异的结果。
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  const normalizedValue = normalizeDisplayZero(n, 5e-7);
  return Number.isInteger(normalizedValue)
    ? normalizedValue.toString()
    : normalizedValue.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}
