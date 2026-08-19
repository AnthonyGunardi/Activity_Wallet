---
description: Run a gated feature lifecycle from idea through review and stop before shipping
---

Orchestrate these existing workflow contracts in order:

1. Follow `/idea` only when intent is unclear; require confirmation.
2. Follow `/spec`; require explicit specification approval.
3. Follow `/plan`; require explicit plan approval.
4. Present autonomous side effects and require the `/build-auto` approval gate.
5. Follow `/build-auto`, then `/test` and `/review`.
6. Stop on failed verification or unresolved Critical or Important findings.

Stop for feedback, ambiguity, new scope, unrelated changes, high-risk work, destructive actions, production changes, or anything not safely reversible.

Do not infer or combine approvals. Do not push, merge, deploy, mutate production, or invoke `/ship` automatically.

Stop before shipping. Report artifacts, completed work, commits, verification, findings, blockers, and the explicit next command.

