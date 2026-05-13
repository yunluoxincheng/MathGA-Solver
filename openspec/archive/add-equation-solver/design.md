## Context

MathGA Solver currently implements the first-stage function optimization MVP: template-first function input, structured interval entry, safe mathjs evaluation, a real-coded GA engine, result display, convergence history, and function plotting. The UI already lists `方程求解` as a disabled mode, and the roadmap identifies one-variable equation solving as the next stage before multi-root search.

Equation solving fits the existing architecture because a one-variable equation can be transformed into an optimization problem: for `left(x) = right(x)`, minimize `abs(left(x) - right(x))` over the selected interval. This change should reuse existing expression compilation, interval validation, GA configuration, and template metadata instead of introducing a separate math engine.

## Goals / Non-Goals

**Goals:**

- Enable a one-variable equation solving mode that finds one approximate solution.
- Support template-first input for the left equation side and either constant or template-first input for the right side.
- Report approximate root, residual error, generation metadata, warnings, and approximation messaging.
- Preserve the explicit solve snapshot behavior: editing inputs after solving does not mutate prior results until the user solves again.
- Use a deterministic, testable solving path for common equation cases so unit tests do not depend on random GA convergence.
- Treat included endpoints as valid root candidates and excluded endpoints as unavailable candidates.
- Add focused tests around solver behavior and UI-facing data construction.

**Non-Goals:**

- Finding all roots in an interval.
- Symbolic solving or exact forms such as `sqrt(2)`.
- Inequality solving, fitting, geometry optimization, or multi-variable equations.
- Adding new runtime dependencies.

## Decisions

### Reuse the GA Engine Through an Error Objective

The equation solver will compile both sides, evaluate `error = abs(left(x) - right(x))`, and run the existing GA as a minimization search over that error.

To keep equation tests reliable, the solver should perform deterministic residual checks before or around the GA search. At minimum, it should evaluate included endpoints and a fixed set of interval samples before accepting the GA best candidate. The implementation may also inject a seeded/random function into GA utilities or refine the best residual locally, but the public equation solver tests must not rely on chance convergence.

Alternatives considered:

- Implement bisection/Newton methods. These are efficient for some equations but require continuity or derivatives assumptions and would create a separate solving model.
- Use dense sampling only. Sampling is simpler but less consistent with the project goal of demonstrating genetic search.

This keeps equation solving aligned with the product premise and existing GA configuration.

### Use an Equation-Specific Residual Tolerance

The first implementation will classify an accepted approximate solution when `residual <= 1e-6`. This value is separate from `GAConfig.tolerance`, which controls early stopping inside the search process. The equation tolerance should be defined in one place, exposed to tests, and included in result classification logic.

Alternatives considered:

- Reuse `GAConfig.tolerance`. This would couple UI result meaning to a GA convergence parameter and make it harder to tune search behavior independently.
- Require users to configure tolerance immediately. This adds UI complexity before the first equation-solving mode has proven itself.

### Represent Equation Sides as Shared Function Definitions

The left side will use the existing `FunctionDefinition` structure. The right side will support a numeric constant for common textbook equations and a template/custom expression for richer equations.

Alternatives considered:

- Use only a free-form equation string. This conflicts with the template-first interaction principle and increases user syntax errors.
- Require both sides to be templates. This makes simple equations like `x² - 4 = 0` more cumbersome than necessary.

### Return an Equation-Specific Result Type

The solver should return an equation result with `rootX`, `residual`, generation metadata, early-stop state, warnings, and optional history. It should not overload `OptimizationResult.bestFx` because users need to see equation residual rather than an optimized function value.

Alternatives considered:

- Reuse `OptimizationResult` directly. This would blur the difference between `f(x)` and equation error in the UI and tests.

### Keep Single-Root Behavior Explicit

The first equation mode will return one best root candidate. The UI and result copy must not imply that all roots were found.

If deterministic sampling shows many distinct candidates at or below tolerance, or an identity-like equation has near-zero residual across the interval, the result should warn that the equation may have multiple or infinitely many solutions. This is still not multi-root search; it is a guardrail against presenting an arbitrary candidate as the whole answer.

Alternatives considered:

- Add subinterval splitting immediately. The roadmap places multi-root search in the next stage, and adding it now would expand the test surface and UI decisions.

## Risks / Trade-offs

- Genetic search may converge to one root while another root is also present -> label the result as one approximate solution and reserve multi-root search for a later change.
- Some equations may have no exact root in the interval but still have a small best residual -> expose residual clearly and classify results against a tolerance instead of always saying solved.
- Random GA convergence can make root tests flaky -> add deterministic endpoint/sample checks or injectable randomness for the equation solver path.
- Endpoint roots can be missed by random initialization -> explicitly evaluate included endpoints before final classification.
- Identity equations can make every candidate a valid solution -> warn about many-solution behavior instead of implying one unique root.
- Discontinuous expressions can produce misleading near-asymptote candidates -> reuse safe evaluation and warning patterns from optimization, and avoid marking invalid candidates as roots.
- Template reuse can make the page more complex -> keep equation side input as a focused wrapper around existing template components rather than duplicating the whole function form.
- Two-sided equation input can hide trigonometric behavior on the right side -> derive equation-level variable and pi-unit controls from both sides, not only the left side.

## Migration Plan

This is a frontend-only additive change. Implementation can be rolled out by enabling the `方程求解` mode after solver, UI, and tests pass. Rollback is to disable the mode flag and remove the added equation components/solver without affecting existing optimization behavior.

## Open Questions

- Should the first UI expose right-side custom expressions immediately, or only constants plus templates? The proposal allows both, but implementation can keep the layout compact as long as requirements are met.
- Should right-side constants accept only finite numeric input, or also constant math expressions such as `pi` and `sqrt(2)`? The initial implementation should prefer finite numeric input unless custom expression mode is selected.
