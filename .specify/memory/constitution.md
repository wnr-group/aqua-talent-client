<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0 (MAJOR - initial ratification)
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (3 principles)
  - Technology Standards
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no changes needed - generic)
  - .specify/templates/spec-template.md ✅ (no changes needed - generic)
  - .specify/templates/tasks-template.md ✅ (no changes needed - generic)
Follow-up TODOs: None
-->

# Aqua Talent Client Constitution

## Core Principles

### I. Component-First Architecture

All UI features MUST be built as self-contained React components with clear boundaries.

- Components MUST be reusable and composable where practical
- Each component MUST have a single, well-defined responsibility
- Shared state MUST use React Context or a designated state management solution
- Components MUST NOT directly access browser APIs without abstraction layers
- File structure MUST organize components by feature domain, not by type

**Rationale**: Component isolation enables independent development, easier debugging,
and predictable behavior across the application.

### II. Type Safety

TypeScript MUST be used for all source files with strict configuration enabled.

- All function parameters and return types MUST be explicitly typed
- `any` type MUST NOT be used except in exceptional cases with inline justification
- Shared interfaces and types MUST be defined in dedicated type files
- API responses MUST have corresponding TypeScript interfaces
- Props MUST be typed using interface definitions, not inline types

**Rationale**: Type safety catches errors at compile time, improves IDE support,
and serves as living documentation for the codebase.

### III. Simplicity

The simplest solution that meets requirements MUST be chosen.

- YAGNI: Features MUST NOT be built until actually needed
- Dependencies MUST be justified; prefer native browser/React APIs when sufficient
- Abstractions MUST only be created after patterns repeat three or more times
- Configuration MUST use sensible defaults; avoid premature optimization
- Code MUST be readable without extensive comments; self-documenting preferred

**Rationale**: Simplicity reduces maintenance burden, speeds onboarding, and
minimizes surface area for bugs.

## Technology Standards

**Framework**: React with Vite build tooling
**Language**: TypeScript (strict mode)
**Styling**: CSS Modules or Tailwind CSS (project to decide)
**State Management**: React Context for simple state; Zustand/Jotai for complex state
**HTTP Client**: Fetch API or Axios (project to decide)
**Routing**: React Router v6+

All technology choices not specified above MUST be documented before adoption.
New dependencies MUST be evaluated for bundle size impact, maintenance status,
and alignment with existing stack.

## Development Workflow

**Branch Strategy**: Feature branches off `main`, merged via pull request
**Code Review**: All changes MUST be reviewed before merge to `main`
**Commit Messages**: Use conventional commits format (feat:, fix:, chore:, etc.)
**Formatting**: Prettier for code formatting, ESLint for linting (configured in repo)

Pull requests SHOULD include:
- Clear description of changes and motivation
- Screenshots for UI changes
- Notes on any breaking changes or migration steps

## Governance

This constitution supersedes all other project practices where conflicts arise.

**Amendment Process**:
1. Propose amendment with rationale in writing
2. Review period of at least 24 hours for team feedback
3. Document change in constitution with version bump
4. Communicate changes to all contributors

**Versioning Policy**:
- MAJOR: Principle removal or fundamental redefinition
- MINOR: New principle or section added, material guidance expansion
- PATCH: Clarifications, typo fixes, non-semantic refinements

**Compliance**: All pull requests MUST be checked against constitution principles.
Violations MUST be justified in the PR description or resolved before merge.

**Version**: 1.0.0 | **Ratified**: 2026-02-13 | **Last Amended**: 2026-02-13
