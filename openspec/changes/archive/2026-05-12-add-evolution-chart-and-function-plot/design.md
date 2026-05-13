## Context

The function optimization MVP currently returns numerical maximum/minimum results, warnings, and qualitative results for unbounded or unattained extrema. The genetic algorithm engine already records per-generation history internally, but that history is not exposed through `OptimizationResult` or rendered in the UI. The page also evaluates functions only for solving; there is no reusable function sampling path for drawing a curve.

The app is a browser-only Next.js static export. Visualizations must work without server APIs and must preserve the current interaction rule that results only change after the user clicks solve.

## Goals / Non-Goals

**Goals:**

- Display convergence history for each finite optimization result.
- Plot the solved function over the interval used for the last solve.
- Mark finite maximum and minimum results on the function plot.
- Handle invalid samples, open endpoints, discontinuities, and qualitative/unbounded results without drawing misleading markers.
- Keep visualization state tied to the last completed solve, including π-unit interval handling.
- Preserve Cloudflare Pages static export compatibility.

**Non-Goals:**

- Implement equation roots, fitting, geometry, or inequality plots.
- Add symbolic analysis or exact graphing.
- Add pan/zoom, editable graph controls, or exportable chart images.
- Guarantee mathematically complete discontinuity detection for arbitrary custom expressions.

## Decisions

### Use Recharts for the evolution chart

The project already includes `recharts`, and the evolution chart is a standard time-series line chart. Recharts keeps the implementation simple and avoids introducing another dependency.

Alternative considered: render the evolution chart with custom SVG. That would reduce library use but add more layout, axis, tooltip, and responsive behavior code.

### Use a lightweight SVG plot for the function curve

The function plot should be compact, static-export friendly, and easy to control around invalid samples. A local SVG renderer can map sampled points to view coordinates, split the curve at invalid samples, and draw result markers without relying on browser canvas state or a large plotting library.

Alternative considered: use Plotly. Plotly would provide richer graph interactions, but it is heavier than needed for the MVP and may complicate static bundle size.

### Render the function plot as a Cartesian coordinate plane

The function plot should look like a standard plane rectangular coordinate system, not only a generic chart frame. When `0` is inside the x-domain, the y-axis should be drawn at `x = 0`; when `0` is inside the y-domain, the x-axis should be drawn at `y = 0`. If the origin is outside the visible sampled domain, the corresponding axis may sit on the nearest plot boundary while ticks still show the numeric domain.

This keeps common functions such as parabolas, reciprocal branches, and trigonometric curves visually anchored to the mathematical coordinate system users expect.

### Capture a solve snapshot

The page should store the expression, compiled function, solved interval, display interval, π-mode flag, and results from the last explicit solve. Visual components should render from this snapshot instead of live input state.

Alternative considered: recompute plots directly from current form state. That would make charts change while the visible result still represents the previous solve, recreating the stale-result confusion that the MVP already fixed.

### Expose history through optimization results

`runGA` already returns `history`. `OptimizationResult` should include optional `history` for finite GA-backed results. Qualitative results that return before GA runs can omit history and show a visual explanation instead of an empty chart.

Endpoint-corrected finite results need extra care. The existing optimizer can compare included endpoints after GA finishes and replace the final result with a better endpoint value. The evolution chart should therefore be labeled as GA search history and must not imply that the last generation alone produced the final card value. When an included endpoint correction changes the final result, the chart should surface that as a separate endpoint-correction reference or annotation, rather than silently rewriting the generation history.

Alternative considered: run the GA again only for chart data. That would be slow, nondeterministic, and could disagree with the displayed result.

### Sample safely and split invalid curve segments

Function sampling should call the existing safe compiled evaluator and represent invalid values as gaps. The plot should split SVG paths across invalid samples, avoid connecting through vertical asymptotes, and hide markers for qualitative or non-finite results.

Sampling should honor open interval semantics. For an excluded endpoint, the sampler should avoid treating that endpoint as an attained sample while still rendering the curve as approaching it. The plot should visually distinguish open endpoints from closed endpoints, so intervals like `(0, 1)` do not look as if the function value at `x = 1` is included.

The first implementation should use a deterministic discontinuity strategy: split a curve segment when either neighboring sample is invalid/non-finite, or when the absolute y jump is larger than both `10 * medianFiniteAdjacentJump` and `10%` of the current finite y-domain span. Y-domain calculation should use finite values from kept curve segments and finite attained result markers, excluding values adjacent to split jumps. When the plot omits or clips extreme samples this way, show a concise note that the graph is sampled and discontinuities or extreme values may be truncated.

Invalid samples at the interval boundary should also be treated as truncation boundaries for y-domain purposes. This covers endpoint asymptote cases such as `1/x` over `(0, 5]` or `(0, 0.001]`, where the endpoint itself is invalid but the first finite samples can be large enough to flatten the visible curve.

Alternative considered: force every invalid sample to a clipped y value. That can make asymptotes look like real finite points and would be misleading for reciprocal functions.

### Preserve the last successful visualization on failed solves

The visualization snapshot represents the last completed successful solve. If a later click fails interval validation, expression compilation, or safe setup before optimization starts, the UI should show the error but should not replace the chart snapshot with partial or empty data. The visualization area should make clear that any remaining chart belongs to the previous successful solve.

### Keep standard function templates non-degenerate

Named templates should not silently stop matching their advertised function family. Parameters that define the family itself, such as the leading coefficient of a quadratic/cubic, the numerator scale of a reciprocal function, and the amplitude/frequency scale of trigonometric templates, should reject or normalize zero values. This avoids cases like a "quadratic" template producing a linear function or a "reciprocal" template producing a zero expression with a removable-looking singularity.

## Risks / Trade-offs

- Large or extreme function values can flatten most of the curve -> Clamp or derive y-domain from finite sampled values and finite result markers, then show invalid/unbounded notes when relevant.
- Custom expressions can have discontinuities that are not exactly sampled -> Split only where evaluation is invalid or y jumps sharply, and describe the plot as sampled/approximate.
- Multiple results may crowd the right-side result panel -> Keep charts compact, use tabs or stacked sections only if the initial layout becomes too tall.
- Recharts may add bundle weight -> It is already installed; avoid adding Plotly in this change.
- π display can diverge from numeric sampling -> Store both numeric solved interval and display metadata in the solve snapshot.
