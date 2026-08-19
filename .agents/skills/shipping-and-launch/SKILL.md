---
name: shipping-and-launch
description: Determines production readiness with explicit quality gates, rollout controls, monitoring, and rollback procedures. Use before deployment, release, or enabling a production feature.
---

# Shipping and Launch

## Pre-Launch Gate

Require evidence for:

- Code review and specification alignment
- Tests, lint, typecheck, build, and migrations
- Security review and dependency risk
- Performance budget and accessibility where applicable
- Environment variables, feature flags, and operational configuration
- Documentation, observability, ownership, and support readiness

## Rollout Strategy

1. Choose the smallest safe initial audience.
2. Define health metrics and explicit rollback thresholds.
3. Verify dashboards, alerts, and operator access before exposure.
4. Increase exposure in stages only while gates remain healthy.
5. Remove temporary flags and compatibility paths after the rollout is stable.

## Mandatory Rollback Plan

Document:

- Trigger conditions
- Decision owner
- Exact rollback steps
- Database compatibility considerations
- Data recovery or reconciliation steps
- Target recovery time
- Post-rollback verification

## Decision

Return GO only when required evidence exists and no unresolved Critical blocker remains. Return NO-GO when evidence is missing, rollback is unsafe, or material risk is unaccepted.

This skill assesses readiness. It does not authorize deployment, push, merge, or production mutation.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "Rollback is just reverting the commit." | Data, configuration, caches, and external effects may not revert with code. |
| "Monitoring can be checked after deployment." | Rollout decisions require signals from the first exposure. |
| "A small release does not need a checklist." | Blast radius depends on the boundary touched, not line count alone. |

## Verification

- [ ] Required quality and security evidence exists.
- [ ] Rollout stages and health gates are explicit.
- [ ] Rollback steps are executable and data-safe.
- [ ] Monitoring and ownership are ready.
- [ ] The GO or NO-GO decision states blockers and accepted risks.

