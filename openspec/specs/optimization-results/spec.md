## Purpose

Present optimization results including approximate extrema, warnings, qualitative descriptions, and convergence plots.

## Requirements

### Requirement: Approximate optimization result display
The system SHALL display optimization results as approximate numerical results.

#### Scenario: Maximum result is available
- **WHEN** the solver completes a maximum request
- **THEN** the system displays an approximate variable value and approximate function value

#### Scenario: Both results are available
- **WHEN** the solver completes a request for both maximum and minimum
- **THEN** the system displays separate maximum and minimum result sections

### Requirement: Solver metadata display
The system SHALL display metadata that helps users understand the search process.

#### Scenario: Solver completes normally
- **WHEN** optimization completes
- **THEN** the system displays generation or iteration count and whether early stopping occurred

### Requirement: Approximation disclaimer
The system SHALL tell users that genetic algorithm results are numerical approximations rather than exact symbolic answers.

#### Scenario: Results are rendered
- **WHEN** any optimization result is displayed
- **THEN** the system includes a visible note that the result is approximate

### Requirement: Excluded endpoint warning
The system SHALL warn users when a result is very close to an excluded interval endpoint. "Near" is defined as the distance between the result and the endpoint being less than `max(1e-6, intervalLength * 1e-4)`, where `intervalLength` is `right - left`.

#### Scenario: Best result approaches excluded right endpoint
- **WHEN** the best result is near a right endpoint that is not included
- **THEN** the system warns that the value may be a supremum rather than an attained maximum

#### Scenario: Best result approaches excluded left endpoint
- **WHEN** the best result is near a left endpoint that is not included
- **THEN** the system warns that the value may be an infimum or supremum rather than an attained extremum

### Requirement: Invalid input result state
The system SHALL avoid presenting optimization results when required inputs are invalid.

#### Scenario: Function input is invalid
- **WHEN** the function definition cannot be evaluated safely
- **THEN** the system shows an error state instead of a misleading numerical result

### Requirement: Approximate equation result display
The system SHALL display equation-solving output as approximate numerical results.

#### Scenario: Equation solution is accepted
- **WHEN** equation solving completes with residual within tolerance
- **THEN** the system displays the approximate root and residual error

#### Scenario: Equation solution is not accepted
- **WHEN** equation solving completes with residual above tolerance
- **THEN** the system displays a warning that no sufficiently accurate root was found
- **THEN** the system may display the best candidate and residual for reference

#### Scenario: Equation may have many solutions
- **WHEN** equation solving detects identity-like or many-solution behavior
- **THEN** the system displays a warning that the returned candidate is not the complete solution set
- **THEN** the system does not label the result as a unique root

### Requirement: Equation metadata display
The system SHALL display equation solver metadata using the same result-panel conventions as optimization results.

#### Scenario: Equation solver completes normally
- **WHEN** the equation solver returns metadata
- **THEN** the system displays generation count and early-stop status

### Requirement: Equation approximation disclaimer
The system SHALL tell users that equation-solving results are numerical approximations rather than exact symbolic answers.

#### Scenario: Equation result is rendered
- **WHEN** any equation result is displayed
- **THEN** the result area includes a visible note that the root is approximate

### Requirement: Equation invalid input result state
The system SHALL avoid presenting equation results when required equation inputs are invalid.

#### Scenario: Equation side is invalid
- **WHEN** either equation side cannot be compiled or evaluated safely
- **THEN** the system shows an error state instead of a misleading equation result
