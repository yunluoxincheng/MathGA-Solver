## 1. Types and Solver Core

- [ ] 1.1 Add equation-side and equation-result types to `src/types/index.ts`.
- [ ] 1.2 Implement equation objective evaluation that compiles and evaluates both sides with one shared variable.
- [ ] 1.3 Implement `src/lib/solvers/equation.ts` using the existing GA engine to minimize residual error.
- [ ] 1.4 Add residual tolerance handling so accepted roots and best-candidate/no-accurate-root states are distinct.
- [ ] 1.5 Preserve safe evaluation behavior for invalid, infinite, or undefined equation-side values.

## 2. Equation Input UI

- [ ] 2.1 Add an equation side input component that reuses template-first function definition behavior.
- [ ] 2.2 Support right-side constant input and right-side template/custom expression input.
- [ ] 2.3 Render a friendly equation preview from the left side, equals sign, and right side.
- [ ] 2.4 Keep both equation sides tied to the same selected variable, including `θ` to `theta` internal mapping.

## 3. Mode Integration

- [ ] 3.1 Update `SolverPage` state so users can switch between function optimization and equation solving.
- [ ] 3.2 Enable the `方程求解` navigation mode.
- [ ] 3.3 In equation mode, reuse structured interval input and hide optimization target selection.
- [ ] 3.4 Ensure form edits after a solve do not mutate the previous equation result until the user solves again.

## 4. Equation Results

- [ ] 4.1 Add equation result rendering for approximate root, residual error, generation count, and early-stop state.
- [ ] 4.2 Display a warning when the best residual is above tolerance.
- [ ] 4.3 Display a no-result/error state for invalid equation inputs or no valid candidates.
- [ ] 4.4 Include approximation wording that makes clear the result is numerical and not symbolic.

## 5. Tests and Verification

- [ ] 5.1 Add unit tests for equation solving on simple equations such as `x^2 - 4 = 0`.
- [ ] 5.2 Add tests for multiple-root intervals to confirm the solver reports only one candidate.
- [ ] 5.3 Add tests for residual-above-tolerance and invalid-expression/no-valid-candidate cases.
- [ ] 5.4 Add component or integration tests for equation input preview and mode switching where practical.
- [ ] 5.5 Run `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
