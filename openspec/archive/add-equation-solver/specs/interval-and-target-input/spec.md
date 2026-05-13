## ADDED Requirements

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
