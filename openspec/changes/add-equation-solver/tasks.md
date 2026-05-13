## 1. Types and Solver Core

- [x] 1.1 Add equation-side and equation-result types to `src/types/index.ts`.
- [x] 1.2 Implement equation objective evaluation that compiles and evaluates both sides with one shared variable.
- [x] 1.3 Implement `src/lib/solvers/equation.ts` using the existing GA engine to minimize residual error.
- [x] 1.4 Define an equation-specific residual tolerance, initially `1e-6`, separately from GA early-stop tolerance.
- [x] 1.5 Add residual tolerance handling so accepted roots and best-candidate/no-accurate-root states are distinct.
- [x] 1.6 Explicitly evaluate included interval endpoints as candidate roots while excluding open endpoints.
- [x] 1.7 Add deterministic pre-checks, local refinement, or injectable randomness so equation solver tests do not depend on chance GA convergence.
- [x] 1.8 Preserve safe evaluation behavior for invalid, infinite, or undefined equation-side values.
- [x] 1.9 Detect identity-like or many-solution cases well enough to warn users without claiming all roots were found.

## 2. Equation Input UI

- [x] 2.1 Add an equation side input component that reuses template-first function definition behavior.
- [x] 2.2 Support right-side constant input and right-side template/custom expression input.
- [x] 2.3 Render a friendly equation preview from the left side, equals sign, and right side.
- [x] 2.4 Keep both equation sides tied to the same selected variable, including `θ` to `theta` internal mapping.
- [x] 2.5 Derive trigonometric/pi-unit controls from both equation sides so a right-side sine/cosine expression receives the same interval affordances.

## 3. Mode Integration

- [x] 3.1 Update `SolverPage` state so users can switch between function optimization and equation solving.
- [x] 3.2 Enable the `方程求解` navigation mode.
- [x] 3.3 In equation mode, reuse structured interval input and hide optimization target selection.
- [x] 3.4 Ensure form edits after a solve do not mutate the previous equation result until the user solves again.

## 4. Equation Results

- [x] 4.1 Add equation result rendering for approximate root, residual error, generation count, and early-stop state.
- [x] 4.2 Display a warning when the best residual is above tolerance.
- [x] 4.3 Display a warning when the equation appears to have multiple or infinitely many solutions in the interval.
- [x] 4.4 Display a no-result/error state for invalid equation inputs or no valid candidates.
- [x] 4.5 Include approximation wording that makes clear the result is numerical and not symbolic.

## 5. Tests and Verification

- [x] 5.1 Add unit tests for equation solving on simple equations such as `x^2 - 4 = 0`.
- [x] 5.2 Add tests for multiple-root intervals to confirm the solver reports only one candidate.
- [x] 5.3 Add tests for residual-above-tolerance and invalid-expression/no-valid-candidate cases.
- [x] 5.4 Add tests for roots at included endpoints and no accepted root at excluded endpoints.
- [x] 5.5 Add tests for identity-like equations such as `x = x` or `0 = 0` to verify many-solution warning behavior.
- [x] 5.6 Add tests that make equation solving deterministic through fixed sampling, local refinement, or injected randomness.
- [x] 5.7 Add integration tests for equation expression compilation, preview generation, theta variable mapping, and two-sided expression construction. (Mode switching UI not covered — jest config uses node environment without jsdom for component rendering.)
- [x] 5.8 Run `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
