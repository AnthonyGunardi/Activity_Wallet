---
name: documentation-and-adrs
description: Documents architectural decisions, public contracts, operational commands, and non-obvious constraints. Use when architecture, APIs, setup, migrations, or operational behavior changes.
---

# Documentation and ADRs

## Document the Why

Documentation should preserve decisions and contracts that cannot be recovered safely from code alone. Avoid comments that merely restate syntax.

## Architecture Decision Records

Write an ADR when a decision:

- Changes architecture or a major dependency
- Establishes a public contract or long-lived convention
- Has meaningful alternatives and trade-offs
- Is expensive to reverse
- Creates security, data, or operational consequences

Use this structure:

```markdown
# ADR-NNN: Decision title

## Status
## Date
## Context
## Decision
## Alternatives Considered
## Consequences
```

## Other Documentation

- Update README commands when setup or operation changes.
- Update API documentation when public contracts change.
- Document migration, compatibility, and rollback requirements.
- Keep comments focused on constraints, assumptions, and side effects.
- Remove documentation made inaccurate by the current change.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "The code is self-documenting." | Code shows what exists, not why alternatives were rejected. |
| "We can reconstruct the decision later." | Context and constraints disappear faster than implementation. |
| "Every implementation detail needs an ADR." | Reserve ADRs for durable, consequential decisions. |

## Verification

- [ ] Durable decisions explain context and trade-offs.
- [ ] Public contracts and commands match the implementation.
- [ ] Migration and rollback instructions are actionable.
- [ ] Comments explain non-obvious reasons rather than syntax.
- [ ] Stale documentation was updated or removed within scope.

