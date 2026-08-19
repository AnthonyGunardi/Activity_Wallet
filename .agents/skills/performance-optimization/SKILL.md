---
name: performance-optimization
description: Measures, diagnoses, and improves frontend, backend, database, or workflow performance without guessing. Use when performance requirements exist, regressions are suspected, or runtime evidence identifies a bottleneck.
---

# Performance Optimization

## Measure-First Workflow

1. Define the user-visible performance objective and budget.
2. Establish a reproducible baseline with runtime evidence.
3. Identify the dominant bottleneck rather than optimizing every suspicious line.
4. Form one measurable hypothesis.
5. Apply the smallest high-impact change.
6. Measure again under comparable conditions.
7. Run correctness and regression tests.
8. Record before-and-after results and remaining trade-offs.

## Evidence

Use the closest available evidence:

- Browser: Lighthouse, Core Web Vitals, network waterfall, performance trace, bundle analysis
- Backend: latency percentiles, profiling, request traces, event-loop delay
- Database: query plans, query counts, timing, lock or connection data
- n8n: execution duration, item counts, per-node timing, batch behavior

When only source code is available, label findings as potential impact. Never invent runtime measurements.

## Common Risks

- N+1 database or API calls
- Unbounded loops, payloads, queries, or concurrency
- Blocking I/O on request paths
- Repeated rendering or expensive derived state
- Oversized bundles and render-blocking assets
- Premature memoization or caching without invalidation design

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "This code looks slow." | Appearance is a hypothesis; measure the path. |
| "Caching always helps." | Caching trades latency for invalidation, memory, and correctness risk. |
| "A higher synthetic score proves user improvement." | Tie the result to the defined user-visible objective. |

## Verification

- [ ] A reproducible baseline exists.
- [ ] The optimized bottleneck was measured.
- [ ] Before-and-after conditions are comparable.
- [ ] Correctness and regression tests pass.
- [ ] Claimed improvements are supported by evidence.

