# Tasks: Job Marketplace Platform

**Input**: Design documents from `/specs/001-job-marketplace/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.yaml, research.md

**Tests**: Not explicitly requested - test tasks omitted per spec.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Frontend-only React app: `src/` at repository root
- Feature-based: `src/features/{auth,company,student,admin}/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vite + React + TypeScript project with `npm create vite@latest`
- [x] T002 Install dependencies: react-router-dom, react-hook-form, @hookform/resolvers, zod, date-fns
- [x] T003 [P] Install dev dependencies: tailwindcss, postcss, autoprefixer, @tailwindcss/forms
- [x] T004 [P] Configure TypeScript strict mode in tsconfig.json with path aliases (@/*)
- [x] T005 [P] Configure Tailwind CSS in tailwind.config.js and src/index.css
- [x] T006 [P] Configure ESLint and Prettier for code formatting
- [x] T007 Create folder structure per plan.md in src/ (components, features, services, hooks, contexts, types, utils, config)
- [x] T008 [P] Create environment files (.env.development, .env.production) with VITE_API_URL

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create TypeScript interfaces for all entities in src/types/entities.ts (Company, Student, Admin, JobPosting, Application)
- [x] T010 [P] Create TypeScript interfaces for API responses in src/types/api.ts (AuthResponse, Error, pagination types)
- [x] T011 [P] Create enum types in src/types/enums.ts (CompanyStatus, JobStatus, ApplicationStatus, UserType)
- [x] T012 Create base API client with fetch wrapper in src/services/api/client.ts
- [x] T013 [P] Create Zod validation schemas in src/types/schemas/auth.ts (loginSchema, registerSchemas)
- [x] T014 [P] Create Zod validation schemas in src/types/schemas/job.ts (jobCreateSchema, jobUpdateSchema)
- [x] T015 Create AuthContext provider in src/contexts/AuthContext.tsx with login/logout/user state
- [x] T016 Create NotificationContext provider in src/contexts/NotificationContext.tsx for toast messages
- [x] T017 Create ProtectedRoute component in src/components/common/ProtectedRoute.tsx
- [x] T018 [P] Create shared Button component in src/components/common/Button.tsx
- [x] T019 [P] Create shared Input component in src/components/common/Input.tsx
- [x] T020 [P] Create shared Card component in src/components/common/Card.tsx
- [x] T021 [P] Create shared Modal component in src/components/common/Modal.tsx
- [x] T022 [P] Create shared LoadingSpinner component in src/components/common/LoadingSpinner.tsx
- [x] T023 [P] Create shared Alert component in src/components/common/Alert.tsx
- [x] T024 Create main App.tsx with React Router setup and context providers
- [x] T025 Create base layout components in src/components/layout/ (Header.tsx, Sidebar.tsx, PageContainer.tsx)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Company Registration & Job Posting (Priority: P1) 🎯 MVP

**Goal**: Companies can register, get approved by admin, and post jobs that require admin approval

**Independent Test**: Register a company account, wait for admin approval (mock), create a job posting, view job dashboard

### API Client for US1

- [ ] T026 [US1] Create auth API functions in src/services/api/auth.ts (login, logout, getMe, passwordReset)
- [ ] T027 [US1] Create companies API functions in src/services/api/companies.ts (register, getMe, getMyJobs)
- [ ] T028 [US1] Create jobs API functions in src/services/api/jobs.ts (create, update, getById, getApplicants)

### Auth Feature (shared, but built for US1)

- [ ] T029 [P] [US1] Create LoginForm component in src/features/auth/components/LoginForm.tsx
- [ ] T030 [P] [US1] Create CompanyRegisterForm component in src/features/auth/components/CompanyRegisterForm.tsx
- [ ] T031 [P] [US1] Create ForgotPasswordForm component in src/features/auth/components/ForgotPasswordForm.tsx
- [x] T032 [US1] Create LoginPage in src/features/auth/pages/LoginPage.tsx
- [x] T033 [US1] Create RegisterPage in src/features/auth/pages/RegisterPage.tsx (with company/student toggle)
- [ ] T034 [US1] Create ForgotPasswordPage in src/features/auth/pages/ForgotPasswordPage.tsx
- [ ] T035 [US1] Create useAuth hook in src/features/auth/hooks/useAuth.ts

### Company Portal Pages

- [ ] T036 [US1] Create CompanyLayout in src/features/company/components/CompanyLayout.tsx (header, sidebar, outlet)
- [ ] T037 [US1] Create PendingApprovalPage in src/features/company/pages/PendingApprovalPage.tsx (shown when status=pending)
- [x] T038 [US1] Create CompanyDashboard in src/features/company/pages/CompanyDashboard.tsx (job stats, recent jobs)
- [ ] T039 [P] [US1] Create JobPostingForm component in src/features/company/components/JobPostingForm.tsx
- [ ] T040 [P] [US1] Create JobCard component in src/features/company/components/JobCard.tsx (for job list)
- [ ] T041 [P] [US1] Create JobStatusBadge component in src/features/company/components/JobStatusBadge.tsx
- [x] T042 [US1] Create CreateJobPage in src/features/company/pages/CreateJobPage.tsx
- [x] T043 [US1] Create MyJobsPage in src/features/company/pages/MyJobsPage.tsx (list all company jobs)
- [x] T044 [US1] Create JobDetailPage in src/features/company/pages/JobDetailPage.tsx (view/edit single job)
- [ ] T045 [US1] Create useCompanyJobs hook in src/features/company/hooks/useCompanyJobs.ts

### Company Portal Routing

- [ ] T046 [US1] Add company portal routes to App.tsx (/company/*, nested under CompanyLayout)

**Checkpoint**: Companies can register, see pending status, and (after mock approval) create/view jobs

---

## Phase 4: User Story 2 - Student Job Search & Application (Priority: P2)

**Goal**: Students can register, search active jobs, apply (one-click), track applications, withdraw pending

**Independent Test**: Register student, search jobs, apply to a job, verify application count decreases, withdraw and verify count restores

### API Client for US2

- [ ] T047 [US2] Create students API functions in src/services/api/students.ts (register, getMe, updateProfile)
- [ ] T048 [US2] Create applications API functions in src/services/api/applications.ts (create, getMine, withdraw)
- [ ] T049 [US2] Extend jobs API in src/services/api/jobs.ts (search with filters, getActive)

### Student Registration

- [ ] T050 [P] [US2] Create StudentRegisterForm component in src/features/auth/components/StudentRegisterForm.tsx
- [ ] T051 [US2] Update RegisterPage to include student registration option

### Student Portal Components

- [ ] T052 [US2] Create StudentLayout in src/features/student/components/StudentLayout.tsx
- [ ] T053 [P] [US2] Create JobSearchCard component in src/features/student/components/JobSearchCard.tsx
- [ ] T054 [P] [US2] Create JobSearchFilters component in src/features/student/components/JobSearchFilters.tsx
- [ ] T055 [P] [US2] Create ApplicationCard component in src/features/student/components/ApplicationCard.tsx
- [ ] T056 [P] [US2] Create ApplicationStatusBadge component in src/features/student/components/ApplicationStatusBadge.tsx
- [ ] T057 [P] [US2] Create ApplicationLimitBanner component in src/features/student/components/ApplicationLimitBanner.tsx
- [ ] T058 [P] [US2] Create ProfileForm component in src/features/student/components/ProfileForm.tsx
- [ ] T059 [P] [US2] Create HiredBanner component in src/features/student/components/HiredBanner.tsx (shows when isHired=true)

### Student Portal Pages

- [x] T060 [US2] Create JobSearchPage in src/features/student/pages/JobSearchPage.tsx (search, filter, list)
- [x] T061 [US2] Create JobDetailPage in src/features/student/pages/JobDetailPage.tsx (view job, apply button)
- [x] T062 [US2] Create MyApplicationsPage in src/features/student/pages/MyApplicationsPage.tsx
- [x] T063 [US2] Create ProfilePage in src/features/student/pages/ProfilePage.tsx

### Student Hooks

- [ ] T064 [US2] Create useJobSearch hook in src/features/student/hooks/useJobSearch.ts (search, filter, pagination)
- [ ] T065 [US2] Create useApplications hook in src/features/student/hooks/useApplications.ts (list, apply, withdraw)
- [ ] T066 [US2] Create useStudentProfile hook in src/features/student/hooks/useStudentProfile.ts

### Student Portal Routing

- [ ] T067 [US2] Add student portal routes to App.tsx (/student/*, nested under StudentLayout)

**Checkpoint**: Students can register, search/filter jobs, apply (with limit enforcement), view/withdraw applications

---

## Phase 5: User Story 3 - Admin Application Moderation (Priority: P3)

**Goal**: Admins can view dashboard, review pending companies/jobs/applications, approve/reject with one click

**Independent Test**: Login as admin, view dashboard stats, approve a pending company, approve a pending job, approve/reject applications

### API Client for US3

- [ ] T068 [US3] Create admin API functions in src/services/api/admin.ts (getStats, getPendingCompanies, getPendingJobs, getPendingApplications, approve/reject endpoints)

### Admin Portal Components

- [ ] T069 [US3] Create AdminLayout in src/features/admin/components/AdminLayout.tsx
- [ ] T070 [P] [US3] Create StatsCard component in src/features/admin/components/StatsCard.tsx
- [ ] T071 [P] [US3] Create CompanyReviewCard component in src/features/admin/components/CompanyReviewCard.tsx
- [ ] T072 [P] [US3] Create JobReviewCard component in src/features/admin/components/JobReviewCard.tsx
- [ ] T073 [P] [US3] Create ApplicationReviewCard component in src/features/admin/components/ApplicationReviewCard.tsx
- [ ] T074 [P] [US3] Create RejectModal component in src/features/admin/components/RejectModal.tsx (reason input)
- [ ] T075 [P] [US3] Create QueueTabs component in src/features/admin/components/QueueTabs.tsx (switch between queues)

### Admin Portal Pages

- [x] T076 [US3] Create AdminDashboard in src/features/admin/pages/AdminDashboard.tsx (stats overview, quick links)
- [x] T077 [US3] Create CompanyQueuePage in src/features/admin/pages/CompanyQueuePage.tsx
- [x] T078 [US3] Create JobQueuePage in src/features/admin/pages/JobQueuePage.tsx
- [x] T079 [US3] Create ApplicationQueuePage in src/features/admin/pages/ApplicationQueuePage.tsx

### Admin Hooks

- [ ] T080 [US3] Create useAdminStats hook in src/features/admin/hooks/useAdminStats.ts
- [ ] T081 [US3] Create usePendingReviews hook in src/features/admin/hooks/usePendingReviews.ts (companies, jobs, applications)

### Admin Portal Routing

- [ ] T082 [US3] Add admin portal routes to App.tsx (/admin/*, nested under AdminLayout)

**Checkpoint**: Admins can moderate all pending items (companies, jobs, applications) from unified dashboard

---

## Phase 6: User Story 4 - Multi-Portal User Experience (Priority: P4)

**Goal**: Complete portal separation with distinct layouts, navigation, and role-based access

**Independent Test**: Access each portal URL, verify correct layout loads, verify cross-portal navigation blocked

### Portal Enhancements

- [ ] T083 [US4] Create LandingPage in src/features/auth/pages/LandingPage.tsx (portal selection: company/student)
- [ ] T084 [US4] Update Header components per portal with portal-specific branding in src/components/layout/
- [ ] T085 [P] [US4] Create CompanySidebar in src/features/company/components/CompanySidebar.tsx
- [ ] T086 [P] [US4] Create StudentSidebar in src/features/student/components/StudentSidebar.tsx
- [ ] T087 [P] [US4] Create AdminSidebar in src/features/admin/components/AdminSidebar.tsx
- [ ] T088 [US4] Add portal route guards to prevent cross-portal access (company user can't access /student)
- [ ] T089 [US4] Create 404 NotFoundPage in src/features/auth/pages/NotFoundPage.tsx
- [ ] T090 [US4] Create UnauthorizedPage in src/features/auth/pages/UnauthorizedPage.tsx

### Company Portal - Applicant Management (US1 extension)

- [ ] T091 [US4] Create ApplicantCard component in src/features/company/components/ApplicantCard.tsx
- [ ] T092 [US4] Create ApplicantsPage in src/features/company/pages/ApplicantsPage.tsx (view approved applicants per job)
- [ ] T093 [US4] Create useApplicants hook in src/features/company/hooks/useApplicants.ts
- [ ] T094 [US4] Add "Mark as Hired" functionality to ApplicantCard component

**Checkpoint**: All portals have distinct UX, proper access control, and complete feature sets

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T095 [P] Add loading states to all pages using LoadingSpinner component
- [ ] T096 [P] Add error boundary component in src/components/common/ErrorBoundary.tsx
- [ ] T097 [P] Add empty state components for lists (no jobs, no applications, no pending items)
- [ ] T098 Implement toast notifications using NotificationContext across all API calls
- [ ] T099 [P] Add responsive design adjustments for mobile viewports
- [ ] T100 [P] Create utility functions in src/utils/formatters.ts (date, currency, status formatting)
- [ ] T101 Add keyboard navigation and focus management for accessibility
- [ ] T102 Validate all forms show proper error messages from Zod schemas
- [ ] T103 Run quickstart.md validation - verify local dev setup works
- [ ] T104 Final code cleanup - remove unused imports, console.logs, commented code

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
┌───────────────────────────────────────────────────┐
│ Phase 3: US1    Phase 4: US2    Phase 5: US3     │
│ (Company)       (Student)        (Admin)          │
│                      ↓                            │
│               Phase 6: US4 (Portal Polish)        │
└───────────────────────────────────────────────────┘
    ↓
Phase 7: Polish
```

### User Story Dependencies

- **US1 (Company)**: Can start after Phase 2 - No dependencies on other stories
- **US2 (Student)**: Can start after Phase 2 - Independent, but benefits from US1 jobs existing
- **US3 (Admin)**: Can start after Phase 2 - Independent, but reviews items from US1/US2
- **US4 (Portal Polish)**: Depends on US1, US2, US3 base implementations

### Parallel Opportunities

**Phase 1 (parallel after T001-T002):**
- T003, T004, T005, T006, T008 can run in parallel

**Phase 2 (parallel groups):**
- T009, T010, T011 (types) in parallel
- T013, T014 (schemas) in parallel
- T018-T023 (shared components) all in parallel

**Phase 3 - US1 (parallel groups):**
- T029, T030, T031 (auth forms) in parallel
- T039, T040, T041 (company components) in parallel

**Phase 4 - US2 (parallel groups):**
- T053-T059 (student components) all in parallel

**Phase 5 - US3 (parallel groups):**
- T070-T075 (admin components) all in parallel

**Phase 6 - US4 (parallel groups):**
- T085, T086, T087 (sidebars) in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T025)
3. Complete Phase 3: User Story 1 (T026-T046)
4. **STOP and VALIDATE**: Company can register and post jobs
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Company) → Companies can register and post jobs
3. Add US2 (Student) → Students can search and apply
4. Add US3 (Admin) → Full moderation workflow
5. Add US4 (Polish) → Production-ready portals

### Task Count Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: Setup | 8 | 5 |
| Phase 2: Foundational | 17 | 10 |
| Phase 3: US1 (Company) | 21 | 8 |
| Phase 4: US2 (Student) | 21 | 9 |
| Phase 5: US3 (Admin) | 15 | 7 |
| Phase 6: US4 (Portal) | 12 | 3 |
| Phase 7: Polish | 10 | 5 |
| **Total** | **104** | **47** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Frontend-only: All API calls go to external backend (VITE_API_URL)
