## Purpose

Provide template-first function definition with parameter inputs, variable selection, and friendly math previews.

## Requirements

### Requirement: Template-first function selection
The system SHALL let users define the optimization function by selecting a function template before entering parameters.

#### Scenario: User selects a quadratic template
- **WHEN** the user selects the quadratic function template
- **THEN** the system displays numeric inputs for `a`, `b`, and `c`
- **THEN** the system displays the template as `ax² + bx + c`

#### Scenario: User changes templates
- **WHEN** the user changes from one function template to another
- **THEN** the system updates the visible parameter inputs to match the newly selected template

### Requirement: Supported MVP function templates
The system SHALL support the MVP function templates required for one-variable optimization: linear, quadratic, cubic, reciprocal, absolute value, sine, cosine, square root, and custom advanced expression.

#### Scenario: User opens function template choices
- **WHEN** the user opens the function template selector
- **THEN** the system lists the supported MVP templates with readable math labels

### Requirement: Variable selection
The system SHALL provide variable selection instead of requiring users to type the variable name manually.

#### Scenario: MVP variable defaults to x
- **WHEN** the user opens the function input form for the MVP
- **THEN** the system selects `x` as the default variable

#### Scenario: Theta display maps internally
- **WHEN** a later enabled variable displays as `θ`
- **THEN** the system stores and evaluates it internally as `theta`

### Requirement: Friendly math preview
The system SHALL display user-facing math symbols in previews while preserving an internal expression suitable for calculation.

#### Scenario: Preview quadratic parameters
- **WHEN** the user selects the quadratic template with `a=1`, `b=-4`, and `c=3`
- **THEN** the system displays the preview as `f(x) = x² - 4x + 3`
- **THEN** the generated internal expression is equivalent to `1*x^2 + (-4)*x + 3`

#### Scenario: Display common friendly symbols
- **WHEN** the system renders function labels, previews, or helper buttons
- **THEN** the system uses friendly symbols such as `x²`, `x³`, `√x`, `|x|`, `π`, `sin x`, and `cos x`

### Requirement: Advanced expression mode
The system SHALL keep free-form expression input separate from the default template-based flow.

#### Scenario: Custom expression selected
- **WHEN** the user selects the custom expression template
- **THEN** the system displays an advanced expression input area
- **THEN** the system provides helper buttons for common symbols

#### Scenario: Default templates avoid free-form input
- **WHEN** the user selects a standard function template
- **THEN** the system does not require the user to type a full expression manually

### Requirement: Non-degenerate standard templates
The system SHALL keep built-in standard function templates from degenerating into a different advertised function family when a required coefficient is zero.

#### Scenario: Leading polynomial coefficient is zero
- **WHEN** the user enters `0` for the leading coefficient of a linear, quadratic, or cubic template
- **THEN** the system normalizes or rejects that value so the selected template still represents the named function family

#### Scenario: Reciprocal scale is zero
- **WHEN** the user enters `0` for the reciprocal template scale coefficient
- **THEN** the system normalizes or rejects that value so the template does not become a zero function with a misleading reciprocal label

#### Scenario: Trigonometric amplitude or frequency is zero
- **WHEN** the user enters `0` for the amplitude or frequency parameter of a sine or cosine template
- **THEN** the system normalizes or rejects that value so the selected template remains a trigonometric function

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

#### Scenario: Right side uses trigonometric template
- **WHEN** either equation side uses a sine or cosine template with `θ`
- **THEN** equation interval controls offer the same pi-unit affordance used for trigonometric optimization inputs
- **THEN** both equation sides use the same internal `theta` binding

### Requirement: Equation preview display
The system SHALL display a readable equation preview assembled from the left and right sides.

#### Scenario: Template and constant preview
- **WHEN** the user defines the left side as `x² - 4` and the right side as `0`
- **THEN** the system displays an equation preview equivalent to `x² - 4 = 0`

#### Scenario: Template and template preview
- **WHEN** both equation sides are template expressions
- **THEN** the system displays both friendly previews separated by an equals sign
