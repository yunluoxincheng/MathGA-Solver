## ADDED Requirements

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
