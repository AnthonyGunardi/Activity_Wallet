---
description: Verify current changes with targeted tests, regression suites, and honest coverage evidence
---

Use `test-driven-development` and follow `.agents/rules/40-testing-standards.md`.

Resolve scope from the argument or current diff. Map changed behavior to acceptance criteria, run the narrowest relevant tests first, then broader regression and coverage checks.

For bugs, use the Prove-It pattern. Add missing behavioral tests only when authorized; do not change production behavior.

Never weaken tests or report checks that were not executed. Distinguish failures, skips, unavailable checks, and unverified areas.

