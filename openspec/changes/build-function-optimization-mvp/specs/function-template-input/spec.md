## ADDED Requirements

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
- **THEN** the system uses friendly symbols such as `x²`, `x³`, `√x`, `|x|`, `π`, `sin x`, `cos x`, and `tan x`

### Requirement: Advanced expression mode
The system SHALL keep free-form expression input separate from the default template-based flow.

#### Scenario: Custom expression selected
- **WHEN** the user selects the custom expression template
- **THEN** the system displays an advanced expression input area
- **THEN** the system provides helper buttons for common symbols

#### Scenario: Default templates avoid free-form input
- **WHEN** the user selects a standard function template
- **THEN** the system does not require the user to type a full expression manually
