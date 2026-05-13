## ADDED Requirements

### Requirement: Function curve display
The system SHALL display a sampled function curve for the function and interval used by the last completed solve.

#### Scenario: Successful finite solve
- **WHEN** the user solves a valid function optimization problem
- **THEN** the result area displays a function plot for the solved function over the solved interval

#### Scenario: User edits inputs after solving
- **WHEN** the user changes the function or interval after a successful solve
- **THEN** the existing function plot continues to represent the previous solve until the user clicks solve again

#### Scenario: Later solve attempt is invalid
- **WHEN** the user has a previous successful solve and a later solve attempt fails validation or expression compilation
- **THEN** the system shows the error while preserving the previous successful function plot as previous-solve data

### Requirement: Cartesian coordinate display
The system SHALL render the function plot as a standard plane rectangular coordinate system with visible x and y axes.

#### Scenario: Origin is inside the visible domain
- **WHEN** the sampled x-domain contains `0` and the sampled y-domain contains `0`
- **THEN** the plot draws the y-axis at `x = 0` and the x-axis at `y = 0`

#### Scenario: Origin is outside the visible domain
- **WHEN** either the sampled x-domain or y-domain does not contain `0`
- **THEN** the plot keeps the corresponding axis on the nearest plot boundary while preserving numeric tick labels for the actual domain

### Requirement: Safe function sampling
The system SHALL sample the function using the same safe evaluation behavior as the solver and treat invalid values as graph gaps.

#### Scenario: Square root has invalid region
- **WHEN** the plotted interval includes values where `sqrt(x)` is invalid
- **THEN** the plot omits those invalid points rather than drawing them as zero or connecting through them

#### Scenario: Reciprocal has vertical asymptote
- **WHEN** the plotted interval crosses a point where `1/x` is invalid
- **THEN** the plot breaks the curve around the invalid point instead of connecting the left and right branches

### Requirement: Open and closed endpoint display
The system SHALL preserve interval inclusion semantics in the plotted sampling domain and endpoint styling.

#### Scenario: Open interval endpoint
- **WHEN** the solved interval excludes its right endpoint
- **THEN** the plot does not render that endpoint as an attained sample and visually marks the endpoint as open or excluded

#### Scenario: Closed interval endpoint
- **WHEN** the solved interval includes its left endpoint and the function value is finite there
- **THEN** the plot may render that endpoint as an attained sample and visually marks the endpoint as closed or included

### Requirement: Extrema markers
The system SHALL mark finite maximum and minimum results on the function plot.

#### Scenario: Finite maximum and minimum
- **WHEN** the solve returns finite maximum and minimum results with finite x and f(x) values
- **THEN** the plot marks both points using visually distinct maximum and minimum markers

#### Scenario: Single target solve
- **WHEN** the user solves only maximum or only minimum
- **THEN** the plot marks only the finite result that was requested

### Requirement: Qualitative and unbounded result display
The system SHALL explain qualitative results on the plot without drawing fake finite markers.

#### Scenario: No finite maximum
- **WHEN** the solve result says no finite maximum exists
- **THEN** the plot does not draw a maximum point marker and shows a concise note that the function tends toward an unbounded or unattained value

#### Scenario: Open endpoint supremum
- **WHEN** the solve result says an endpoint value is an unattained supremum or infimum
- **THEN** the plot does not draw that open endpoint as an attained extremum marker

### Requirement: Discontinuity and y-domain handling
The system SHALL use deterministic sampled-plot rules for discontinuities, suspicious jumps, and y-domain selection.

#### Scenario: Suspicious jump between adjacent finite samples
- **WHEN** adjacent finite samples differ by more than the configured jump threshold
- **THEN** the plot splits the curve at that location rather than drawing a misleading connecting line

#### Scenario: Extreme values near a split
- **WHEN** sampled values around a split would dominate the y-domain and flatten the rest of the curve
- **THEN** the y-domain excludes those split-adjacent extremes and the plot shows a concise sampled/truncated-graph note

#### Scenario: Endpoint asymptote starts with invalid sample
- **WHEN** the plotted interval starts or ends at an excluded point where the function is invalid and nearby finite samples are extreme
- **THEN** the y-domain excludes a small edge band of asymptote-adjacent samples and the plot shows a concise sampled/truncated-graph note

### Requirement: π interval display
The system SHALL preserve π-mode display context in the function plot when the last solve used π-unit endpoints.

#### Scenario: Trigonometric solve uses π mode
- **WHEN** the user solves a trigonometric function with π mode enabled
- **THEN** the plot labels or interval summary uses π-aware endpoint formatting while sampling with numeric radian values
