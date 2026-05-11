## ADDED Requirements

### Requirement: Real-coded genetic algorithm
The system SHALL use real-number individuals for one-variable optimization.

#### Scenario: Population initialization
- **WHEN** optimization starts for interval `[0, 5]`
- **THEN** the system initializes candidate individuals with numeric `x` values inside the allowed interval

#### Scenario: Open endpoint initialization
- **WHEN** optimization starts for interval `(0, 5)`
- **THEN** the system initializes candidate individuals with values strictly greater than `0` and strictly less than `5`

### Requirement: Genetic search operators
The system SHALL support selection, crossover, mutation, and elite preservation during optimization.

#### Scenario: Generation advances
- **WHEN** the genetic algorithm advances one generation
- **THEN** the system selects parents, creates children through crossover, mutates eligible children, preserves configured elite candidates, and evaluates the new population

### Requirement: Maximum and minimum solving
The system SHALL convert maximum and minimum requests into fitness functions suitable for the genetic algorithm.

#### Scenario: Maximum target
- **WHEN** the user requests a maximum
- **THEN** the solver favors candidates with larger evaluated function values

#### Scenario: Minimum target
- **WHEN** the user requests a minimum
- **THEN** the solver favors candidates with smaller evaluated function values

### Requirement: Safe function evaluation
The system SHALL reject invalid evaluated values during optimization.

#### Scenario: Evaluation returns invalid value
- **WHEN** a candidate evaluates to `NaN`, `Infinity`, or `-Infinity`
- **THEN** the solver treats that candidate as having poor fitness

### Requirement: Endpoint evaluation for closed intervals
The system SHALL evaluate included interval endpoints as candidates for extrema.

#### Scenario: Closed endpoint contains maximum
- **WHEN** the true maximum occurs at an included endpoint
- **THEN** the solver considers that endpoint when choosing the final maximum result
