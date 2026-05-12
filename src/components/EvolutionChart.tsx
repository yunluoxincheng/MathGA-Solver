"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { GenerationStats, OptimizationResult } from "@/types";
import { normalizeDisplayZero } from "@/lib/math/interval";

interface EvolutionChartProps {
  result: OptimizationResult;
}

function formatValue(n: number): string {
  const v = normalizeDisplayZero(n, 5e-7);
  if (Math.abs(v) >= 1e4 || (Math.abs(v) < 0.01 && v !== 0)) {
    return v.toExponential(2);
  }
  return Number.isInteger(v) ? v.toString() : v.toFixed(4).replace(/\.?0+$/, "");
}

export default function EvolutionChart({ result }: EvolutionChartProps) {
  const history: GenerationStats[] = result.history ?? [];

  if (history.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-sm text-text-muted bg-bg rounded-lg border border-border/50">
        该结果无收敛历史数据（定性结果或未经过遗传算法搜索）
      </div>
    );
  }

  const data = history.map((gen) => ({
    generation: gen.generation,
    bestFitness: Number.isFinite(gen.bestFitness) ? gen.bestFitness : undefined,
    avgFitness: Number.isFinite(gen.avgFitness) ? gen.avgFitness : undefined,
  }));

  const targetLabel = result.target === "max" ? "最大值" : "最小值";
  const hasEndpointCorrection = result.endpointCorrection !== undefined;

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold mb-2">收敛历史 — {targetLabel}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="generation"
            tick={{ fontSize: 11 }}
            label={{ value: "迭代次数", position: "insideBottomRight", offset: -5, fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={formatValue}
            width={60}
          />
          <Tooltip
            formatter={(value) => formatValue(Number(value))}
            labelFormatter={(label) => `第 ${label} 代`}
          />
          <Legend
            formatter={(value: string) =>
              value === "bestFitness" ? "最优 f(x)" : "平均 f(x)"
            }
          />
          <Line
            type="monotone"
            dataKey="bestFitness"
            stroke="var(--color-cta, #f59e0b)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="avgFitness"
            stroke="var(--color-primary, #6366f1)"
            strokeWidth={1}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
            strokeDasharray="4 2"
          />
          {hasEndpointCorrection && result.endpointCorrection && (
            <ReferenceLine
              y={result.endpointCorrection.fx}
              stroke="#ef4444"
              strokeDasharray="6 3"
              strokeWidth={1}
              label={{
                value: "端点修正",
                position: "insideTopRight",
                fontSize: 10,
                fill: "#ef4444",
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      {hasEndpointCorrection && (
        <p className="text-xs text-text-muted mt-1">
          虚线标注端点修正值（x = {formatValue(result.endpointCorrection!.x)}，f(x) = {formatValue(result.endpointCorrection!.fx)}），最终结果来自端点比较而非末代最优。
        </p>
      )}
    </div>
  );
}
