"use client";

import { useMemo } from "react";
import { Interval, OptimizationResult } from "@/types";
import { sampleFunction } from "@/lib/math/sample";
import { formatEndpoint, normalizeDisplayZero } from "@/lib/math/interval";

interface FunctionPlotProps {
  evaluator: (x: number) => number | null;
  interval: Interval;
  displayInterval: Interval;
  results: OptimizationResult[];
  piUnit: boolean;
}

const SVG_WIDTH = 480;
const SVG_HEIGHT = 280;
const MARGIN = { top: 20, right: 30, bottom: 35, left: 50 };
const PLOT_W = SVG_WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

function formatValue(n: number): string {
  const v = normalizeDisplayZero(n, 5e-7);
  if (Math.abs(v) >= 1e4 || (Math.abs(v) < 0.01 && v !== 0)) {
    return v.toExponential(2);
  }
  return Number.isInteger(v) ? v.toString() : v.toFixed(4).replace(/\.?0+$/, "");
}

interface FiniteMarker {
  x: number;
  y: number;
  type: "max" | "min";
}

export default function FunctionPlot({
  evaluator,
  interval,
  displayInterval,
  results,
  piUnit,
}: FunctionPlotProps) {
  const finiteMarkers = useMemo<FiniteMarker[]>(() => {
    return results
      .filter(
        (r) =>
          !r.qualitativeResult &&
          Number.isFinite(r.bestX) &&
          Number.isFinite(r.bestFx) &&
          (r.target === "max" || r.target === "min")
      )
      .map((r) => ({
        x: r.bestX,
        y: r.bestFx,
        type: r.target as "max" | "min",
      }));
  }, [results]);

  const sampling = useMemo(
    () => sampleFunction(evaluator, interval, 200, finiteMarkers),
    [evaluator, interval, finiteMarkers]
  );

  const { segments, xDomain, yDomain, trimmed } = sampling;

  const hasQualitative = results.some((r) => r.qualitativeResult);

  function mapX(x: number): number {
    return MARGIN.left + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * PLOT_W;
  }

  function mapY(y: number): number {
    return MARGIN.top + PLOT_H - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * PLOT_H;
  }

  const pathDs = segments.map((seg) => {
    const points = seg.points.filter((p) => p.y !== null);
    if (points.length < 2) return "";

    const d = points
      .map((p, i) => {
        const sx = mapX(p.x).toFixed(1);
        const sy = mapY(p.y!).toFixed(1);
        return i === 0 ? `M${sx},${sy}` : `L${sx},${sy}`;
      })
      .join(" ");

    return d;
  });

  const tickCount = 5;
  const xTicks = buildTicks(xDomain, tickCount);
  const yTicks = buildTicks(yDomain, tickCount);
  const xAxisY = axisPositionForZero(yDomain, mapY, "horizontal");
  const yAxisX = axisPositionForZero(xDomain, mapX, "vertical");

  const leftEndpoint = displayInterval.left;
  const rightEndpoint = displayInterval.right;
  const leftLabel = piUnit ? formatEndpoint(leftEndpoint, true) : formatEndpoint(leftEndpoint);
  const rightLabel = piUnit ? formatEndpoint(rightEndpoint, true) : formatEndpoint(rightEndpoint);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-auto"
        style={{ maxHeight: 320 }}
      >
        <defs>
          <marker
            id="function-plot-axis-arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity={0.55} />
          </marker>
        </defs>

        {/* Grid */}
        {xTicks.map((xv) => (
          <line
            key={`xg-${xv}`}
            x1={mapX(xv)}
            y1={MARGIN.top}
            x2={mapX(xv)}
            y2={MARGIN.top + PLOT_H}
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={0.1}
          />
        ))}
        {yTicks.map((yv) => (
          <line
            key={`yg-${yv}`}
            x1={MARGIN.left}
            y1={mapY(yv)}
            x2={MARGIN.left + PLOT_W}
            y2={mapY(yv)}
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={0.1}
          />
        ))}

        {/* Cartesian axes */}
        <line
          x1={MARGIN.left}
          y1={xAxisY}
          x2={MARGIN.left + PLOT_W}
          y2={xAxisY}
          stroke="currentColor"
          strokeWidth={1.2}
          opacity={0.55}
          markerEnd="url(#function-plot-axis-arrow)"
        />
        <line
          x1={yAxisX}
          y1={MARGIN.top + PLOT_H}
          x2={yAxisX}
          y2={MARGIN.top}
          stroke="currentColor"
          strokeWidth={1.2}
          opacity={0.55}
          markerEnd="url(#function-plot-axis-arrow)"
        />
        <text
          x={MARGIN.left + PLOT_W - 2}
          y={Math.max(MARGIN.top + 10, xAxisY - 6)}
          textAnchor="end"
          fontSize={11}
          fill="currentColor"
          opacity={0.65}
          fontWeight="bold"
        >
          x
        </text>
        <text
          x={Math.min(SVG_WIDTH - 18, yAxisX + 7)}
          y={MARGIN.top + 10}
          fontSize={11}
          fill="currentColor"
          opacity={0.65}
          fontWeight="bold"
        >
          y
        </text>

        {/* Curve segments */}
        {pathDs.map((d, i) =>
          d ? (
            <path
              key={`seg-${i}`}
              d={d}
              fill="none"
              stroke="var(--color-primary, #6366f1)"
              strokeWidth={1.5}
            />
          ) : null
        )}

        {/* Endpoint indicators on the curve */}
        {(() => {
          const leftFx = evaluator(interval.left);
          if (leftFx !== null && Number.isFinite(leftFx)) {
            return renderEndpointIndicator(mapX(interval.left), mapY(leftFx), interval.includeLeft);
          }
          return null;
        })()}
        {(() => {
          const rightFx = evaluator(interval.right);
          if (rightFx !== null && Number.isFinite(rightFx)) {
            return renderEndpointIndicator(mapX(interval.right), mapY(rightFx), interval.includeRight);
          }
          return null;
        })()}

        {/* Axis tick labels */}
        {xTicks.map((xv, i) => (
          <text
            key={`xl-${i}`}
            x={mapX(xv)}
            y={SVG_HEIGHT - 5}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            opacity={0.5}
          >
            {formatValue(xv)}
          </text>
        ))}
        {yTicks.map((yv, i) => (
          <text
            key={`yl-${i}`}
            x={MARGIN.left - 5}
            y={mapY(yv) + 3}
            textAnchor="end"
            fontSize={10}
            fill="currentColor"
            opacity={0.5}
          >
            {formatValue(yv)}
          </text>
        ))}

        {/* Result markers */}
        {finiteMarkers.map((m, i) => (
          <g key={`marker-${i}`}>
            <circle
              cx={mapX(m.x)}
              cy={mapY(m.y)}
              r={5}
              fill={m.type === "max" ? "var(--color-cta, #f59e0b)" : "var(--color-primary, #6366f1)"}
              stroke="white"
              strokeWidth={1.5}
            />
            <text
              x={mapX(m.x) + 8}
              y={mapY(m.y) - 6}
              fontSize={10}
              fill={m.type === "max" ? "var(--color-cta, #f59e0b)" : "var(--color-primary, #6366f1)"}
              fontWeight="bold"
            >
              {m.type === "max" ? "MAX" : "MIN"}
            </text>
          </g>
        ))}
      </svg>

      {/* Interval label */}
      <div className="flex justify-between text-xs text-text-muted mt-1 px-1">
        <span>
          {interval.includeLeft ? "[" : "("}
          {leftLabel}
        </span>
        <span>
          {rightLabel}
          {interval.includeRight ? "]" : ")"}
        </span>
      </div>

      {/* Notes */}
      {trimmed && (
        <p className="text-xs text-text-muted mt-1 italic">
          图像为采样近似，不连续处或极端值可能被截断。
        </p>
      )}

      {hasQualitative && (
        <p className="text-xs text-text-muted mt-1 italic">
          部分结果为定性分析（无界或未取到极值），未在图中标注。
        </p>
      )}
    </div>
  );
}

function buildTicks(domain: [number, number], tickCount: number): number[] {
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
    domain[0] + (i / tickCount) * (domain[1] - domain[0])
  );

  if (domain[0] < 0 && domain[1] > 0 && !ticks.some((tick) => Math.abs(tick) < 1e-9)) {
    ticks.push(0);
  }

  return ticks.sort((a, b) => a - b);
}

function axisPositionForZero(
  domain: [number, number],
  mapValue: (value: number) => number,
  orientation: "horizontal" | "vertical"
): number {
  if (domain[0] <= 0 && domain[1] >= 0) {
    return mapValue(0);
  }

  if (orientation === "horizontal") {
    return domain[0] > 0 ? MARGIN.top + PLOT_H : MARGIN.top;
  }

  return domain[0] > 0 ? MARGIN.left : MARGIN.left + PLOT_W;
}

function renderEndpointIndicator(
  cx: number,
  baseline: number,
  included: boolean
) {
  if (included) {
    return (
      <circle cx={cx} cy={baseline} r={3} fill="currentColor" opacity={0.5} />
    );
  }
  return (
    <circle cx={cx} cy={baseline} r={3} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
  );
}
