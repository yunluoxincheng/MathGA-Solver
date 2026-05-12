export type SolverMode = "optimize" | "equation" | "fitting" | "inverse" | "geometry" | "inequality";

export type FunctionTemplateId =
  | "linear"
  | "quadratic"
  | "cubic"
  | "reciprocal"
  | "absolute"
  | "sine"
  | "cosine"
  | "sqrt"
  | "custom";

export type OptimizeTarget = "max" | "min" | "both";

export type VariableName = "x" | "theta";

export interface Interval {
  left: number;
  right: number;
  includeLeft: boolean;
  includeRight: boolean;
}

export interface FunctionDefinition {
  templateId: FunctionTemplateId;
  variable: VariableName;
  parameters: Record<string, number>;
  customExpression?: string;
}

export interface GAConfig {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  eliteCount: number;
  tolerance: number;
  patience: number;
}

export interface OptimizationResult {
  target: OptimizeTarget;
  bestX: number;
  bestFx: number;
  generations: number;
  earlyStopped: boolean;
  warnings: string[];
  qualitativeResult?: {
    title: string;
    description: string;
    xLabel?: string;
    fxLabel?: string;
  };
}

export interface Individual {
  x: number;
  fitness: number;
}

export interface GenerationStats {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  bestX: number;
}

export const DEFAULT_GA_CONFIG: GAConfig = {
  populationSize: 60,
  generations: 200,
  crossoverRate: 0.8,
  mutationRate: 0.1,
  eliteCount: 2,
  tolerance: 1e-8,
  patience: 20,
};

export interface TemplateMetadata {
  id: FunctionTemplateId;
  label: string;
  friendlyPreview: string;
  parameters: TemplateParameter[];
  buildExpression: (params: Record<string, number>, variable: string) => string;
  buildPreview: (params: Record<string, number>, variable: string) => string;
}

export interface TemplateParameter {
  name: string;
  label: string;
  defaultValue: number;
}
