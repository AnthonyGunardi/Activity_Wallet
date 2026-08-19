---
name: incremental-implementation
description: Implements approved work as thin, verifiable, rollback-friendly slices. Use when a planned change touches multiple files or components and should be delivered one task at a time.
---

# Incremental Implementation

## Objective

Keep the repository working while implementing one approved behavior at a time.

## Increment Cycle

1. Select one ready task whose dependencies are complete.
2. Read its acceptance criteria and load only relevant context.
3. Use `test-driven-development` for behavior changes.
4. Implement the smallest code that satisfies the task.
5. Run targeted tests, the relevant regression suite, and the build or typecheck.
6. Review the diff for scope, generated artifacts, secrets, and unrelated changes.
7. Create one atomic commit when the workflow authorizes commits.
8. Mark the task complete and record any discovered follow-up separately.

## Implementation Rules

- Prefer vertical slices and contract-first integration points.
- Keep incomplete behavior behind safe defaults or feature flags when required.
- Preserve public behavior unless the approved specification changes it.
- Stage only files related to the current task; never absorb unrelated work.
- Stop when a requirement is ambiguous or the next action is irreversible.
- Use `systematic-debugging` when verification fails unexpectedly.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "It is efficient to finish adjacent tasks now." | Unplanned work destroys task-level verification and rollback. |
| "Tests can run after several slices." | A failing slice must be identified before more changes accumulate. |
| "One large commit is easier." | Small atomic commits are easier to review, bisect, and revert. |

## Verification

- [ ] The task acceptance criteria are satisfied.
- [ ] Targeted and regression tests pass.
- [ ] Build or typecheck passes when available.
- [ ] The diff contains no unrelated changes.
- [ ] The task status and commit accurately describe the work.

