## ADDED Requirements

### Requirement: Equation side template input
The system SHALL allow equation sides to reuse the existing template-first function input behavior.

#### Scenario: Left side uses quadratic template
- **WHEN** the user selects the quadratic template for the left side of an equation
- **THEN** the system displays numeric inputs for `a`, `b`, and `c`
- **THEN** the system generates an internal expression equivalent to the selected quadratic side

#### Scenario: Equation side uses custom expression
- **WHEN** the user selects custom expression for an equation side
- **THEN** the system displays the advanced expression input and helper buttons for that side

### Requirement: Equation variable consistency
The system SHALL evaluate both equation sides with the same selected variable.

#### Scenario: User solves with x
- **WHEN** the equation variable is `x`
- **THEN** both left and right expression evaluations use `x` as the variable binding

#### Scenario: User solves with theta
- **WHEN** the equation variable displays as `θ`
- **THEN** both equation sides are evaluated internally using `theta`

### Requirement: Equation preview display
The system SHALL display a readable equation preview assembled from the left and right sides.

#### Scenario: Template and constant preview
- **WHEN** the user defines the left side as `x² - 4` and the right side as `0`
- **THEN** the system displays an equation preview equivalent to `x² - 4 = 0`

#### Scenario: Template and template preview
- **WHEN** both equation sides are template expressions
- **THEN** the system displays both friendly previews separated by an equals sign
