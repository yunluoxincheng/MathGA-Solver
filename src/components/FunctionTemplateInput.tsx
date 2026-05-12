"use client";

import { useState } from "react";
import { FunctionDefinition, FunctionTemplateId, VariableName } from "@/types";
import { getAllTemplates, buildPreview } from "@/lib/math/templates";

interface FunctionTemplateInputProps {
  value: FunctionDefinition;
  onChange: (def: FunctionDefinition) => void;
}

const VARIABLE_OPTIONS: { value: VariableName; label: string }[] = [
  { value: "x", label: "x" },
  { value: "theta", label: "θ" },
];

export default function FunctionTemplateInput({
  value,
  onChange,
}: FunctionTemplateInputProps) {
  const [openSelect, setOpenSelect] = useState<"template" | "variable" | null>(null);
  const [paramRawValues, setParamRawValues] = useState<Record<string, string>>({});
  const templates = getAllTemplates();
  const currentTemplate = templates.find((t) => t.id === value.templateId);
  const preview = buildPreview(
    value.templateId,
    value.parameters,
    value.variable === "theta" ? "θ" : value.variable
  );

  function handleTemplateChange(templateId: FunctionTemplateId) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const params: Record<string, number> = {};
    template.parameters.forEach((p) => {
      params[p.name] = p.defaultValue;
    });
    setParamRawValues({});
    onChange({
      ...value,
      templateId,
      parameters: params,
      customExpression: templateId === "custom" ? "" : undefined,
    });
  }

  function handleParamChange(name: string, raw: string) {
    setParamRawValues((prev) => ({ ...prev, [name]: raw }));
    if (raw !== "" && raw !== "-") {
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        onChange({
          ...value,
          parameters: { ...value.parameters, [name]: num },
        });
      }
    }
  }

  function handleParamBlur(name: string) {
    const raw = paramRawValues[name];
    if (raw === "" || raw === "-") {
      setParamRawValues((prev) => ({ ...prev, [name]: "0" }));
      onChange({
        ...value,
        parameters: { ...value.parameters, [name]: 0 },
      });
    }
  }

  function handleVariableChange(variable: VariableName) {
    onChange({ ...value, variable });
  }

  function handleCustomExpression(customExpression: string) {
    onChange({ ...value, customExpression });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_8rem] gap-3">
        <div>
          <label id="template-select-label" className="block text-sm font-semibold mb-1.5">
            函数模板
          </label>
          <StyledSelect
            labelledBy="template-select-label"
            open={openSelect === "template"}
            onOpenChange={(open) => setOpenSelect(open ? "template" : null)}
            value={value.templateId}
            displayValue={currentTemplate?.label ?? "选择函数模板"}
            options={templates.map((t) => ({ value: t.id, label: t.label }))}
            onChange={(nextValue) => handleTemplateChange(nextValue as FunctionTemplateId)}
          />
        </div>

        <div>
          <label id="variable-select-label" className="block text-sm font-semibold mb-1.5">
            变量
          </label>
          <StyledSelect
            labelledBy="variable-select-label"
            open={openSelect === "variable"}
            onOpenChange={(open) => setOpenSelect(open ? "variable" : null)}
            value={value.variable}
            displayValue={
              VARIABLE_OPTIONS.find((option) => option.value === value.variable)?.label ?? "x"
            }
            options={VARIABLE_OPTIONS}
            onChange={(nextValue) => handleVariableChange(nextValue as VariableName)}
          />
        </div>
      </div>

      {value.templateId === "custom" ? (
        <div>
          <label htmlFor="custom-expression" className="block text-sm font-semibold mb-1.5">
            自定义表达式
          </label>
          <input
            id="custom-expression"
            type="text"
            value={value.customExpression ?? ""}
            onChange={(e) => handleCustomExpression(e.target.value)}
            placeholder="例如: x^2 - 4*x + 3"
            className="w-full border border-border rounded-lg px-3 py-2 bg-bg-card text-text
              focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors duration-200 font-mono"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["x^2", "sqrt(x)", "sin(x)", "cos(x)", "abs(x)", "pi"].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  const expr = value.customExpression ?? "";
                  handleCustomExpression(expr + sym);
                }}
                className="px-2.5 py-1 text-xs border border-border rounded-md bg-bg-card
                  hover:bg-primary/10 transition-colors duration-200 cursor-pointer"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      ) : (
        currentTemplate && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentTemplate.parameters.map((p) => (
              <div key={p.name}>
                <label htmlFor={`param-${p.name}`} className="block text-sm font-semibold mb-1">
                  {p.label}
                </label>
                <input
                  id={`param-${p.name}`}
                  type="number"
                  step="any"
                  value={paramRawValues[p.name] ?? String(value.parameters[p.name] ?? p.defaultValue)}
                  onChange={(e) => handleParamChange(p.name, e.target.value)}
                  onBlur={() => handleParamBlur(p.name)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-bg-card text-text
                    focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors duration-200"
                />
              </div>
            ))}
          </div>
        )
      )}

      <div className="px-4 py-3 bg-primary/5 rounded-lg border border-primary/20">
        <span className="text-sm text-text-muted">预览：</span>
        <span className="ml-2 font-semibold text-primary text-lg">
          f({value.variable === "theta" ? "θ" : value.variable}) = {preview}
        </span>
      </div>
    </div>
  );
}

interface StyledSelectOption {
  value: string;
  label: string;
}

interface StyledSelectProps {
  labelledBy: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  displayValue: string;
  options: StyledSelectOption[];
  onChange: (value: string) => void;
}

function StyledSelect({
  labelledBy,
  open,
  onOpenChange,
  value,
  displayValue,
  options,
  onChange,
}: StyledSelectProps) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-labelledby={labelledBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="h-11 w-full border-2 border-border rounded-lg px-3 py-2 bg-bg text-text font-semibold
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          hover:border-primary/60 transition-colors duration-200 cursor-pointer
          flex items-center justify-between gap-2 text-left"
      >
        <span className="truncate">{displayValue}</span>
        <span
          aria-hidden="true"
          className={`h-2 w-2 shrink-0 border-r-2 border-b-2 border-primary transition-transform duration-200
            ${open ? "rotate-45 -translate-y-0.5" : "rotate-135 translate-x-0.5"}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={labelledBy}
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border-2 border-border bg-bg-card
            shadow-lg"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  onOpenChange(false);
                }}
                className={`w-full px-3 py-2.5 text-left font-semibold transition-colors duration-150 cursor-pointer
                  ${
                    selected
                      ? "bg-primary text-white"
                      : "bg-bg-card text-text hover:bg-primary/10"
                  }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
