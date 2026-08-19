---
description: Reproduce, diagnose, and fix a bug at its root cause with a regression test
---

Use `systematic-debugging`.

Capture expected and actual behavior, reproduce the issue, localize the minimum responsible layer, test a falsifiable root-cause hypothesis, add a failing regression test, and apply the smallest fix.

Run the regression test, relevant suites, and available lint, typecheck, and build commands. Remove temporary diagnostics and inspect the final diff.

Stop when reproduction or required evidence is unavailable, a user-owned decision is missing, or the fix requires an unapproved breaking or destructive change.

Report reproduction, root cause, changed files, verification evidence, and residual risk.

