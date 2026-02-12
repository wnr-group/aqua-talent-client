# Implementation Plan: Job Marketplace Platform

**Branch**: `001-job-marketplace` | **Date**: 2026-02-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-job-marketplace/spec.md`

## Summary

Build a job marketplace platform with three distinct portals (company, student, admin) enabling companies to post jobs after admin approval, students to apply with monthly limits (one-click profile linking), and admins to moderate both company registrations and job applications. React/Vite/TypeScript frontend with a backend API for data persistence and business logic.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode per constitution)
**Frontend Framework**: React 18+ with Vite (per constitution)
**Backend**: Provided externally (frontend consumes API, see [contracts/](./contracts/))
**Primary Dependencies**: React Router v6+, Zod validation, Tailwind CSS
**Testing**: Vitest for frontend (Vite ecosystem)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Frontend-only React application (3 portals)
**Performance Goals**: 95% of searches < 2 seconds (SC-004), 100 concurrent users (SC-006)
**Constraints**: Session-based auth (via API), no email verification, 10 applications/month/student
**Scale/Scope**: 100 concurrent users, 3 portals, ~15 screens total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Component-First | UI as self-contained React components | ✅ PASS | Will organize by feature domain (company/, student/, admin/) |
| I. Component-First | Single responsibility per component | ✅ PASS | Each form, list, card as separate component |
| I. Component-First | Shared state via Context/Zustand | ✅ PASS | Auth context shared, portal-specific state isolated |
| I. Component-First | No direct browser API access | ✅ PASS | Abstract via custom hooks (useLocalStorage, etc.) |
| II. Type Safety | TypeScript strict mode | ✅ PASS | tsconfig strict: true |
| II. Type Safety | Explicit types, no `any` | ✅ PASS | Define interfaces for all entities, API responses |
| II. Type Safety | Dedicated type files | ✅ PASS | src/types/ directory for shared types |
| III. Simplicity | YAGNI - no premature features | ✅ PASS | MVP scope only per user stories |
| III. Simplicity | Justify dependencies | ✅ PASS | See research.md for justifications |
| III. Simplicity | Abstractions after 3+ repetitions | ✅ PASS | Start concrete, refactor later |

**Gate Result**: ✅ PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-job-marketplace/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - local dev setup
├── contracts/           # Phase 1 output - API specifications
│   └── api.yaml         # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/              # Shared UI components
│   ├── common/              # Buttons, inputs, cards, modals
│   └── layout/              # Headers, sidebars, page layouts
├── features/                # Feature-based organization
│   ├── auth/                # Login, registration, password reset
│   │   ├── components/      # Auth forms, protected routes
│   │   ├── pages/           # Login, Register, ForgotPassword
│   │   └── hooks/           # useAuth, useSession
│   ├── company/             # Company portal features
│   │   ├── components/      # JobPostingForm, ApplicantCard, etc.
│   │   ├── pages/           # Dashboard, CreateJob, ViewApplicants
│   │   └── hooks/           # useCompanyJobs, useApplicants
│   ├── student/             # Student portal features
│   │   ├── components/      # JobCard, ApplicationCard, ProfileForm
│   │   ├── pages/           # JobSearch, MyApplications, Profile
│   │   └── hooks/           # useJobSearch, useApplications
│   └── admin/               # Admin portal features
│       ├── components/      # ReviewCard, QueueList, StatsCard
│       ├── pages/           # Dashboard, CompanyQueue, ApplicationQueue
│       └── hooks/           # usePendingReviews, useAdminStats
├── services/                # API client layer
│   └── api/                 # API client functions per domain
│       ├── client.ts        # Base fetch wrapper with auth
│       ├── auth.ts          # Auth endpoints
│       ├── companies.ts     # Company endpoints
│       ├── students.ts      # Student endpoints
│       ├── jobs.ts          # Job posting endpoints
│       └── applications.ts  # Application endpoints
├── hooks/                   # Shared custom hooks
├── contexts/                # React contexts (auth, notifications)
├── types/                   # TypeScript interfaces (from data-model.md)
├── utils/                   # Helper functions
├── config/                  # Environment config, constants
└── mocks/                   # Mock data for development (optional)

public/                      # Static assets
```

**Structure Decision**: Frontend-only React application organized by feature domain per constitution. Three portals share components but have isolated feature directories. API client layer abstracts backend communication. Backend API is provided externally.

## Complexity Tracking

> No violations requiring justification. Design follows constitution principles.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Backend | External API (not in scope) | Frontend-only project; API provided separately |
| Three portals | Single React app with routing | Simpler than 3 separate apps; shared components reduce duplication |
| State management | React Context only | Zustand deferred per YAGNI - Context sufficient for auth + portal state |
| API client | Native Fetch wrapper | Simplicity principle - no axios needed for basic REST calls |
