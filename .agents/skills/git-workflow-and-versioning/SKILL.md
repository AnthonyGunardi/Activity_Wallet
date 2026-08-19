---
name: git-workflow-and-versioning
description: Keeps code changes reviewable and reversible through short-lived branches, atomic commits, safe staging, and explicit versioning. Use whenever a workflow is authorized to create commits or prepare a release.
---

# Git Workflow and Versioning

## Core Rules

- Keep the default branch deployable.
- Prefer short-lived feature branches.
- Make each commit one coherent, working change.
- Stage explicit files; do not absorb unrelated user work.
- Never rewrite shared history without explicit approval.
- Treat generated files and lockfiles as part of the change that produced them.

## Commit Process

1. Inspect `git status` and the relevant diff.
2. Separate unrelated concerns before staging.
3. Run the task's tests, lint, typecheck, and build as applicable.
4. Check staged content for secrets and accidental artifacts.
5. Stage only files belonging to the current task.
6. Use a descriptive message that explains intent, for example `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, or `chore:`.
7. Confirm the commit contains a complete, revertable unit.

## Versioning

- Follow Semantic Versioning when the project publishes versions.
- Treat unexpected consumer-visible behavior changes as breaking changes.
- Update changelog and migration notes in the same change.
- Use the release tag as the source of truth.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "Staging everything is faster." | It risks committing unrelated or sensitive work. |
| "A work-in-progress commit can remain broken." | Save points should be buildable and independently understandable. |
| "The version bump can be decided later." | Compatibility impact is part of the change contract. |

## Verification

- [ ] Staged files belong only to the intended task.
- [ ] Verification passed before committing.
- [ ] The commit is coherent and revertable.
- [ ] The message explains intent.
- [ ] Version and migration impact are documented when applicable.

