---
name: test-driven-development
description: Drives behavior changes with failing tests, minimal implementation, and safe refactoring. Use when implementing logic, fixing a bug, or changing existing behavior.
---

# Test-Driven Development

## The Cycle

### RED

Write the smallest behavioral test that describes the expected result. Run it and confirm it fails for the intended reason. A test that passes immediately does not prove the new behavior.

### GREEN

Implement the minimum production change that makes the test pass. Avoid speculative abstraction and unrelated cleanup.

### REFACTOR

Improve clarity only while tests remain green. Match existing project conventions.

## Bug Fixes: Prove-It Pattern

1. Reproduce the bug with a failing test.
2. Confirm the failure matches the reported defect.
3. Apply the smallest root-cause fix.
4. Confirm the regression test passes.
5. Run the relevant full suite.

## Test Quality

- Test observable state, output, or side effects rather than implementation details.
- Prefer real implementations over broad mocking.
- Cover success, failure, and applicable edge cases.
- Use Arrange-Act-Assert and descriptive behavior-oriented names.
- Follow `.agents/rules/40-testing-standards.md`; its coverage thresholds are authoritative.
- Never delete, skip, weaken, or rewrite a valid test merely to obtain a pass.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "The change is too small to test." | Small regressions are still regressions; test the behavior boundary. |
| "I will add tests after implementation." | A test written after the fix may never prove it detects the defect. |
| "Mocking everything makes the test isolated." | Excessive mocks verify wiring assumptions instead of real behavior. |

## Verification

- [ ] The new test failed before production code changed.
- [ ] The failure reason was relevant.
- [ ] The minimum implementation made it pass.
- [ ] Regression tests and configured coverage gates pass.
- [ ] Tests describe behavior rather than implementation details.

