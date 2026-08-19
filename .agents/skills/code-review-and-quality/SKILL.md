---
name: code-review-and-quality
description: Reviews changes across correctness, readability, architecture, security, and performance. Use before merging, shipping, or accepting a non-trivial code change.
---

# Code Review and Quality

## Review Process

1. Establish the requested scope and read the specification or issue.
2. Inspect tests before implementation to understand claimed behavior.
3. Review the diff and enough surrounding code to verify integration.
4. Evaluate five axes:
   - Correctness: requirements, edge cases, error paths, concurrency, data integrity
   - Readability: naming, control flow, duplication, unnecessary complexity
   - Architecture: boundaries, coupling, consistency, public contracts
   - Security: validation, authentication, authorization, secrets, injection
   - Performance: unbounded work, N+1 access, blocking operations, regressions
5. Verify test, lint, typecheck, and build evidence rather than trusting claims.
6. Report findings before summaries.

## Severity

- **Critical:** exploitable, data-loss, correctness, or production blocker.
- **Important:** should be fixed before merge because it creates material risk or debt.
- **Suggestion:** non-blocking improvement with a clear benefit.

Every finding must include file, line, impact, reasoning, and a concrete remediation. Avoid vague style preferences and findings without actionable evidence.

## Review Boundaries

- Keep review read-only unless the user explicitly requests fixes.
- Do not report pre-existing unrelated issues as change blockers; list them separately when relevant.
- If no actionable findings exist, say so and state residual risks or unverified areas.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "Tests pass, so the change is correct." | Tests may omit the failing boundary or assert the wrong behavior. |
| "This is only a style concern." | Report only when readability materially affects maintenance or correctness. |
| "The diff is small, so a shallow review is enough." | Small auth or data changes can have a large blast radius. |

## Verification

- [ ] Scope and requirements were identified.
- [ ] All five axes were considered.
- [ ] Findings are evidence-backed and precisely located.
- [ ] Verification claims match actual command output.
- [ ] The review did not modify the codebase.

