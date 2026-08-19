---
description: Run a read-only production-readiness audit and return a GO or NO-GO decision with rollback plan
---

Resolve the release scope and read `SPEC.md`, applicable rules, and release documentation.

Run the independent personas in `.agents/agents.md`: Code Reviewer with `code-review-and-quality`, Security Auditor with `security-and-hardening`, and Test Engineer with `test-driven-development`. Run them in parallel when safe isolated execution is supported; otherwise use independent sequential passes.

Use `shipping-and-launch` to synthesize their reports. Load `observability-and-instrumentation`, `documentation-and-adrs`, and `performance-optimization` where relevant.

Verify specification alignment, quality checks, security, migrations, performance, accessibility, configuration, observability, documentation, rollout controls, and rollback readiness.

Any unresolved Critical finding produces NO-GO by default. Missing evidence is not a pass. A GO decision requires rollback triggers, owner, exact steps, data considerations, recovery target, and post-rollback checks.

This workflow is read-only. Do not edit, stage, commit, push, merge, deploy, change credentials, run migrations, or mutate production.

Return:

```markdown
## Ship Decision: GO | NO-GO
### Blockers
### Recommended Fixes
### Acknowledged Risks
### Verification Evidence
### Rollout Plan
### Rollback Plan
### Specialist Reports
```

