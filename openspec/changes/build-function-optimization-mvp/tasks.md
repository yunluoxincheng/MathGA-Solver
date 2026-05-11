## 1. Project Setup

- [ ] 1.1 Create the Next.js TypeScript application structure if it does not already exist
- [ ] 1.2 Add required runtime dependencies for the MVP, including `mathjs`
- [ ] 1.3 Add base TypeScript types for variables, intervals, function definitions, GA config, and optimization results

## 2. Function Template Input

- [ ] 2.1 Define centralized metadata for supported function templates and their parameters
- [ ] 2.2 Implement conversion from template parameters to internal math expressions
- [ ] 2.3 Implement friendly math preview generation using symbols such as `x²`, `√x`, `π`, and `|x|`
- [ ] 2.4 Build `FunctionTemplateInput` with template selection, variable selection, parameter inputs, and preview
- [ ] 2.5 Add advanced custom expression mode with helper buttons if it fits the MVP scope

## 3. Interval and Target Input

- [ ] 3.1 Implement interval parsing and validation utilities for open, closed, and half-open intervals
- [ ] 3.2 Build `IntervalInput` with separate endpoint value fields and endpoint inclusion controls
- [ ] 3.3 Build target selection for maximum, minimum, and both
- [ ] 3.4 Prevent solver execution when interval input is invalid

## 4. Math Evaluation

- [ ] 4.1 Implement safe expression compilation with `mathjs`
- [ ] 4.2 Implement safe evaluation that rejects `NaN`, `Infinity`, and `-Infinity`
- [ ] 4.3 Add validation messages for function definitions that cannot be evaluated safely

## 5. Genetic Algorithm Core

- [ ] 5.1 Implement one-variable real-coded population initialization within interval bounds
- [ ] 5.2 Implement tournament selection
- [ ] 5.3 Implement arithmetic crossover
- [ ] 5.4 Implement bounded random mutation
- [ ] 5.5 Implement elite preservation and generation history metadata
- [ ] 5.6 Implement early stopping using tolerance and patience config

## 6. Optimization Solver

- [ ] 6.1 Implement maximum solving by favoring larger function values
- [ ] 6.2 Implement minimum solving by favoring smaller function values
- [ ] 6.3 Implement combined maximum and minimum solving for one request
- [ ] 6.4 Evaluate included interval endpoints and compare them against GA results
- [ ] 6.5 Detect results near excluded endpoints and attach warnings

## 7. Page and Result UI

- [ ] 7.1 Build the initial single-page solver layout
- [ ] 7.2 Add mode selection with function optimization enabled and future modes marked unavailable
- [ ] 7.3 Build `ResultPanel` for approximate values, function values, iteration metadata, and warnings
- [ ] 7.4 Add a visible approximation disclaimer to all result states
- [ ] 7.5 Add loading, invalid input, and no-result states

## 8. Verification

- [ ] 8.1 Add focused tests for template conversion and friendly preview generation
- [ ] 8.2 Add focused tests for interval validation and endpoint inclusion behavior
- [ ] 8.3 Add focused tests for safe evaluation and invalid numeric results
- [ ] 8.4 Add focused tests for optimizer behavior on simple functions such as `x² - 4x + 3`
- [ ] 8.5 Run lint, type checking, and available test commands
