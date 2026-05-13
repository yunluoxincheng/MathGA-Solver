## ADDED Requirements

### Requirement: Single-root equation solving
The system SHALL provide a one-variable equation solving mode that searches for one approximate solution in the selected interval.

#### Scenario: Quadratic equation has a root
- **WHEN** the user solves `x² - 4 = 0` over `[-10, 10]`
- **THEN** the system returns one approximate root candidate within the interval
- **THEN** the system reports the residual error for that candidate

#### Scenario: Multiple roots exist
- **WHEN** the equation has more than one root in the selected interval
- **THEN** the system returns one approximate root candidate
- **THEN** the system does not claim that all roots were found

### Requirement: Equation objective conversion
The system SHALL convert `left(variable) = right(variable)` into a residual-minimization objective based on `abs(left(variable) - right(variable))`.

#### Scenario: Left side equals right side
- **WHEN** a candidate value makes the left and right sides nearly equal
- **THEN** the solver assigns that candidate a lower residual than candidates where the sides are farther apart

#### Scenario: Right side is a constant
- **WHEN** the user solves a template expression against a numeric constant
- **THEN** the solver evaluates the constant as the equation right side for every candidate

#### Scenario: Right side is an expression
- **WHEN** the user solves a template expression against another expression
- **THEN** the solver evaluates both sides with the same selected variable value

### Requirement: Equation result classification
The system SHALL distinguish an accepted approximate solution from the best candidate found with a residual above the configured tolerance.

#### Scenario: Residual is within tolerance
- **WHEN** the best candidate residual is within the configured equation tolerance
- **THEN** the system presents the candidate as an approximate solution

#### Scenario: Residual is above tolerance
- **WHEN** the best candidate residual remains above the configured equation tolerance
- **THEN** the system warns that no sufficiently accurate root was found in the interval
- **THEN** the system may still display the best candidate and residual as diagnostic output

### Requirement: Safe equation evaluation
The system SHALL treat invalid equation-side evaluations as unusable candidates during equation solving.

#### Scenario: Candidate evaluates to invalid value
- **WHEN** either equation side evaluates to `NaN`, `Infinity`, or `-Infinity`
- **THEN** the solver rejects that candidate for root selection

#### Scenario: No valid candidates exist
- **WHEN** every sampled or generated candidate produces invalid equation-side values
- **THEN** the system returns a no-result state instead of a misleading approximate root

### Requirement: Equation solve metadata
The system SHALL expose metadata for equation solving that helps users understand the numerical search process.

#### Scenario: Equation search completes
- **WHEN** the equation solver finishes
- **THEN** the result includes generation count and whether early stopping occurred

#### Scenario: Equation history is available
- **WHEN** the equation solver records per-generation history
- **THEN** the history represents residual minimization rather than function maximum or minimum
