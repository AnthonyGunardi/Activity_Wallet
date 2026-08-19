---
description: Audit web performance using measured evidence when available and source analysis otherwise
---

Use `performance-optimization` and load `impeccable` for frontend-specific analysis.

Use Deep mode when a live URL with supported tooling, Lighthouse or PageSpeed data, CrUX data, network capture, or performance trace is available. Report only sourced metrics and rank measured bottlenecks by user impact.

Otherwise use Quick mode, inspect source for structural risks, and label every finding as potential impact.

Remain read-only unless optimization is separately requested. Return the mode, evidence, measured scorecard when available, ranked findings, and a re-measurement plan.

