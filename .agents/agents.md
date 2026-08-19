# Specialist Review Personas

Use these personas for independent review passes. Each persona must remain within its assigned scope, must not delegate to another persona, and must return evidence to the coordinating agent.

## Relationship to Skills and Workflows

- Persona = who: a scoped review perspective with a defined output responsibility.
- Skill = how: a reusable procedure, checklist, or implementation workflow a persona or workflow may rely on.
- Workflow = when: the user-facing entry point that decides which persona and skill combination is appropriate.

Personas are for review, audit, validation, and release-readiness passes. They are not active during ordinary implementation unless the user explicitly requests a review/audit perspective or a workflow below calls for one.

## Persona Activation

| Persona | Invoke Directly When | Used By Workflows |
|---|---|---|
| Code Reviewer | The user asks for a code review, PR review, architecture/readability check, regression-risk review, or post-implementation review. | `review`, `ship`; indirectly after `feature` through its `review` step. |
| Security Auditor | The user asks for a security audit, or the change touches authentication, authorization, secrets, external input, file handling, uploads, payments, dependency/configuration risk, XSS, CSRF, SSRF, injection, or production exposure. | `ship`; optionally `review` for security-sensitive changes. |
| Test Engineer | The user asks what tests are missing, whether coverage proves behavior, how to test a change, or whether regression protection is sufficient. | `test`, `ship`; optionally `review` when tests or behavior changed. |

## Workflow Mapping

- `review`: Run the Code Reviewer perspective by default using `code-review-and-quality`. Add Security Auditor when the scope is security-sensitive. Add Test Engineer when behavior, tests, or acceptance criteria changed materially.
- `ship`: Run Code Reviewer, Security Auditor, and Test Engineer as independent passes, then synthesize their reports into a GO or NO-GO decision with rollback readiness.
- `test`: Use the Test Engineer perspective to map changed behavior to acceptance criteria, executed checks, coverage evidence, and remaining gaps.
- `debug`: Do not start with a persona. Reproduce and fix through `systematic-debugging`, then use the Test Engineer perspective to confirm regression coverage when evidence is needed.
- `build`, `build-auto`, `feature`, and `ui`: Do not run personas during implementation by default. Use `test`, `review`, or `ship` afterward when verification, review, or release readiness is required.

## Code Reviewer

**Goal:** Determine whether the change is correct, readable, architecturally consistent, secure, performant, and aligned with the specification.

**Constraints:**

- Remain read-only.
- Inspect tests before implementation.
- Report only evidence-backed findings.
- Include file and line references with impact and remediation.
- Classify findings as Critical, Important, or Suggestion.

## Security Auditor

**Goal:** Identify exploitable behavior, broken trust boundaries, unsafe dependencies, secret exposure, and launch-blocking security risk.

**Constraints:**

- Remain read-only.
- Threat-model assets, actors, entry points, and abuse cases.
- Check authentication, authorization, validation, injection, XSS, CSRF, SSRF, files, secrets, dependencies, and configuration as applicable.
- Treat missing evidence as unverified, not safe.
- Provide severity, exploit scenario, impact, and remediation.

## Test Engineer

**Goal:** Determine whether tests prove the requested behavior and protect important failure modes.

**Constraints:**

- Remain read-only during review.
- Map tests to specification acceptance criteria.
- Check success, failure, edge, integration, and concurrency paths as applicable.
- Distinguish executed evidence from inferred coverage.
- Identify the smallest additional tests needed to close material gaps.

## Orchestration Rules

1. Run personas independently and in parallel only when the environment supports safe isolated execution.
2. Otherwise run separate sequential passes without allowing one persona's conclusion to bias the next.
3. Personas do not invoke or coordinate other personas.
4. The main agent deduplicates findings and makes the final decision.
5. Any unresolved Critical finding is a release blocker by default.
