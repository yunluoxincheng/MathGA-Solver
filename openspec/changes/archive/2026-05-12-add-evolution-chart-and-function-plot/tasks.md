## 1. Data Flow

- [x] 1.1 Add optional generation history to `OptimizationResult` and preserve it for finite GA-backed solves
- [x] 1.2 Keep qualitative/unbounded optimization results history-free and distinguish them from finite results
- [x] 1.3 Represent included-endpoint corrections separately from raw GA history so charts can annotate endpoint-adjusted final values
- [x] 1.4 Add a last-solve visualization snapshot in `SolverPage` containing the compiled function, solved interval, display interval, π-mode flag, expression, and results
- [x] 1.5 Ensure editing inputs after a solve does not mutate the stored visualization snapshot
- [x] 1.6 Preserve the previous successful visualization snapshot when a later solve attempt fails validation or expression compilation

## 2. Function Sampling

- [x] 2.1 Create a function sampling utility that evaluates points through the existing compiled function API
- [x] 2.2 Represent invalid, non-finite, or undefined samples as gaps rather than numeric y values
- [x] 2.3 Respect `includeLeft` and `includeRight` when choosing attained endpoint samples
- [x] 2.4 Split sampled curve segments at invalid samples and large suspicious y jumps using the documented jump-threshold rule
- [x] 2.5 Derive y-domain from kept finite segments and finite attained result markers, excluding split-adjacent extremes that would flatten the plot
- [x] 2.6 Add unit tests for square-root invalid regions, reciprocal asymptote gaps, endpoint asymptote trimming, open endpoint sampling, jump splitting, y-domain trimming, and normal continuous functions

## 3. Evolution Chart

- [x] 3.1 Create an `EvolutionChart` component using the existing `recharts` dependency
- [x] 3.2 Render best f(x) and average f(x) series with target-aware labels and responsive sizing
- [x] 3.3 Omit invalid average-fitness points without hiding finite best-fitness data
- [x] 3.4 Show endpoint-correction reference or annotation when the final finite result comes from included endpoint comparison
- [x] 3.5 Show a concise empty-state message when a result has no finite GA history

## 4. Function Plot

- [x] 4.1 Create a `FunctionPlot` component that renders sampled curve segments as SVG paths
- [x] 4.2 Compute x and y domains from finite kept samples and finite attained result markers
- [x] 4.3 Render open and closed endpoint indicators that match interval inclusion
- [x] 4.4 Mark finite maximum and minimum results with distinct visual markers
- [x] 4.5 Omit markers for qualitative, unbounded, unattained, or non-finite results and show a concise explanatory note
- [x] 4.6 Show a sampled/truncated-graph note when discontinuity splitting or y-domain trimming omits extreme samples
- [x] 4.7 Preserve π-aware endpoint labels when the last solve used π mode
- [x] 4.8 Render the plot as a Cartesian coordinate plane with x/y axes positioned at zero when visible

## 5. UI Integration

- [x] 5.1 Add visualization sections to the result area without replacing the existing numeric result cards
- [x] 5.2 Render evolution charts per finite result so maximum and minimum histories are not merged ambiguously
- [x] 5.3 Render one function plot for the last solve, including all eligible finite result markers
- [x] 5.4 Keep previous-solve visualizations visible and clearly labeled when a later solve attempt fails
- [x] 5.5 Keep the layout responsive on desktop and mobile without nested cards or overlapping labels

## 6. Validation

- [x] 6.1 Add or update tests for history propagation from `runGA` through `optimize`
- [x] 6.2 Add tests for endpoint-corrected final results and chart annotations
- [x] 6.3 Add component tests or focused utility tests for visualization eligibility rules
- [x] 6.4 Run `npm run typecheck`
- [x] 6.5 Run `npm run lint`
- [x] 6.6 Run `npm test -- --runInBand`
- [x] 6.7 Run `npm run build`

## 7. Function Template Standardization

- [x] 7.1 Mark required non-zero coefficients in standard function templates
- [x] 7.2 Normalize invalid zero values for non-degenerate template parameters
- [x] 7.3 Add tests for standard template metadata and preview formatting
