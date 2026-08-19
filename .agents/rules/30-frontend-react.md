---
trigger: glob
globs:
  - "client/**/*.js"
  - "client/**/*.jsx"
  - "client/**/*.ts"
  - "client/**/*.tsx"
  - "frontend/**/*.js"
  - "frontend/**/*.jsx"
  - "frontend/**/*.ts"
  - "frontend/**/*.tsx"
---

# React Frontend Standards

Apply these rules to React frontend code.

## Component Fundamentals

- Use functional components only.
- Use one component per file.
- Component files MUST use `PascalCase`.

## Forbidden Frontend Patterns

- Component files MUST NOT contain business logic.
- Component files MUST NOT perform API calls directly.
- Business logic inside JSX is STRICTLY PROHIBITED.
- Fetching data inside components is STRICTLY PROHIBITED.
- Deep prop drilling beyond three levels is STRICTLY PROHIBITED.

## Data Lifecycle

All data fetching MUST:

- be handled outside components through hooks, services, or an API layer,
- explicitly manage loading, error, and success states,
- prevent duplicate concurrent requests.

## Component Responsibility

Components MAY handle purely local UI state, such as:

- toggles,
- inputs,
- tabs,
- temporary UI flags.

## Global State Elevation

Context MUST be used ONLY IF:

- state is global, such as auth or theme,
- AND shared across three or more components.

## Hook Strategy

Business logic MUST reside in custom hooks named `useXxx` or in dedicated service functions.

Hooks MUST encapsulate:

- API calls,
- data transformations,
- side effects.
