"use client";

import { useCallback } from "react";
import {
  EquationDefinition,
  FunctionDefinition,
} from "@/types";
import FunctionTemplateInput from "@/components/FunctionTemplateInput";
import { buildPreview } from "@/lib/math/templates";

interface EquationInputProps {
  value: EquationDefinition;
  onChange: (def: EquationDefinition) => void;
}

type RightSideMode = "constant" | "expression";

const DEFAULT_RIGHT_EXPRESSION: FunctionDefinition = {
  templateId: "linear",
  variable: "x",
  parameters: { a: 1, b: 0 },
};

export default function EquationInput({ value, onChange }: EquationInputProps) {
  const rightMode: RightSideMode =
    value.right.type === "constant" ? "constant" : "expression";

  const handleLeftChange = useCallback(
    (left: FunctionDefinition) => {
      onChange({
        left,
        right:
          rightMode === "expression" && value.right.type === "expression"
            ? { type: "expression", definition: { ...value.right.definition, variable: left.variable } }
            : value.right,
      });
    },
    [onChange, rightMode, value.right]
  );

  const handleRightModeChange = useCallback(
    (mode: RightSideMode) => {
      if (mode === "constant") {
        onChange({ ...value, right: { type: "constant", value: 0 } });
      } else {
        onChange({
          ...value,
          right: {
            type: "expression",
            definition: { ...DEFAULT_RIGHT_EXPRESSION, variable: value.left.variable },
          },
        });
      }
    },
    [onChange, value]
  );

  const handleConstantChange = useCallback(
    (raw: string) => {
      const num = parseFloat(raw);
      onChange({
        ...value,
        right: { type: "constant", value: isNaN(num) ? 0 : num },
      });
    },
    [onChange, value]
  );

  const handleRightExpressionChange = useCallback(
    (def: FunctionDefinition) => {
      onChange({
        ...value,
        right: { type: "expression", definition: { ...def, variable: value.left.variable } },
      });
    },
    [onChange, value]
  );

  const variable = value.left.variable;
  const displayVar = variable === "theta" ? "θ" : variable;
  const leftPreview = buildPreview(
    value.left.templateId,
    value.left.parameters,
    displayVar
  );
  const rightPreview =
    value.right.type === "constant"
      ? formatConstant(value.right.value)
      : buildPreview(
          value.right.definition.templateId,
          value.right.definition.parameters,
          displayVar
        );

  const isTrigSide = (def: FunctionDefinition) =>
    def.templateId === "sine" || def.templateId === "cosine";
  const showPiAffordance =
    isTrigSide(value.left) ||
    (value.right.type === "expression" && isTrigSide(value.right.definition));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-text-muted">等号左侧</h3>
        <FunctionTemplateInput value={value.left} onChange={handleLeftChange} />
      </div>

      <div className="flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">=</span>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-text-muted">等号右侧</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleRightModeChange("constant")}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors duration-200 cursor-pointer font-semibold
                ${
                  rightMode === "constant"
                    ? "bg-primary text-white border-primary"
                    : "bg-bg-card text-text border-border hover:bg-primary/10"
                }`}
            >
              常数
            </button>
            <button
              type="button"
              onClick={() => handleRightModeChange("expression")}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors duration-200 cursor-pointer font-semibold
                ${
                  rightMode === "expression"
                    ? "bg-primary text-white border-primary"
                    : "bg-bg-card text-text border-border hover:bg-primary/10"
                }`}
            >
              表达式
            </button>
          </div>

          {rightMode === "constant" ? (
            <div>
              <label htmlFor="right-constant" className="block text-sm font-semibold mb-1">
                数值
              </label>
              <input
                id="right-constant"
                type="number"
                step="any"
                value={value.right.type === "constant" ? value.right.value : 0}
                onChange={(e) => handleConstantChange(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 bg-bg-card text-text
                  focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors duration-200"
              />
            </div>
          ) : (
            value.right.type === "expression" && (
              <FunctionTemplateInput
                value={{
                  ...value.right.definition,
                  variable,
                }}
                onChange={handleRightExpressionChange}
                hideVariable={true}
              />
            )
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-primary/5 rounded-lg border border-primary/20">
        <span className="text-sm text-text-muted">预览：</span>
        <span className="ml-2 font-semibold text-primary text-lg">
          {leftPreview} = {rightPreview}
        </span>
      </div>

      {showPiAffordance && (
        <p className="text-xs text-text-muted">
          检测到三角函数，搜索区间可启用 π 单位。
        </p>
      )}
    </div>
  );
}

function formatConstant(n: number): string {
  if (n === 0) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/\.?0+$/, "");
}
