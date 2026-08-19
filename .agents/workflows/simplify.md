---
description: Simplify recently changed code while preserving behavior and project conventions
---

Use `code-simplification`.

Target the requested scope or recently changed code. Establish a passing baseline, understand callers and side effects, then apply one coherent simplification at a time.

Run targeted tests after each change and the relevant full suite plus available lint, typecheck, and build commands at the end.

Do not refactor unrelated code, add speculative abstractions, or change public behavior. Report changes, verification, and intentionally excluded opportunities.

