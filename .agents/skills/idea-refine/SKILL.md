---
name: idea-refine
description: Refines a rough product or engineering idea into grounded alternatives and a recommended MVP direction. Use when the problem is understood but scope, approach, or trade-offs still need exploration.
---

# Idea Refinement

## Objective

Turn a rough idea into a concrete, testable direction without prematurely writing a specification or code.

## Process

1. Confirm the problem, audience, and definition of success. Use `interview-me` first when they are unclear.
2. When inside an existing codebase, inspect relevant architecture, patterns, and constraints.
3. Generate two or three meaningfully different approaches, not cosmetic variants.
4. Compare each approach by user value, implementation cost, reversibility, risk, and fit with the existing system.
5. Recommend one direction and explain why it dominates the alternatives.
6. Define the smallest useful MVP and a clear not-doing list.
7. List assumptions that need validation and open questions that block specification.

## Output

Provide:

- Problem statement
- Target user and outcome
- Considered approaches
- Recommended direction
- MVP scope
- Not doing
- Assumptions to validate
- Open questions

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "More options are always better." | Limit options to distinct, decision-relevant alternatives. |
| "A broad MVP leaves room to adapt." | An MVP must be small enough to validate one core hypothesis. |
| "Existing architecture does not matter during ideation." | Feasibility and migration cost are part of the decision. |

## Verification

- [ ] Alternatives differ in meaningful architecture or scope.
- [ ] The recommendation is tied to explicit criteria.
- [ ] MVP and exclusions are unambiguous.
- [ ] No implementation started before direction was confirmed.

