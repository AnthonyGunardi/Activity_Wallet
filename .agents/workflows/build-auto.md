---
description: Implement the entire approved plan autonomously with per-task tests and commits
---

Require `SPEC.md`. Inspect `git status --porcelain` and allow only expected planning artifacts to be uncommitted. Stop when unrelated changes exist.

If the plan is missing, use `planning-and-task-breakdown`. Present the complete plan and wait for one explicit approval; this is the autonomy gate. Commit newly approved planning artifacts separately.

Use `incremental-implementation`, `test-driven-development`, and `git-workflow-and-versioning`. For tasks that touch frontend UI, keep `/build-auto` as the outer workflow and apply `/ui` routing inside each task for design skills, stack-specific frontend rules, and visual verification. Execute unchecked tasks in dependency order. For every task:

1. Run the full RED-GREEN-REFACTOR cycle.
2. Run targeted and regression checks plus available lint, typecheck, and build commands.
3. Inspect the diff and stage explicit task files only.
4. Create one atomic commit and update task status.

## Mandatory Stop Conditions

Stop when verification cannot pass after `systematic-debugging`, requirements are ambiguous, new scope or dependencies appear, unrelated changes appear, or work touches authentication, authorization, payments, secrets, production configuration, destructive data changes, deployment, or anything not safely reversible with `git revert`.

Resume on a later invocation from the next unchecked task. Do not push, merge, deploy, mutate production, weaken tests, or combine tasks in one commit.

Report completed and remaining tasks, tests, verification, commits, blockers, and residual risks.
