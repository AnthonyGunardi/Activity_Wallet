---
name: observability-and-instrumentation
description: Designs structured logs, metrics, traces, and alerts around user-visible and operational behavior. Use when adding production flows, external integrations, background jobs, or launch monitoring.
---

# Observability and Instrumentation

## Process

1. Define what "working" means from the user and operator perspectives.
2. Identify the questions an operator must answer during failure.
3. Select the minimum useful signals:
   - Logs for discrete diagnostic events
   - Metrics for trends, rates, and thresholds
   - Traces for latency and cross-service causality
4. Instrument meaningful boundaries, not every line.
5. Propagate correlation or request identifiers across async boundaries.
6. Define symptom-based alerts with owners and runbook actions.
7. Verify telemetry by forcing a safe staging failure and locating the evidence.

## Logging Rules

- Use structured fields and stable event names.
- Include enough context to locate a failure without logging whole payloads.
- Never log secrets, credentials, tokens, or unnecessary personal data.
- Keep debug-level detail disabled in production by default.

## Metric Rules

- Use RED metrics for request-oriented services: rate, errors, duration.
- Use USE metrics for resources: utilization, saturation, errors.
- Avoid unbounded label cardinality such as raw user IDs or URLs.
- Alert on user-visible symptoms instead of internal noise when possible.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "We can add monitoring after launch." | Launch without signals makes rollback decisions guesswork. |
| "Logging the full request is easiest." | It creates privacy, security, and cost risk. |
| "An alert on every error is safest." | Noisy alerts train operators to ignore real incidents. |

## Verification

- [ ] Critical flows have useful logs or metrics.
- [ ] Correlation survives relevant async boundaries.
- [ ] Sensitive data is excluded.
- [ ] Alerts have actionable thresholds and owners.
- [ ] Telemetry was verified in a safe environment.

