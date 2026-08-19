---
name: security-and-hardening
description: Threat-models and hardens code handling user input, authentication, authorization, data, secrets, files, URLs, dependencies, or external integrations. Use during design, review, and pre-launch security checks.
---

# Security and Hardening

## Threat Model First

1. Identify assets, actors, trust boundaries, entry points, and abuse cases.
2. Classify actions as always-do, ask-first, or never-do.
3. Review the highest-impact boundary before lower-risk style concerns.

## Always Do

- Validate and normalize external input at the boundary.
- Enforce authorization at the resource or query boundary.
- Use parameterized queries and safe process APIs.
- Keep secrets out of source, logs, errors, and client bundles.
- Use least privilege, secure defaults, and explicit allowlists.
- Treat model output and external API data as untrusted input.
- Review dependency and lockfile changes together.

## Ask First

- Authentication or permission model changes
- Public exposure or CORS expansion
- Secret, credential, or key rotation
- Destructive migrations or data deletion
- Disabling a security control
- Production dependency upgrades with breaking risk

## Never Do

- Hardcode credentials or tokens.
- Build SQL or shell commands by concatenating untrusted data.
- Pass untrusted data to `eval`, unsafe HTML sinks, or arbitrary file paths.
- Log passwords, tokens, full payment data, or unnecessary personal data.
- Bypass authorization because the caller is an internal component.

## Review Areas

Check authentication, authorization, injection, XSS, CSRF, SSRF, file upload safety, rate limits, session handling, error disclosure, dependency risk, configuration, and AI output handling where applicable.

## Common Rationalizations

| Rationalization | Response |
|---|---|
| "The endpoint is internal." | Internal networks and services are still trust boundaries. |
| "The frontend already validates it." | Client validation is user experience, not a security boundary. |
| "The secret is only temporary." | Repository and log history are durable. |

## Verification

- [ ] Trust boundaries and abuse cases are explicit.
- [ ] Inputs, authorization, and outputs are enforced server-side.
- [ ] No secrets or sensitive data leak through code or logs.
- [ ] Dependency changes were audited.
- [ ] High-risk actions received explicit approval.

