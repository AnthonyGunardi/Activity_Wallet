---
trigger: model_decision
---

# Testing Standards

Apply these rules when creating, changing, or fixing tests.

## Test Quality Requirements

Each tested function MUST assert:

- at least one success case,
- at least one failure case,
- at least one edge case if applicable.

Assertions MUST validate actual outputs or side effects.

Trivial assertions, such as constant comparisons, are STRICTLY PROHIBITED.

## Forbidden Testing Patterns

- Testing implementation details.
- Mocking everything without asserting behavior.

## Mandatory Justification for Ignore Directives

Ignore directives are ALLOWED ONLY for:

- startup/bootstrap code,
- external library behavior,
- non-deterministic logic.

They MUST follow this format:

Backend:

```js
/* istanbul ignore next -- [Category]: [Specific Reason] */
```

Frontend:

```js
/* c8 ignore start -- [Specific Reason] */
// code
/* c8 ignore stop */
```

The reason MUST be explicit and non-generic.

## Coverage Minimum Thresholds

- Statements/Lines: 90%.
- Functions: 90%.
- Branches: 85%.
