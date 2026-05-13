## ADDED Requirements

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
