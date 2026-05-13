## Context

MathGA Solver is planned as a browser-based numerical math solving platform for high-school-and-below problems. The first implementation should validate the main product loop: users describe a one-variable function through safe guided inputs, the app converts it into an evaluable expression, and a genetic algorithm searches for approximate maximum and minimum values.

The repository currently contains the planning document but no application implementation. This change can therefore establish the initial Next.js, TypeScript, math utility, solver, and component boundaries without needing to preserve existing runtime APIs.

The strongest product constraint is input reliability. The UI must prioritize choices, templates, dropdowns, and numeric fields. Free-form expression input is useful, but it must not be the main path for ordinary users.

## Goals / Non-Goals

**Goals:**

- Build the first usable function optimization MVP.
- Support template-first function definition with readable math preview.
- Convert friendly display notation into stable internal math expressions.
- Support one-variable search over open, closed, and half-open intervals.
- Implement a reusable real-coded genetic algorithm core.
- Solve maximum, minimum, and combined maximum/minimum requests.
- Show approximate results, iteration metadata, invalid-value handling, and endpoint warnings.

**Non-Goals:**

- Exact symbolic algebra, proof, factorization, or exact radical output.
- Equation solving, multi-root search, function fitting, geometry optimization, inequality solving, or graph plotting.
- Full implicit multiplication parsing for arbitrary free-form expressions.
- Multi-variable optimization.
- Server-side computation or persistence.

## Decisions

### Use Next.js with client-side computation

The solver will run in the browser through client components. This matches the planning document, avoids backend setup, and keeps the MVP easy to deploy as a static-friendly app.

Alternative considered: server-side solving. It would centralize computation but adds unnecessary API and deployment complexity for a small educational numerical solver.

### Use template-first function definitions

Function input will be represented as a structured `FunctionDefinition` containing `templateId`, `variable`, and numeric `parameters`. The UI displays friendly notation such as `x² - 4x + 3`, while internal evaluation uses explicit math syntax such as `a*x^2 + b*x + c`.

Alternative considered: a single free-form expression field. That is faster to build but conflicts with the product goal of minimizing user mistakes.

### Include guarded advanced expressions

The custom expression path exists as an advanced mode separated from the default template flow. It uses `mathjs` compilation and safe evaluation instead of `eval`, and the MVP must not rely on users entering free-form expressions for standard templates.

Alternative considered: omit custom expressions completely. That would reduce scope further, but keeping a guarded advanced path makes the architecture ready for future templates without forcing broad parser work now.

### Use mathjs for expression compilation

Template definitions will generate mathjs-compatible expressions. Values returned from evaluation must be checked with `Number.isFinite`; invalid values are treated as unusable candidates by the solver.

Alternative considered: hand-written JavaScript function generation. That would be faster for a few templates but weaker once custom expressions and more functions are added.

### Use real-coded genetic algorithm operators

Individuals for the MVP are numeric values for one variable. Selection uses tournament selection, crossover uses arithmetic crossover, mutation uses bounded random perturbation, and elite preservation carries the best candidates forward.

Alternative considered: binary encoding. It is useful for teaching classic genetic algorithms but adds conversion complexity and is less natural for continuous function optimization.

### Treat open interval endpoints carefully

Candidate values must be generated inside the allowed interval. Closed endpoints are also evaluated directly for maximum/minimum because a genetic population may miss exact boundaries. If the best result is near an excluded endpoint, the UI reports that the value may represent a supremum or infimum rather than an attained extremum.

Alternative considered: ignore endpoint semantics. That would produce simpler output but can be mathematically misleading for common interval problems.

## Risks / Trade-offs

- Genetic algorithm results are approximate -> Display approximation language, tolerance, generation count, and residual warnings.
- Random search may produce slightly different answers between runs -> Use clear result metadata and consider a seedable RNG later if reproducibility becomes important.
- Template coverage may feel limited -> Start with common high-school templates and keep custom expression mode as an escape hatch.
- Open interval extrema can be misread as true maxima/minima -> Add endpoint proximity detection and explicit warnings.
- Invalid expressions or undefined function regions can degrade search -> Safe evaluation must reject `NaN`, `Infinity`, and `-Infinity` and assign those candidates poor fitness.
- UI-friendly symbols can diverge from internal expressions -> Centralize template metadata so labels, preview, parameters, and expression generation come from one source.
