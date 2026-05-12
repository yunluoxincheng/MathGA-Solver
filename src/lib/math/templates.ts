import { FunctionTemplateId, TemplateMetadata } from "@/types";

const TEMPLATES: Record<FunctionTemplateId, TemplateMetadata> = {
  linear: {
    id: "linear",
    label: "一次函数 (ax + b)",
    friendlyPreview: "ax + b",
    parameters: [
      { name: "a", label: "a (≠0)", defaultValue: 1, nonZero: true },
      { name: "b", label: "b", defaultValue: 0 },
    ],
    buildExpression: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      return `${a}*${v} + (${b})`;
    },
    buildPreview: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      return joinTerms([formatCoeff(a, v), formatConst(b)]);
    },
  },

  quadratic: {
    id: "quadratic",
    label: "二次函数 (ax² + bx + c)",
    friendlyPreview: "ax² + bx + c",
    parameters: [
      { name: "a", label: "a (≠0)", defaultValue: 1, nonZero: true },
      { name: "b", label: "b", defaultValue: 0 },
      { name: "c", label: "c", defaultValue: 0 },
    ],
    buildExpression: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      const c = params.c ?? 0;
      return `${a}*${v}^2 + (${b})*${v} + (${c})`;
    },
    buildPreview: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      const c = params.c ?? 0;
      return joinTerms([formatCoeff(a, v + "²"), formatCoeff(b, v), formatConst(c)]);
    },
  },

  cubic: {
    id: "cubic",
    label: "三次函数 (ax³ + bx² + cx + d)",
    friendlyPreview: "ax³ + bx² + cx + d",
    parameters: [
      { name: "a", label: "a (≠0)", defaultValue: 1, nonZero: true },
      { name: "b", label: "b", defaultValue: 0 },
      { name: "c", label: "c", defaultValue: 0 },
      { name: "d", label: "d", defaultValue: 0 },
    ],
    buildExpression: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      const c = params.c ?? 0;
      const d = params.d ?? 0;
      return `${a}*${v}^3 + (${b})*${v}^2 + (${c})*${v} + (${d})`;
    },
    buildPreview: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      const c = params.c ?? 0;
      const d = params.d ?? 0;
      return joinTerms([
        formatCoeff(a, v + "³"),
        formatCoeff(b, v + "²"),
        formatCoeff(c, v),
        formatConst(d),
      ]);
    },
  },

  reciprocal: {
    id: "reciprocal",
    label: "反比例函数 (a/x)",
    friendlyPreview: "a/x",
    parameters: [
      { name: "a", label: "a (≠0)", defaultValue: 1, nonZero: true },
    ],
    buildExpression: (params, v) => {
      const a = params.a ?? 1;
      return `(${a}) / ${v}`;
    },
    buildPreview: (params, v) => {
      const a = params.a ?? 1;
      return a === 1 ? `1/${v}` : `${a}/${v}`;
    },
  },

  absolute: {
    id: "absolute",
    label: "绝对值函数 (a|x| + b)",
    friendlyPreview: "a|x| + b",
    parameters: [
      { name: "a", label: "a (≠0)", defaultValue: 1, nonZero: true },
      { name: "b", label: "b", defaultValue: 0 },
    ],
    buildExpression: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      return `${a} * abs(${v}) + (${b})`;
    },
    buildPreview: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      return joinTerms([formatCoeff(a, `|${v}|`), formatConst(b)]);
    },
  },

  sine: {
    id: "sine",
    label: "正弦函数 (a·sin(bx + c) + d)",
    friendlyPreview: "a·sin(bx + c) + d",
    parameters: [
      { name: "a", label: "a (≠0)", defaultValue: 1, nonZero: true },
      { name: "b", label: "b (≠0)", defaultValue: 1, nonZero: true },
      { name: "c", label: "c", defaultValue: 0 },
      { name: "d", label: "d", defaultValue: 0 },
    ],
    buildExpression: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 1;
      const c = params.c ?? 0;
      const d = params.d ?? 0;
      return `${a} * sin(${b}*${v} + (${c})) + (${d})`;
    },
    buildPreview: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 1;
      const c = params.c ?? 0;
      const d = params.d ?? 0;
      const inner = formatInnerCoeff(b, v);
      const withC = c === 0 ? inner : `${inner}${formatSignedConst(c)}`;
      const trig = formatFunctionScale(a, `sin(${withC})`);
      return joinTerms([trig, formatConst(d)]);
    },
  },

  cosine: {
    id: "cosine",
    label: "余弦函数 (a·cos(bx + c) + d)",
    friendlyPreview: "a·cos(bx + c) + d",
    parameters: [
      { name: "a", label: "a (≠0)", defaultValue: 1, nonZero: true },
      { name: "b", label: "b (≠0)", defaultValue: 1, nonZero: true },
      { name: "c", label: "c", defaultValue: 0 },
      { name: "d", label: "d", defaultValue: 0 },
    ],
    buildExpression: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 1;
      const c = params.c ?? 0;
      const d = params.d ?? 0;
      return `${a} * cos(${b}*${v} + (${c})) + (${d})`;
    },
    buildPreview: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 1;
      const c = params.c ?? 0;
      const d = params.d ?? 0;
      const inner = formatInnerCoeff(b, v);
      const withC = c === 0 ? inner : `${inner}${formatSignedConst(c)}`;
      const trig = formatFunctionScale(a, `cos(${withC})`);
      return joinTerms([trig, formatConst(d)]);
    },
  },

  sqrt: {
    id: "sqrt",
    label: "平方根函数 (a√x + b)",
    friendlyPreview: "a√x + b",
    parameters: [
      { name: "a", label: "a (≠0)", defaultValue: 1, nonZero: true },
      { name: "b", label: "b", defaultValue: 0 },
    ],
    buildExpression: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      return `${a} * sqrt(${v}) + (${b})`;
    },
    buildPreview: (params, v) => {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      return joinTerms([formatCoeff(a, `√${v}`), formatConst(b)]);
    },
  },

  custom: {
    id: "custom",
    label: "自定义表达式",
    friendlyPreview: "f(x) = ?",
    parameters: [],
    buildExpression: () => "",
    buildPreview: (params, v) => {
      void params;
      return `f(${v}) = ?`;
    },
  },
};

function formatCoeff(coeff: number, term: string): string {
  if (coeff === 0) return "";
  if (coeff === 1) return term;
  if (coeff === -1) return ` -${term}`;
  if (coeff > 0) return `${coeff}${term}`;
  return ` - ${Math.abs(coeff)}${term}`;
}

function formatConst(val: number): string {
  if (val === 0) return "";
  if (val > 0) return `${val}`;
  return ` - ${Math.abs(val)}`;
}

function formatSignedConst(val: number): string {
  if (val === 0) return "";
  if (val > 0) return ` + ${val}`;
  return ` - ${Math.abs(val)}`;
}

function formatInnerCoeff(coeff: number, variable: string): string {
  if (coeff === 1) return variable;
  if (coeff === -1) return `-${variable}`;
  return `${coeff}${variable}`;
}

function formatFunctionScale(coeff: number, expression: string): string {
  if (coeff === 1) return expression;
  if (coeff === -1) return `-${expression}`;
  return `${coeff}·${expression}`;
}

function joinTerms(terms: string[]): string {
  const normalized = terms
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term, index) => {
      if (index === 0) return term;
      return term.startsWith("-") ? ` ${term}` : ` + ${term}`;
    });

  return normalized.join("") || "0";
}

export function getTemplate(id: FunctionTemplateId): TemplateMetadata {
  return TEMPLATES[id];
}

export function getAllTemplates(): TemplateMetadata[] {
  return Object.values(TEMPLATES);
}

export function buildExpression(
  templateId: FunctionTemplateId,
  params: Record<string, number>,
  variable: string,
  customExpression?: string
): string {
  if (templateId === "custom") {
    return customExpression ?? "";
  }
  return TEMPLATES[templateId].buildExpression(params, variable);
}

export function buildPreview(
  templateId: FunctionTemplateId,
  params: Record<string, number>,
  variable: string
): string {
  return TEMPLATES[templateId].buildPreview(params, variable);
}
