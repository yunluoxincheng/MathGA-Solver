"use client";

import { useState } from "react";
import { Interval } from "@/types";
import { formatEndpoint, validateInterval } from "@/lib/math/interval";

interface IntervalInputProps {
  value: Interval;
  onChange: (interval: Interval) => void;
  showPiControls?: boolean;
  piUnit?: boolean;
  onPiUnitChange?: (enabled: boolean) => void;
}

export default function IntervalInput({
  value,
  onChange,
  showPiControls = false,
  piUnit = false,
  onPiUnitChange,
}: IntervalInputProps) {
  const [leftRaw, setLeftRaw] = useState<string | null>(null);
  const [rightRaw, setRightRaw] = useState<string | null>(null);
  const validation = validateInterval(value);

  return (
    <div className="space-y-4">
      {showPiControls && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onPiUnitChange?.(!piUnit)}
            aria-pressed={piUnit}
            className={`px-3 py-2 border rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer
              ${
                piUnit
                  ? "bg-primary text-white border-primary"
                  : "border-primary text-primary hover:bg-primary/10"
              }`}
            title="启用后端点按 π 的倍数理解，例如 3 表示 3π"
          >
            启用 π
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={() => onChange({ ...value, includeLeft: !value.includeLeft })}
          className="px-3 py-2 border border-border rounded-lg text-2xl font-bold transition-colors duration-200 cursor-pointer
            hover:bg-primary/10"
          aria-label={value.includeLeft ? "左端点为闭区间" : "左端点为开区间"}
          title={value.includeLeft ? "点击切换为开区间 (" : "点击切换为闭区间 ["}
        >
          {value.includeLeft ? "[" : "("}
        </button>

        <div className="flex-1">
          <label htmlFor="left-endpoint" className="block text-sm font-semibold mb-1">
            左端点
          </label>
          <input
            id="left-endpoint"
            type="number"
            step="any"
            value={leftRaw ?? value.left}
            onChange={(e) => {
              const raw = e.target.value;
              setLeftRaw(raw);
              const num = parseFloat(raw);
              if (!isNaN(num)) onChange({ ...value, left: num });
            }}
            onBlur={() => {
              if (leftRaw === "" || leftRaw === "-") {
                setLeftRaw("0");
                onChange({ ...value, left: 0 });
              }
            }}
            className="w-full border border-border rounded-lg px-3 py-2 bg-bg-card text-text
              focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors duration-200"
          />
        </div>

        <span className="text-xl font-bold text-text-muted pb-2">,</span>

        <div className="flex-1">
          <label htmlFor="right-endpoint" className="block text-sm font-semibold mb-1">
            右端点
          </label>
          <input
            id="right-endpoint"
            type="number"
            step="any"
            value={rightRaw ?? value.right}
            onChange={(e) => {
              const raw = e.target.value;
              setRightRaw(raw);
              const num = parseFloat(raw);
              if (!isNaN(num)) onChange({ ...value, right: num });
            }}
            onBlur={() => {
              if (rightRaw === "" || rightRaw === "-") {
                setRightRaw("0");
                onChange({ ...value, right: 0 });
              }
            }}
            className="w-full border border-border rounded-lg px-3 py-2 bg-bg-card text-text
              focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors duration-200"
          />
        </div>

        <button
          type="button"
          onClick={() => onChange({ ...value, includeRight: !value.includeRight })}
          className="px-3 py-2 border border-border rounded-lg text-2xl font-bold transition-colors duration-200 cursor-pointer
            hover:bg-primary/10"
          aria-label={value.includeRight ? "右端点为闭区间" : "右端点为开区间"}
          title={value.includeRight ? "点击切换为开区间 )" : "点击切换为闭区间 ]"}
        >
          {value.includeRight ? "]" : ")"}
        </button>
      </div>

      <div className="text-center text-lg font-semibold text-primary">
        {value.includeLeft ? "[" : "("}
        {formatEndpoint(value.left, piUnit)}, {formatEndpoint(value.right, piUnit)}
        {value.includeRight ? "]" : ")"}
      </div>

      {!validation.valid && (
        <div className="px-3 py-2 bg-error/10 text-error rounded-lg text-sm" role="alert">
          {validation.errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}
