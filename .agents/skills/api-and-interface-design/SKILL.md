---
name: api-and-interface-design
description: Designs stable APIs and module interfaces contract-first with boundary validation and consistent error semantics. Use when creating or changing REST endpoints, public functions, events, schemas, or cross-component contracts.
---

# API and Interface Design

## Core Principles

1. Define the contract before implementation.
2. Treat every observable behavior as a potential dependency.
3. Prefer additive, backward-compatible evolution.
4. Validate external input at the boundary.
5. Keep success and error semantics consistent.
6. Use predictable names and explicit types.

## Process

1. Identify consumers, trust boundaries, compatibility requirements, and failure modes.
2. Specify request/input, response/output, errors, pagination, idempotency, and authorization.
3. Define examples and contract tests before implementation.
4. Check the contract against local backend and frontend rules.
5. Implement adapters behind the contract rather than leaking persistence or framework details.
6. Verify compatibility with current consumers.
7. Document migration and deprecation requirements for breaking changes.

## REST Guidance

- Model resources consistently and use HTTP semantics deliberately.
- Use the project's standard response envelope.
- Validate path, query, header, and body input before controller logic.
- Use stable machine-readable error codes.
- Define pagination bounds and deterministic ordering.
- Make retryable writes idempotent when duplicate execution is plausible.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "Only one client uses this endpoint." | Observable behavior becomes a dependency quickly. |
| "The implementation explains the contract." | Consumers need an explicit, testable interface. |
| "A breaking cleanup is harmless." | Prefer additive migration unless all consumers are coordinated. |

## Verification

- [ ] Inputs, outputs, errors, and authorization are explicit.
- [ ] Boundary validation and contract tests exist.
- [ ] Compatibility impact was assessed.
- [ ] Persistence and framework details do not leak unnecessarily.
- [ ] Breaking changes include an approved migration path.

