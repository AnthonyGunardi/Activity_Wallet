---
name: spec-driven-development
description: Creates and maintains an implementation-ready specification before coding. Use when starting a project, feature, or significant behavior change, especially when requirements or boundaries are incomplete.
---

# Spec-Driven Development

## Objective

Create a reviewed source of truth that defines what to build, how success is measured, and where implementation must stop.

## Gated Process

### 1. Specify

Create or revise `SPEC.md` with:

- Objective and target users
- Functional and non-functional requirements
- Acceptance and success criteria
- Approved technology choices and detected versions
- Install, lint, test, build, and run commands
- Project structure and data flow
- Public contracts and compatibility requirements
- Code style and testing strategy
- Security and operational boundaries
- Always-do, ask-first, and never-do actions
- Out-of-scope items and open questions

Inspect the existing codebase before documenting architecture. Use `source-driven-development` when a framework decision depends on current official documentation.

### 2. Approve

Present the specification and wait for an explicit approval. A hedged response is not approval. Revise the document when the user provides feedback.

### 3. Hand Off

After approval, use `planning-and-task-breakdown`. Do not implement directly from an unapproved specification.

## Keeping the Spec Alive

Update `SPEC.md` when an approved requirement or boundary changes. Record changes before implementing them so code and plan do not silently diverge.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "This is only a prototype." | Prototypes create behavior and dependencies; define the boundary first. |
| "The README is enough." | A README rarely contains acceptance criteria and change boundaries. |
| "Implementation will reveal the requirements." | Discovery is allowed, but requirement changes must return to the spec gate. |

## Verification

- [ ] Every requirement has an observable acceptance criterion.
- [ ] Commands and architecture match the inspected project.
- [ ] Boundaries and out-of-scope work are explicit.
- [ ] Open questions that affect implementation are resolved.
- [ ] The user explicitly approved the specification.

