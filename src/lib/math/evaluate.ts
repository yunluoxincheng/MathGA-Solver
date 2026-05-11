import { compile, EvalFunction } from "mathjs";

export interface CompiledFunction {
  valid: boolean;
  error?: string;
  evaluate: (x: number) => number | null;
}

export function compileExpression(expression: string, variable: string): CompiledFunction {
  if (!expression || expression.trim() === "") {
    return { valid: false, error: "表达式不能为空", evaluate: () => null };
  }

  try {
    const compiled: EvalFunction = compile(expression);
    return {
      valid: true,
      evaluate: (x: number): number | null => {
        try {
          const result = compiled.evaluate({ [variable]: x });
          if (typeof result !== "number" || !Number.isFinite(result)) {
            return null;
          }
          return result;
        } catch {
          return null;
        }
      },
    };
  } catch (e) {
    return {
      valid: false,
      error: `表达式编译失败: ${e instanceof Error ? e.message : "未知错误"}`,
      evaluate: () => null,
    };
  }
}

export function safeEvaluate(
  compiled: CompiledFunction,
  x: number
): { value: number | null; error?: string } {
  if (!compiled.valid) {
    return { value: null, error: compiled.error };
  }
  const result = compiled.evaluate(x);
  if (result === null) {
    return { value: null, error: `在 x = ${x} 处求值结果无效（可能为 NaN 或 Infinity）` };
  }
  return { value: result };
}
