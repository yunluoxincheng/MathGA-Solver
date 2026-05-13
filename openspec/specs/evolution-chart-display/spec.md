## Purpose

Display generation-by-generation convergence history for genetic algorithm runs.

## Requirements

### Requirement: Evolution history display
The system SHALL display genetic algorithm convergence history for the last completed finite optimization solve.

#### Scenario: Finite maximum solve has history
- **WHEN** the user solves a finite maximum problem and the optimizer returns generation history
- **THEN** the result area displays an evolution chart for that maximum result

#### Scenario: Both targets have separate histories
- **WHEN** the user solves both maximum and minimum for the same function
- **THEN** the system displays convergence history for each finite result without merging maximum and minimum histories into one ambiguous series

### Requirement: Evolution chart series
The system SHALL show best function value and average function value per generation when both values are finite.

#### Scenario: Best and average values are finite
- **WHEN** generation history contains finite best fitness and average fitness values
- **THEN** the chart displays both series with target-aware labels such as "best f(x)" and "average f(x)"

#### Scenario: Average value is invalid
- **WHEN** a generation has no finite average fitness value
- **THEN** the chart omits or gaps that average point without hiding the best fitness series

### Requirement: Endpoint-corrected final result consistency
The system SHALL distinguish raw GA search history from final finite extrema that are corrected by included endpoint comparison after GA finishes.

#### Scenario: Included endpoint improves final maximum
- **WHEN** generation history ends with a GA best value that is worse than an included endpoint value
- **THEN** the numeric result card may show the endpoint value, and the evolution chart displays or annotates the endpoint correction separately from the per-generation GA series

#### Scenario: No endpoint correction
- **WHEN** the final finite result comes from GA history rather than endpoint comparison
- **THEN** the evolution chart can show the generation history without an endpoint-correction annotation

### Requirement: Solve snapshot consistency
The system SHALL render the evolution chart from the last explicit solve result rather than from unsolved form edits.

#### Scenario: User edits inputs after solving
- **WHEN** the user changes the function, interval, π mode, or target after a successful solve
- **THEN** the existing evolution chart remains tied to the previous solve until the user clicks solve again

#### Scenario: Later solve attempt is invalid
- **WHEN** the user has a previous successful solve and a later solve attempt fails validation or expression compilation
- **THEN** the system shows the error while preserving the previous successful evolution chart as previous-solve data

### Requirement: Qualitative result handling
The system SHALL not show a misleading convergence chart for results that did not run a finite GA search.

#### Scenario: Unbounded reciprocal maximum
- **WHEN** the solver returns a qualitative result such as no finite maximum
- **THEN** the evolution chart area explains that no finite convergence history is available for that result
