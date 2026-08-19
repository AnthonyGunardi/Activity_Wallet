---
trigger: always_on
---

# Fullstack General Standards

These standards apply to all code changes across the project.

## Output Purity & Orphan Cleanup

Generated code MUST have:
- no syntax errors,
- no unused variables,
- no unused imports,
- no temporary logging,
- no commented-out code,
- no TODO or placeholder logic.
- **Orphan Cleanup**: Remove imports, variables, or functions that *your* changes made unused. Do NOT remove pre-existing dead code unless explicitly asked (mention it to the user instead).

## Production-Ready Criteria

Code is ONLY production-ready if:
- all external inputs are validated via schema, middleware, or a dedicated validation layer,
- async operations are wrapped in error handling,
- no unhandled promise rejections exist,
- failures return structured errors,
- no async failure is silently ignored.

## Debugging Protocol

Fixes MUST:
- identify the root cause at the minimum responsible layer: route, controller, service, repository, model, or external integration,
- modify ONLY the affected logic,
- introduce zero temporary logs,
- avoid unrelated refactors.

## Goal-Driven Execution

Define success criteria before implementing, and loop until verified:
- Transform tasks into verifiable goals (e.g., "Add validation" → "Write tests for invalid inputs, then make them pass").
- For multi-step tasks, state a brief plan using this format:
  1. `[Step]` → verify: `[check]`
  2. `[Step]` → verify: `[check]`
- Loop execution/reasoning independently until the goal is objectively verified.

## Style Rules

- Use 2 spaces for indentation.
- Semicolons are REQUIRED.
- Keep max line length at 120 characters.
- Conform to ESLint rules with no local overrides unless explicitly required.

## JSDoc Rules

JSDoc MUST be added ONLY if a function:

- is exported,
- performs I/O,
- mutates shared state,
- contains business logic or conditional branching,
- calls external APIs.

JSDoc MUST explain WHY: constraints, assumptions, and side effects.
JSDoc MUST NOT describe obvious implementation details.

## Definition Layer

### External Input

Any data originating from:

- request payloads,
- query params,
- route params,
- headers,
- cookies,
- environment variables,
- uploaded files,
- external APIs,
- webhooks.

### Business Logic

Any conditional flow, validation rule, or transformation that affects application behavior or persisted data.

### Validation

Schema-based validation using Joi, Zod, middleware, or an equivalent validation layer executed BEFORE controller logic.

## Final Enforcement Principle

If a rule can be interpreted in multiple ways, it is invalid.

All rules MUST result in:

- a single clear implementation choice,
- no subjective judgment required.
