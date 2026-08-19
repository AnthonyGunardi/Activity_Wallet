---
description: Build or improve a user interface using local design skills, stack-appropriate rules, and visual verification
---

Route skills by the user's UI requirement; do not load every UI skill by default.

Select `frontend-design` for UI implementation work: builds, pages, layouts, app shells, and scoped components.

Select `hallmark` instead when the request is only a Hallmark-specific read-only task such as visual audit or design-DNA study. Also load `hallmark` with implementation work when the request needs page-level greenfield design, anti-AI-slop direction, or redesign.

Select `impeccable` instead when the request is only critique or UI quality analysis. Also load `impeccable` with implementation work when the request needs accessibility, responsive behavior, browser iteration, polish, or final UI quality checks.

When `hallmark` applies, do not run it as a parallel full design flow beside `frontend-design`. Treat `frontend-design` as the general implementation baseline, and let `hallmark` own page structure, theme, anti-slop gates, audit/redesign/study behavior, and Hallmark-specific output contracts.

When more than one applies, use them in this order: `frontend-design` for implementation baseline, `hallmark` for distinctive page structure or anti-slop decisions, then `impeccable` for verification and polish.

Inspect the target project before applying framework rules. Follow `.agents/rules/30-frontend-react.md` only when the work is in a React codebase or touches React files (`.jsx` / `.tsx` or React dependencies/config). For Laravel, Blade, Vue, Svelte, static HTML, or any other non-React UI stack, preserve that stack's conventions and do not apply React-only component, hook, or data-fetching requirements.

Inspect the existing design system and architecture, define observable acceptance criteria, and implement the smallest coherent UI slice.

Verify relevant states, keyboard and focus behavior, responsiveness, contrast, motion preferences, console, network, tests, lint, typecheck, and build. Use browser evidence when available and disclose when it is not.

Do not replace the design system, use placeholders, move business logic into components, or claim unperformed visual verification.