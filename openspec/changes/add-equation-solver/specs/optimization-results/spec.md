## ADDED Requirements

### Requirement: Approximate equation result display
The system SHALL display equation-solving output as approximate numerical results.

#### Scenario: Equation solution is accepted
- **WHEN** equation solving completes with residual within tolerance
- **THEN** the system displays the approximate root and residual error

#### Scenario: Equation solution is not accepted
- **WHEN** equation solving completes with residual above tolerance
- **THEN** the system displays a warning that no sufficiently accurate root was found
- **THEN** the system may display the best candidate and residual for reference

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
