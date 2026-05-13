## Why

The project needs a focused first implementation that proves the core value of MathGA Solver without trying to become a universal math system immediately. Starting with function maximum/minimum solving keeps the scope small while validating the central idea: convert a familiar high-school math problem into a numerical search task powered by a genetic algorithm.

The planning document also emphasizes reducing user input mistakes. This change makes selection-first, template-based input part of the MVP instead of treating free-form expression entry as the default path.

## What Changes

- Add a first usable web MVP for one-variable function optimization.
- Let users choose a function template, variable, interval, and optimization target instead of hand-writing full expressions.
- Support common function templates needed for the first version, with user-facing math symbols such as `x²`, `√x`, `π`, and `|x|`.
- Convert user-friendly template choices into stable internal math expressions suitable for evaluation.
- Implement a reusable real-coded genetic algorithm core for one-dimensional search.
- Implement maximum, minimum, and combined maximum/minimum solving over open, closed, and half-open intervals.
- Show approximate results, iteration metadata, and warnings when a result is near an excluded endpoint.
- Include custom free-form expressions as an advanced mode, separated from the default template flow, with mathjs compilation and safe evaluation.

## Capabilities

### New Capabilities

- `function-template-input`: Covers selection-first function input, variable selection, parameter entry, friendly math preview, and optional advanced expression entry.
- `interval-and-target-input`: Covers interval endpoint entry, open/closed endpoint selection, and optimization target selection.
- `genetic-optimization-solver`: Covers the real-coded genetic algorithm and function maximum/minimum solving behavior.
- `optimization-results`: Covers result display, approximation metadata, invalid-value handling, and endpoint-related warnings.

### Modified Capabilities

- None.

## Impact

- Adds the initial Next.js application surface for the solver.
- Adds TypeScript types for solver modes, function definitions, intervals, GA config, and optimization results.
- Adds math expression/template utilities, safe evaluation, validation, and interval helpers.
- Adds the genetic algorithm implementation and the first `optimizeSolver`.
- Adds UI components such as `FunctionTemplateInput`, `IntervalInput`, `SolverSelector`, `ResultPanel`, and optionally an evolution summary area.
- Introduces runtime dependencies expected by the planning document, primarily `mathjs`; `recharts` may be included only if the MVP includes a visible evolution chart.
