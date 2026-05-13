## Why

The project has completed the function optimization MVP and already exposes Equation Solver as a planned but disabled mode. The next planning-stage capability should make that mode usable by converting one-variable equations into numerical error minimization, which matches the product roadmap and the existing genetic-algorithm architecture.

## What Changes

- Add a one-variable equation solving mode that finds one approximate root in a user-provided interval.
- Let users define the left side of an equation through the same template-first function input flow used by optimization.
- Let users define the right side as either a numeric constant or another template-based expression.
- Convert `left(x) = right(x)` into an error objective `abs(left(x) - right(x))` and minimize that error with the existing GA infrastructure.
- Display the approximate solution, residual error, generation metadata, warnings, and the standard numerical-approximation disclaimer.
- Enable the existing `方程求解` navigation mode when the new flow is available.
- Keep multi-root search, inequalities, fitting, inverse problems, and geometry optimization out of this change.

## Capabilities

### New Capabilities

- `equation-solving`: Defines one-variable equation input, single-root numerical solving, residual error reporting, and invalid/no-solution result behavior.

### Modified Capabilities

- `function-template-input`: Reuse template-first expression entry for equation sides, including friendly previews and internal expression generation.
- `interval-and-target-input`: Reuse structured interval entry for equation root search while replacing optimization target selection with equation-specific solve behavior.
- `optimization-results`: Extend result presentation conventions to cover equation-solving output and approximation messaging.

## Impact

- Adds solver logic under `src/lib/solvers/`, likely `equation.ts`.
- Adds or adapts UI components under `src/components/` for equation side input and equation result display.
- Updates `src/components/SolverPage.tsx` to support switching between function optimization and equation solving.
- Extends shared types in `src/types/index.ts`.
- Adds focused tests for equation solving, expression construction, invalid input, and residual reporting.
- No new runtime dependency is expected; existing `mathjs`, GA utilities, interval handling, and chart/plot infrastructure should be reused where appropriate.
