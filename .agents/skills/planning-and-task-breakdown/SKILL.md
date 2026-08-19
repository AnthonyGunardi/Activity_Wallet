---
name: planning-and-task-breakdown
description: Converts an approved specification into small, dependency-ordered, verifiable vertical slices. Use when `SPEC.md` exists and implementation needs a durable plan and task list.
---

# Planning and Task Breakdown

## Objective

Produce tasks that can be implemented, tested, verified, and rolled back independently.

## Process

1. Require an approved `SPEC.md`; stop if it is missing or materially ambiguous.
2. Enter read-only planning mode and inspect only relevant source files.
3. Map dependencies between contracts, data, backend behavior, frontend behavior, and operations.
4. Slice vertically around observable behavior. Avoid horizontal phases such as "all models" followed by "all services."
5. For every task, define:
   - Identifier and objective
   - Dependencies
   - Likely files or components
   - Implementation outline
   - Acceptance criteria
   - Required tests
   - Verification commands
   - Risk level and rollback note
6. Order tasks by dependency and risk. Add checkpoints after coherent groups.
7. Write `tasks/plan.md` and a checkbox list in `tasks/todo.md`.
8. Present the plan and require explicit approval before implementation.

## Task Sizing

A task is too large when it mixes multiple user-visible behaviors, cannot be verified independently, or requires an unsafe broad commit. Split it until one implementation cycle is sufficient.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "The agent can plan while coding." | Durable planning prevents hidden scope changes and enables resumption. |
| "A backend task and frontend task are cleaner." | A vertical slice proves an end-to-end behavior sooner. |
| "Acceptance criteria are obvious from the title." | Titles do not define observable completion. |

## Verification

- [ ] Every task maps to the specification.
- [ ] Dependencies and execution order are explicit.
- [ ] Every task has tests and verification steps.
- [ ] Tasks are independently reviewable and rollback-friendly.
- [ ] The user explicitly approved the plan.

