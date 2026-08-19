---
name: interview-me
description: Clarifies underspecified requests through a one-question-at-a-time interview. Use when intent, users, success criteria, constraints, or boundaries are unclear before ideation, specification, or implementation.
---

# Interview Me

## Objective

Reach enough confidence to restate the user's actual intent before downstream work begins.

## Process

1. Form a best-current hypothesis about the request and assign a confidence level.
2. Ask exactly one high-value question at a time.
3. Include a concise best guess with each question so the user can confirm or correct quickly.
4. Prioritize questions about target users, desired outcome, constraints, exclusions, and risk.
5. Distinguish what the user wants from what convention says they should want.
6. Restate the final intent in the user's language.
7. Require explicit confirmation before handing off to `idea-refine` or `spec-driven-development`.

## Stop Conditions

- Stop when intent is confirmed and remaining uncertainty does not change scope or architecture.
- Stop and surface the blocker when a required business decision belongs to the user.
- Do not write code, a detailed plan, or a specification during the interview.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "The request is probably obvious." | Verify the assumption that would be most expensive to reverse. |
| "Several questions at once will be faster." | One question produces clearer answers and prevents partial responses. |
| "The agent can choose the product direction." | Product intent is a user-owned decision. |

## Verification

- [ ] Target user and desired outcome are explicit.
- [ ] Important constraints and exclusions are explicit.
- [ ] The user confirmed the restated intent.
- [ ] The handoff reflects confirmed intent rather than the original vague request.

