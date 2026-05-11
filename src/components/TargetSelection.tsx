"use client";

import { OptimizeTarget } from "@/types";

interface TargetSelectionProps {
  value: OptimizeTarget;
  onChange: (target: OptimizeTarget) => void;
}

const TARGET_OPTIONS: { value: OptimizeTarget; label: string }[] = [
  { value: "max", label: "最大值" },
  { value: "min", label: "最小值" },
  { value: "both", label: "最大值和最小值" },
];

export default function TargetSelection({ value, onChange }: TargetSelectionProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {TARGET_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors duration-200 cursor-pointer
            ${
              value === opt.value
                ? "bg-primary text-white border-primary"
                : "bg-bg-card text-text border-border hover:bg-primary/10"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
