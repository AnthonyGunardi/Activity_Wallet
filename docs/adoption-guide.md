# Adoption Guide for Google Antigravity IDE

This guide explains how to adopt this rules, skills, and workflows pack in a new project or an established codebase. The destination is the same in both cases: a specification-led, test-driven, reviewable development lifecycle. The order of adoption differs because established systems require evidence and safety nets before broad agent-driven changes.

## What This Pack Adds

The pack uses three Antigravity IDE workspace layers:

- `.agents/rules/` defines mandatory behavioral and architectural constraints. Some rules are stack-specific and must only be applied when their trigger globs or documented framework conditions match the target project.
- `.agents/skills/` provides specialist processes that load when relevant.
- `.agents/workflows/` registers reusable slash-command entry points.

### How Skills Are Activated

Users do not normally preload skills. Antigravity discovers skill metadata from `.agents/skills/` and loads the full `SKILL.md` only when needed. Activation happens in three ways:

1. **Explicit workflow routing:** a slash workflow names the required skill. This is the most deterministic path and should be used for mandatory lifecycle behavior.
2. **Automatic description matching:** for a freeform request, Antigravity selects skills whose frontmatter descriptions match the task. This is automatic but model-driven, so it should not be the only enforcement mechanism for critical invariants.
3. **Explicit user request:** outside a workflow, the user can force routing with a prompt such as `Use security-and-hardening while implementing this authentication endpoint.`

The standard lifecycle is:

```text
/idea -> /spec -> /plan -> /build or /build-auto -> /test -> /review -> /ship
```

`/feature` orchestrates the lifecycle through review and deliberately stops before shipping.

## Choose an Adoption Path

| Signal | Greenfield | Brownfield |
|---|---|---|
| Project state | New or not yet released | Existing users, data, integrations, or production traffic |
| Test coverage | Controlled from the first change | Uneven, missing, or unreliable in some areas |
| Conventions | Still being established | Existing and sometimes undocumented |
| Compatibility burden | Low | Existing behavior may already have consumers |
| Primary risk | Building the wrong thing | Breaking behavior nobody fully documented |
| Recommended adoption | Full lifecycle immediately | Incremental and verification-first |

If a young project has already shipped, treat it as brownfield until its runtime behavior, tests, and rollback path are understood.

## Before Using the Workflows

### 1. Place the Pack at the Workspace Root

The target project should contain:

```text
<project-root>/
├── .agents/
│   ├── agents.md
│   ├── rules/
│   ├── skills/
│   └── workflows/
└── ... project files
```

Merge the pack with an existing `.agents/` directory instead of overwriting project-specific rules or skills. Resolve duplicate names deliberately; two skills or workflows with overlapping contracts make agent routing unreliable.

### 2. Review Workspace Rules

Before the first coding task:

- Confirm the safety and full-stack rules match the project.
- Confirm stack-specific glob rules target the correct directories.
- Verify the required `rtk` command is installed because the current terminal rule requires it.
- Record real install, lint, test, typecheck, build, and run commands in the project specification.
- Document areas the agent must never modify without approval.

Do not keep a rule merely because it sounds desirable. An always-on rule must be objective, enforceable, and appropriate for the project.

### 3. Validate the Pack

When this repository's validator is available, run:

```bash
node scripts/validate-agent-assets.mjs
```

The validator checks skill and workflow metadata, naming, imported skill presence, provider-specific leftovers, skill references, and critical safety contracts.

### 4. Verify Antigravity Discovery

Open the project root in Antigravity IDE and confirm the slash commands appear in the Agent panel. If they do not:

1. Confirm `.agents/workflows/` is at the workspace root.
2. Confirm each workflow is a direct Markdown file with valid frontmatter.
3. Reload the workspace or start a new Agent conversation.
4. Run the validator and fix reported errors.

## Know the Command Boundaries

| Command | Primary purpose | Expected side effects |
|---|---|---|
| `/idea` | Clarify and refine direction | None |
| `/spec` | Create the implementation source of truth | Writes `SPEC.md` |
| `/plan` | Create dependency-ordered vertical tasks | Writes `tasks/plan.md` and `tasks/todo.md` |
| `/build` | Implement one ready task | Changes code and tests, updates task status, creates one commit |
| `/build-auto` | Implement the approved plan | Changes code and creates per-task commits |
| `/test` | Verify behavior and coverage | May add tests when authorized; does not change production behavior |
| `/debug` | Reproduce and fix a root cause | Changes code and adds regression coverage |
| `/review` | Five-axis code review | Read-only |
| `/simplify` | Reduce complexity without changing behavior | Changes only the requested or recent scope |
| `/webperf` | Measured or source-based performance audit | Read-only unless optimization is separately requested |
| `/ship` | Production-readiness decision | Read-only; never deploys |
| `/ui` | Build or improve frontend UI | Changes scoped UI code and tests |
| `/n8n` | Route n8n design, build, validation, or debugging | Depends on the request and explicit production gates |
| `/feature` | Orchestrate the lifecycle through review | Stops before `/ship` |

Invoking a mutating command authorizes only the side effects described above. It does not authorize pushing, merging, deployment, destructive migrations, credential changes, or production mutation.

## Persistent Artifacts

The lifecycle communicates through files rather than relying on conversation history:

| Artifact | Role |
|---|---|
| `SPEC.md` | Approved requirements, architecture, commands, testing strategy, and boundaries |
| `tasks/plan.md` | Dependency graph, vertical slices, acceptance criteria, verification, and risk |
| `tasks/todo.md` | Durable completion state used by `/build` and `/build-auto` |

Keep these artifacts in version control while work is active. Update the specification before implementing an approved requirement change. Do not silently modify the plan to justify code that already diverged.

## Path A: Greenfield Adoption

Greenfield projects can use the full lifecycle from the first meaningful feature because behavior, conventions, and test debt have not accumulated yet.

### Day 0: Establish the Workspace Contract

1. Add the `.agents/` pack at the project root.
2. Review and tailor stack-specific rules.
3. Verify `rtk` and the project's package manager or runtime.
4. Run the asset validator.
5. Confirm slash-command discovery in Antigravity IDE.
6. Decide whether architectural decisions require an ADR from the start.

### First Feature: Define Before Building

Use `/idea` only when the initial request is still vague. Once direction is clear:

```text
/spec
  -> approve SPEC.md
/plan
  -> approve tasks/plan.md and tasks/todo.md
/build
  -> implement one slice and inspect the result
/test
  -> verify the complete change
/review
  -> resolve blockers
/ship
  -> obtain a GO or NO-GO decision
```

Use `/build` for the first few slices. This makes it easier to inspect task quality, test design, commit scope, and rule interpretation before granting broader autonomy.

### When to Introduce `/build-auto`

Move to `/build-auto` when:

- `SPEC.md` is concrete and approved.
- Tasks are small, vertical, dependency-ordered, and independently verifiable.
- The test and build baseline is reliable.
- The worktree is clean except for expected planning artifacts.
- The plan avoids high-risk and irreversible operations.
- You are comfortable with one atomic commit per task.

`/build-auto` removes routine approval between tasks; it does not remove tests, builds, commits, stop conditions, or human ownership of risky decisions.

### Greenfield Skill Routing

Users do not need to load the following skills manually when using the matching slash workflows. Use the table to distinguish deterministic workflow routing from automatic freeform routing.

| Skill | Explicit workflow routing | Automatic freeform trigger | When to request it explicitly |
|---|---|---|---|
| `test-driven-development` | `/build`, `/build-auto`, `/test` | Implementing logic, fixing bugs, or changing behavior | Any behavior change performed outside the lifecycle workflows |
| `git-workflow-and-versioning` | `/build`, `/build-auto` | Creating commits, branches, versions, or releases | When asking for Git mutations outside `/build` workflows |
| `security-and-hardening` | `/ship`; `/review` when relevant | Authentication, authorization, external input, secrets, files, data, or integrations | Sensitive implementation outside `/ship`, or whenever a security pass is mandatory |
| `api-and-interface-design` | `/build` when public contracts are involved | APIs, public functions, events, schemas, or module boundaries | Contract design performed outside `/build` |
| `documentation-and-adrs` | `/ship` when relevant | Architecture, APIs, setup, migration, or operational changes | When a consequential decision must be recorded before shipping |
| `observability-and-instrumentation` | `/ship` when relevant | Production flows, external integrations, background jobs, logging, metrics, or alerts | When instrumentation must be added during implementation rather than discovered at ship review |

Inside the standard lifecycle, the workflow handles routing. For freeform implementation prompts, Antigravity should select matching skills automatically, but explicitly name a skill when the requirement is safety-critical or must not be skipped.

Example:

```text
Use security-and-hardening and observability-and-instrumentation while implementing this payment webhook.
```

### Add Specialists as the Product Grows

| Trigger | Command or skill |
|---|---|
| First user-facing interface | `/ui`, `frontend-design`, `hallmark`, `impeccable` |
| First public API or module contract | `api-and-interface-design` |
| First n8n automation | `/n8n`, `using-n8n-mcp-skills` |
| First production flow | `observability-and-instrumentation` |
| Measurable performance requirement | `/webperf`, `performance-optimization` |
| Release candidate | `/ship`, `shipping-and-launch` |

### Greenfield Anti-Patterns

- Skipping `/spec` because the project is "only a prototype."
- Writing broad horizontal tasks instead of end-to-end slices.
- Starting with `/build-auto` before evaluating one-task build behavior.
- Treating generated code as verified without running tests and the build.
- Deferring security and observability until after production exposure.
- Running `/ship` as if it were a deployment command.

## Path B: Brownfield Adoption

Brownfield adoption starts with understanding and protecting current behavior. The agent should earn broader mutation authority through evidence.

### Phase 1: Map the Existing System

Goal: understand the repository before changing it.

1. Review actual directory structure, runtime versions, commands, CI, and deployment paths.
2. Update workspace rules to describe real conventions and known landmines.
3. Use the local `context-*` skills when architecture, memory, tooling, or context quality needs analysis.
4. Run `/review` on current changes to establish a read-only quality workflow.
5. Use `/webperf` in Quick mode to identify hypotheses without claiming measurements.
6. Record unverified areas rather than assuming code behavior.

Do not begin with broad refactoring or autonomous implementation.

### Phase 2: Build Safety Nets Around Change Areas

Goal: protect the behavior you are about to touch.

1. Identify the smallest area where change is planned.
2. Add characterization tests for undocumented current behavior.
3. Use `/debug` for real defects so each fix adds regression coverage.
4. Use `/test` to close material coverage gaps without changing production behavior.
5. Use `/simplify` only after a passing baseline exists and only within the tested scope.
6. Keep commits small enough to review, bisect, and revert.

Do not attempt repository-wide coverage or cleanup. Ratchet quality upward only where work is already justified.

### Phase 3: Run New Features Through the Full Lifecycle

Goal: treat new work as greenfield inside a protected brownfield boundary.

1. Create `SPEC.md` with explicit legacy surfaces that may and may not change.
2. Use `api-and-interface-design` where new code meets old contracts.
3. Plan vertical slices that preserve compatibility.
4. Use `/build` one task at a time until verification is predictable.
5. Use `/review` before merge and `/ship` before production release.
6. Introduce `/build-auto` only for well-tested, low-risk task sequences.

### Phase 4: Ratchet Production Readiness

Goal: make every future change safer than the previous one.

- Add structured logging and metrics along paths that generate incidents.
- Measure actual bottlenecks before optimizing them.
- Document architecture decisions discovered during maintenance.
- Convert repeated manual verification into reliable tests or checks.
- Remove temporary feature flags and compatibility paths after stable rollout.
- Keep rollback procedures current with schema and infrastructure changes.

### Brownfield Anti-Patterns

- Copying greenfield assumptions into an established system.
- Refactoring code without characterization tests.
- Treating strange legacy behavior as accidental before identifying consumers.
- Granting `/build-auto` authority over a dirty or poorly tested worktree.
- Mixing modernization, feature work, and bug fixes in one task or commit.
- Updating rules to describe an ideal architecture instead of the architecture that exists.

## Operating Modes

### Careful Mode

Use for unfamiliar repositories, important features, or early adoption:

```text
/spec -> /plan -> /build -> inspect -> /build -> /test -> /review
```

This is the default recommended mode.

### Autonomous Mode

Use for approved, low-risk plans with a clean baseline:

```text
/spec -> /plan -> /build-auto -> /test -> /review
```

The agent must still stop on ambiguity, failed verification, unrelated changes, new scope, or high-risk operations.

### When to Use `/feature`

Use `/feature` at the beginning of a new, multi-step feature when the work needs the complete lifecycle and the individual `/spec`, `/plan`, and `/build-auto` contracts are already trusted.

Good candidates have these characteristics:

- The feature spans multiple files, components, or application layers.
- Requirements still need clarification or a formal specification.
- No approved implementation plan exists yet.
- The work can be decomposed into independently testable and revertable tasks.
- The user wants continuity across specification, planning, implementation, testing, and review.
- The change avoids production mutation and known irreversible operations.

Example:

```text
/feature Add team invitations with email onboarding and role selection
```

The workflow preserves separate approval gates for the specification, plan, and autonomous implementation. It runs testing and review, then stops before `/ship`.

Do not use `/feature` when a narrower command has a clearer contract:

| Situation | Use instead |
|---|---|
| Bug or unexpected behavior | `/debug` |
| One approved task | `/build` |
| Specification and plan are already approved | `/build-auto` |
| Test execution or coverage work only | `/test` |
| Read-only code assessment | `/review` |
| Small, scoped UI change | `/ui` |
| n8n workflow work | `/n8n` |
| Production-readiness decision | `/ship` |
| Trivial single-file change | A direct prompt or `/build` |

#### `/feature` vs. `/build-auto`

| `/feature` | `/build-auto` |
|---|---|
| Starts from an idea or feature request | Starts from an approved specification and plan |
| May clarify intent and create `SPEC.md` | Requires `SPEC.md` |
| Creates and approves the implementation plan | Executes the existing plan or creates it only when required by its contract |
| Has separate specification, plan, and autonomy gates | Has one autonomy gate before implementation |
| Continues through final testing and review | Focuses on task implementation |
| Stops before shipping | Also does not ship or deploy |

Rule of thumb: use `/feature` at the start of a substantial new feature; use `/build-auto` after product and implementation decisions are already settled.

### Read-Only Audit Mode

Use when mutation is not authorized:

- `/review` for code quality and correctness.
- `/webperf` for performance evidence or hypotheses.
- `/ship` for production readiness and rollback planning.

## Domain Tracks

### Frontend and UI

Use `/ui` for UI-only work outside an approved implementation plan: scoped visual changes, polish, redesign, critique, audit, design-DNA study, or a focused interface slice. When a UI change is already an approved task in `tasks/todo.md`, keep `/build` as the outer workflow and apply `/ui` routing inside that task.

Use `/webperf` separately when performance needs a measured audit. A visually improved page is not automatically a faster page.

### n8n Workflows

Use `/n8n` as the only general n8n entry point. `using-n8n-mcp-skills` selects specialists for nodes, expressions, code, AI agents, binary data, error handling, subworkflows, and validation.

Before production-impacting work:

- Confirm the target n8n instance.
- Validate node versions and operations.
- Design failure paths and retries.
- Validate the complete workflow.
- Test representative success and failure executions.
- Obtain explicit approval before credential changes, public webhook exposure, activation, or production data mutation.

## Approval Gates

The lifecycle intentionally retains human ownership at these boundaries:

| Gate | Required confirmation |
|---|---|
| Specification | The requirements, architecture, and boundaries are correct |
| Plan | Tasks, dependencies, verification, and risk are acceptable |
| Autonomous build | The plan may run without routine approval between tasks |
| High-risk action | The exact irreversible or production-impacting action is approved |
| n8n production action | Target instance and requested mutation are explicit |
| Shipping | Risks, rollout, monitoring, and rollback are acceptable |

A vague response such as "looks reasonable" is not approval when the workflow requires an explicit gate.

## Mandatory Stops

Agent autonomy ends when:

- Requirements or boundaries are ambiguous.
- Tests, lint, typecheck, or build cannot pass.
- New scope or dependencies are required.
- Unrelated worktree changes appear.
- Authentication, authorization, payments, secrets, or public exposure change.
- Work requires destructive data changes, deployment, credentials, or production mutation.
- The action cannot be safely reversed.

Resolve the blocker explicitly, update the specification or plan when necessary, then resume from the durable artifact state.

## Steady State

Both adoption paths converge on the same operating model:

- Specifications define behavior and boundaries before implementation.
- Plans use small, vertical, independently verifiable tasks.
- Behavior changes use RED-GREEN-REFACTOR.
- Commits are atomic and rollback-friendly.
- Reviews are evidence-backed and read-only.
- Production readiness requires monitoring and a rollback plan.
- Skills load by need; workflows remain thin orchestration contracts.

Greenfield projects can reach this state immediately. Brownfield projects reach it incrementally as tests, context, and operational evidence improve.

## Adoption Checklist

### Workspace

- [ ] `.agents/` is at the project root.
- [ ] Rules match the actual project and directory structure.
- [ ] `rtk` and project runtimes are available.
- [ ] Asset validation passes.
- [ ] Slash commands appear in Antigravity IDE.

### First Change

- [ ] `SPEC.md` is approved.
- [ ] `tasks/plan.md` and `tasks/todo.md` are approved.
- [ ] The first slice uses `/build` rather than immediate broad autonomy.
- [ ] Tests and build evidence are recorded.
- [ ] `/review` has no unresolved blocker.

### Production

- [ ] Security boundaries were reviewed.
- [ ] Migrations and compatibility were verified.
- [ ] Monitoring and ownership are ready.
- [ ] Rollout stages and rollback triggers are explicit.
- [ ] `/ship` returned GO with evidence.
- [ ] Deployment remains a separate, explicitly authorized action.

## References

- [Upstream adoption guide](https://github.com/addyosmani/agent-skills/blob/main/docs/adoption-guide.md)
- [Google Antigravity autonomous developer pipeline codelab](https://codelabs.developers.google.com/autonomous-ai-developer-pipelines-antigravity)
- [Google Antigravity getting started and skills guide](https://codelabs.developers.google.com/getting-started-google-antigravity)
