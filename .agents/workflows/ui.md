---
description: Build or improve a user interface using local design skills, stack-appropriate rules, and visual verification
---

Build, review, or improve UI using one lead design skill, the target project's conventions, and evidence-based verification.

Inspect the project before selecting rules or editing code. Identify the framework, existing design system, product/design contracts, component
ownership, relevant commands, and the exact requested scope.

Choose exactly one lead skill:

- `frontend-design`: lightweight or scoped visual implementation when no specialized design lifecycle is required.
- `hallmark`: page-level greenfield design, structural redesign, anti-AI-slop direction, visual audit, or design-DNA study.
- `impeccable`: complex product UI, design-system or product-context work, critique, technical audit, accessibility, responsive adaptation,
  hardening, performance, browser iteration, or final polish.
- An explicitly requested skill or command always wins.

Do not run multiple full design flows on the same surface. A second skill may only run afterward in a named, bounded verification mode and must not
reopen the lead skill's visual direction unless it finds an objective usability, accessibility, responsiveness, or correctness defect.

Authority order:

1. User's explicit requirements
2. Existing product truth, design system, and project constraints
3. Selected lead skill
4. Optional verification skill
5. Workflow defaults

Do not duplicate or override the selected skill's own setup, context-loading, or clarification protocol.

Follow `.agents/rules/30-frontend-react.md` only when the project uses React or the change touches React files, dependencies, or configuration. Otherwise
preserve the target stack's conventions.

Define observable acceptance criteria, then implement the smallest coherent slice. Preserve routes, business logic, component ownership, factual content,
and the existing design system unless the user explicitly requests otherwise.

Never invent product facts, metrics, testimonials, or customer claims. Use clearly labelled TBD values only when temporary content is necessary.

When the UI can run locally, verify relevant interactions and states, keyboard navigation, visible focus, representative desktop and mobile widths,
contrast, reduced motion, and relevant console or network failures. Run applicable tests, lint, typecheck, and build commands.

Use one inspection pass, one consolidated fix pass, and at most one confirmation pass. Report what was verified and what remains unverified.
Never claim visual verification without browser or rendered evidence.

Do not delete production structure, modify files outside scope, or move business logic into UI components without explicit authorization.
