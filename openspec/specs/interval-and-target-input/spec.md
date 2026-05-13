## Purpose

Collect structured search interval and optimization target from users with validation and π-unit support.

## Requirements

### Requirement: Structured interval entry
The system SHALL collect interval boundaries through separate controls for left endpoint, right endpoint, and endpoint inclusion.

#### Scenario: User enters a closed interval
- **WHEN** the user enters left endpoint `0`, right endpoint `5`, left bracket `[`, and right bracket `]`
- **THEN** the system stores the interval with `left=0`, `right=5`, `includeLeft=true`, and `includeRight=true`

#### Scenario: User enters an open interval
- **WHEN** the user enters left bracket `(` and right bracket `)`
- **THEN** the system stores both endpoints as excluded

### Requirement: Interval validation
The system SHALL validate that interval endpoints form a usable numeric search range before running optimization.

#### Scenario: Left endpoint is greater than right endpoint
- **WHEN** the user enters a left endpoint greater than the right endpoint
- **THEN** the system prevents solving and shows an interval validation message

#### Scenario: Empty open interval from equal endpoints
- **WHEN** the user enters equal endpoints with either endpoint excluded
- **THEN** the system prevents solving and shows an interval validation message

### Requirement: Optimization target selection
The system SHALL let users choose maximum, minimum, or both maximum and minimum as the optimization target.

#### Scenario: User selects both targets
- **WHEN** the user selects `最大值和最小值`
- **THEN** the system runs or reports both maximum and minimum results for the same function and interval

#### Scenario: User selects maximum only
- **WHEN** the user selects `最大值`
- **THEN** the system reports the maximum result without requiring a minimum result

### Requirement: Equation interval search
The system SHALL use structured interval input to define the search range for equation solving.

#### Scenario: Equation uses closed interval
- **WHEN** the user enters interval `[-10, 10]` for equation solving
- **THEN** the solver searches candidate roots within that interval
- **THEN** the solver explicitly evaluates both included endpoints as possible root candidates

#### Scenario: Equation uses open interval
- **WHEN** the user enters interval `(0, 5)` for equation solving
- **THEN** the solver searches candidate roots strictly inside the interval
- **THEN** the solver does not accept either excluded endpoint as a root candidate

### Requirement: Equation interval validation
The system SHALL validate the equation search interval before compiling and solving the equation.

#### Scenario: Invalid interval blocks equation solving
- **WHEN** the interval endpoints do not form a usable numeric search range
- **THEN** the system prevents equation solving and shows an interval validation message

#### Scenario: Valid interval permits equation solving
- **WHEN** the interval is valid
- **THEN** the system may proceed to compile equation sides and run the equation solver

### Requirement: Equation mode does not require optimization target
The system SHALL not ask the user to choose maximum, minimum, or both while solving an equation.

#### Scenario: Equation mode is active
- **WHEN** the user switches to equation solving mode
- **THEN** the optimization target selector is not required for equation solving
- **THEN** the primary action runs root search rather than maximum or minimum search
