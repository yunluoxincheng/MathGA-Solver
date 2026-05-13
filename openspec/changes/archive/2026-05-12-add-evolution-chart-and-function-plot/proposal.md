## Why

The current function optimization MVP can compute approximate extrema, but users cannot yet see how the genetic algorithm converges or how the answer relates to the function's shape. Adding an evolution chart and function plot makes the solver easier to understand, especially for endpoint extrema, open-interval behavior, and unbounded reciprocal cases.

## What Changes

- Add an evolution chart for function optimization results showing best and average fitness across generations.
- Add a function plot for the solved interval, including the function curve and visual markers for maximum/minimum results when finite.
- Render the function plot as a standard Cartesian coordinate plane with x/y axes, placing axes at zero when the origin falls inside the visible domain.
- Show qualitative/unbounded results on the plot without pretending there is a finite point marker.
- Keep built-in standard function templates non-degenerate, so named templates do not silently become another function type when a required coefficient is zero.
- Keep charts read-only and tied to the last explicit solve action, so editing inputs does not silently mutate existing visual results.
- Keep the last successful visualization snapshot when a later solve attempt fails validation or compilation, while clearly showing the current error.
- Distinguish raw GA search history from final endpoint-corrected extrema so charts do not contradict the numeric result cards.
- Respect open and closed interval endpoint semantics in function sampling and plot endpoint styling.
- Reuse existing solver history and safe evaluation patterns instead of introducing a separate symbolic math engine.
- Preserve static export compatibility for Cloudflare Pages.

## Capabilities

### New Capabilities

- `evolution-chart-display`: Covers displaying genetic algorithm convergence history for the last solve, including best and average fitness per generation.
- `function-plot-display`: Covers sampling and rendering the selected function over the solved interval, marking finite extrema, and explaining omitted markers for unbounded or invalid regions.

### Modified Capabilities

- `function-template-input`: Tightens built-in template parameter rules for standard, non-degenerate function forms.

## Impact

- Adds result visualization components, likely `EvolutionChart` and `FunctionPlot`.
- Extends optimization result data flow so UI can access GA history for each finite solve result.
- Adds function sampling utilities that respect safe evaluation and interval semantics.
- Uses the existing `recharts` dependency for chart rendering where practical.
- Updates tests for history propagation, sampling behavior, and visual-result eligibility.
