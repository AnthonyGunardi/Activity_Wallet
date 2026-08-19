---
trigger: always_on
---

# Safety & Behavioral Guardrails

These behavioral guardrails reduce common coding mistakes and enforce strict execution caution.

## 1. Think Before Coding

Do not assume. Do not hide confusion. Surface tradeoffs. Before implementing:
* State assumptions explicitly. If uncertain, STOP and ask. Name exactly what is confusing.
* If multiple interpretations of a request exist, present them to the user. Do not pick one silently.
* Evaluate if a simpler approach exists. Propose it and push back on complex requests when warranted.

## 2. Simplicity First

Write the minimum code that solves the problem. Nothing speculative.
* No features or logic beyond what was explicitly asked.
* No abstractions for single-use code.
* No "flexibility" or "configurability" that wasn't requested.
* No error handling for impossible scenarios.
* **Volume constraint**: If code can be written in 50 lines instead of 200, it MUST be written in 50 lines. Avoid overcomplication.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.
* Do not "improve" or format adjacent code, comments, or styling.
* Do not refactor things that are not broken.
* Match the existing style exactly, even if you prefer a different standard.
* If you notice unrelated dead code, mention it to the user — do not delete it.
* **Traceability Test**: Every changed or added line must trace directly back to the user's explicit request.

## 4. Rule Invariants

1. Only implement what is required by the task or PRD. Avoid unrelated refactoring or improvements.
2. Do not perform destructive operations (including deleting files, migrations, models, tests, or production data) unless explicitly required.
3. Prefer additive, backward-compatible changes over destructive ones (for example, additive database migrations instead of destructive schema changes).
4. Do not change public APIs or external behavior unless required by the PRD.
5. Preserve existing authorization, authentication, validation, permissions, tenant/event isolation, and other security boundaries.
6. Do not bypass, disable, or weaken tests to make changes pass. If behavior intentionally changes, update affected tests accordingly.
7. Follow the existing project architecture, naming conventions, and coding style. Do not introduce new dependencies or modify generated/build/CI/infrastructure files unless required.
8. Never hardcode secrets, credentials, API keys, or tokens.
9. Do not leave placeholder implementations, TODOs, FIXME comments, or commented-out code unless explicitly requested.
10. If schema changes are required, include the necessary migrations and related tests.

Before the final response, include:

- Summary of changes
- Why it changed
- Files modified
- PRD references used
- Testing status (if tests were executed; otherwise state they were not run)
- Risks or follow-up needed

