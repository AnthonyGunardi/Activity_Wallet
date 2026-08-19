---
name: source-driven-development
description: Grounds framework, library, and platform decisions in current primary documentation. Use when implementation depends on version-sensitive APIs, configuration, security behavior, or unfamiliar technology.
---

# Source-Driven Development

## Objective

Prevent outdated or invented implementation patterns by verifying decisions against authoritative sources.

## Process

1. Detect the actual stack, package manager, lockfile, and installed versions.
2. Identify the decision that requires external verification.
3. Consult primary sources only: official documentation, specifications, release notes, or source repositories.
4. Match documentation to the detected version when possible.
5. Implement the documented pattern and preserve local project conventions.
6. Cite the source near the decision in the final report when browsing was required.
7. Label any unresolved or inferred behavior explicitly.

## Source Hierarchy

Prefer, in order:

1. Version-matched official documentation
2. Official specification or source code
3. Official release notes and migration guides
4. Maintainer-authored examples

Do not use search snippets, generated summaries, or unsourced blog posts as implementation authority.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "This API has worked this way for years." | Version-sensitive behavior must be verified. |
| "A popular answer is probably correct." | Popularity does not establish version or security correctness. |
| "The documentation is too broad." | Narrow the question and verify the exact contract being used. |

## Verification

- [ ] Stack and versions were detected rather than assumed.
- [ ] Primary documentation supports the chosen pattern.
- [ ] Version mismatches and inferences are disclosed.
- [ ] Implementation and citations correspond to the same contract.

