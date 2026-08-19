---
name: code-simplification
description: Simplifies recently changed code while preserving exact behavior and project conventions. Use after code works but contains unnecessary complexity, duplication, nesting, or unclear naming.
---

# Code Simplification

## Principles

1. Preserve behavior exactly.
2. Understand before changing; apply Chesterton's Fence.
3. Follow existing project conventions.
4. Prefer clarity over cleverness.
5. Limit scope to recently changed or explicitly requested code.

## Process

1. Identify the target diff, callers, side effects, edge cases, and available tests.
2. Establish a passing baseline.
3. Find concrete opportunities such as:
   - Deep nesting that can become guard clauses
   - Long functions with separable responsibilities
   - Nested ternaries or opaque boolean expressions
   - Repeated logic with the same invariant
   - Generic or misleading names
   - Abstractions that add indirection without reuse
   - Dead code made obsolete by the current change
4. Apply one coherent simplification at a time.
5. Run targeted tests after each coherent change.
6. Run the full relevant suite and build at the end.
7. Revert any simplification that changes behavior or weakens clarity.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "A new abstraction may be useful later." | Do not create speculative indirection. |
| "Shorter code is automatically simpler." | Optimize for comprehension and explicit invariants, not character count. |
| "This adjacent legacy code should be cleaned too." | Unrequested cleanup expands risk and review scope. |

## Verification

- [ ] Baseline and final tests pass.
- [ ] Public behavior and side effects are unchanged.
- [ ] The final diff is smaller or easier to understand.
- [ ] No unrelated code was reformatted or refactored.
- [ ] New abstractions have demonstrated value.

