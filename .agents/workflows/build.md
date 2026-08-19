---
description: Implement one approved task with tests, verification, and one atomic commit
---

Require approved `SPEC.md`, `tasks/plan.md`, and `tasks/todo.md`. Preserve unrelated worktree changes.

Use `incremental-implementation`, `test-driven-development`, and `git-workflow-and-versioning`. Select the requested ready task or the first unchecked task whose dependencies are complete.

Load only relevant context. Use `api-and-interface-design` for public contracts and `source-driven-development` for version-sensitive decisions. For tasks that touch frontend UI, keep `/build` as the outer workflow and apply `/ui` routing inside the task for design skills, stack-specific frontend rules, and visual verification.

Complete one RED-GREEN-REFACTOR cycle, run targeted and regression checks plus available lint, typecheck, and build commands, then inspect the diff. Stage only task files, create one atomic commit, update `tasks/todo.md`, and stop.

Stop for ambiguity, failed verification, new scope, unrelated changes, or high-risk and irreversible actions. Report evidence, commit, risks, and the next ready task.
