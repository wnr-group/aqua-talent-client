# Tasks: Student Portal Light Theme

**Input**: Design documents from `/specs/001-student-light-theme/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated tests requested - using manual visual testing and `npm run build` for validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Single project (frontend)**: `src/` at repository root
- All paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Prepare codebase understanding and reference materials

- [x] T001 Review admin portal styling patterns in `src/features/admin/pages/AdminDashboard.tsx`
- [x] T002 Review current theme variables in `src/index.css`
- [x] T003 [P] Document CSS class mapping from `specs/001-student-light-theme/data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core styling changes that MUST be complete before ANY user story page can be updated

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Update StudentNavbar to use brand-colored teal background in `src/components/layout/StudentNavbar.tsx`
- [x] T005 [P] Review and verify Card component light theme compatibility in `src/components/common/Card.tsx`
- [x] T006 [P] Review and verify Button component brand colors in `src/components/common/Button.tsx`
- [x] T007 [P] Review and verify Input component light theme styling in `src/components/common/Input.tsx`
- [x] T008 [P] Review and verify Badge component semantic colors in `src/components/common/Badge.tsx`
- [x] T009 Run `npm run build` to verify no TypeScript errors after foundational changes

**Checkpoint**: Navbar and common components ready - user story page updates can now begin

---

## Phase 3: User Story 1 - Dashboard Light Theme (Priority: P1) 🎯 MVP

**Goal**: Student dashboard displays with clean, professional light theme including branded navbar

**Independent Test**: Log in as student, view dashboard - should show light gray background, white cards with shadows, teal navbar, dark readable text

### Implementation for User Story 1

- [x] T010 [US1] Replace ocean-bg with bg-gray-50 in `src/features/student/pages/StudentDashboard.tsx`
- [x] T011 [US1] Replace glass containers with white cards in `src/features/student/pages/StudentDashboard.tsx`
- [x] T012 [US1] Update text colors (foreground→gray-900, muted→gray-500) in `src/features/student/pages/StudentDashboard.tsx`
- [x] T013 [US1] Replace glow effects with shadows in `src/features/student/pages/StudentDashboard.tsx`
- [x] T014 [US1] Update accent colors (glow-cyan→teal-600, glow-teal→teal-500) in `src/features/student/pages/StudentDashboard.tsx`
- [x] T015 [P] [US1] Update ProfileCompleteness component for light theme in `src/features/student/components/ProfileCompleteness.tsx`
- [x] T016 [P] [US1] Update CurrentPlanBadge component for light theme in `src/features/student/components/CurrentPlanBadge.tsx`
- [x] T017 [US1] Run `npm run build` and visual test dashboard

**Checkpoint**: Dashboard fully functional with light theme - can demo MVP

---

## Phase 4: User Story 2 - Job Browsing Light Theme (Priority: P1)

**Goal**: Job search, job listings, and job detail pages display with professional light theme

**Independent Test**: Navigate to job search, browse listings, view job details - all should show light backgrounds with proper card styling

### Implementation for User Story 2

- [x] T018 [US2] Update LandingPage with light theme in `src/features/public/pages/LandingPage.tsx`
- [x] T019 [P] [US2] Update PublicJobsPage with light theme in `src/features/public/pages/PublicJobsPage.tsx`
- [x] T020 [P] [US2] Update PublicJobDetailPage with light theme in `src/features/public/pages/PublicJobDetailPage.tsx`
- [x] T021 [US2] Update StudentJobSearch with light theme in `src/features/student/pages/StudentJobSearch.tsx`
- [x] T022 [US2] Update StudentJobDetail with light theme in `src/features/student/pages/StudentJobDetail.tsx`
- [x] T023 [US2] Run `npm run build` and visual test job pages

**Checkpoint**: All job browsing pages functional with light theme

---

## Phase 5: User Story 3 - Applications Light Theme (Priority: P2)

**Goal**: Applications list and details display with consistent light theme, proper status badge colors

**Independent Test**: Navigate to My Applications, view application details - status badges visible, cards styled correctly

### Implementation for User Story 3

- [x] T024 [US3] Replace ocean-bg with bg-gray-50 in `src/features/student/pages/StudentApplications.tsx`
- [x] T025 [US3] Update glass containers to white cards in `src/features/student/pages/StudentApplications.tsx`
- [x] T026 [US3] Update text and accent colors in `src/features/student/pages/StudentApplications.tsx`
- [x] T027 [US3] Verify status badge colors (green/yellow/red/blue) visible on light background in `src/features/student/pages/StudentApplications.tsx`
- [x] T028 [US3] Run `npm run build` and visual test applications page

**Checkpoint**: Applications page functional with light theme and proper status indicators

---

## Phase 6: User Story 4 - Profile Light Theme (Priority: P2)

**Goal**: Profile page forms display with light theme, proper input styling and validation feedback

**Independent Test**: Navigate to Profile, edit fields, test validation - forms should have white backgrounds with teal focus states

### Implementation for User Story 4

- [x] T029 [US4] Replace ocean-bg with bg-gray-50 in `src/features/student/pages/StudentProfile.tsx`
- [x] T030 [US4] Update glass containers to white cards in `src/features/student/pages/StudentProfile.tsx`
- [x] T031 [US4] Update text and accent colors in `src/features/student/pages/StudentProfile.tsx`
- [x] T032 [P] [US4] Update EducationSection component for light theme in `src/features/student/components/EducationSection.tsx`
- [x] T033 [P] [US4] Update ExperienceSection component for light theme in `src/features/student/components/ExperienceSection.tsx`
- [x] T034 [P] [US4] Update SkillsSection component for light theme in `src/features/student/components/SkillsSection.tsx`
- [x] T035 [US4] Run `npm run build` and visual test profile page

**Checkpoint**: Profile page and all form sections functional with light theme

---

## Phase 7: User Story 5 - Subscription Light Theme (Priority: P3)

**Goal**: Subscription page with pricing cards displays professionally in light theme

**Independent Test**: Navigate to Subscription page, view pricing cards - clean white cards with teal upgrade buttons

### Implementation for User Story 5

- [x] T036 [US5] Replace ocean-bg with bg-gray-50 in `src/features/student/pages/SubscriptionPage.tsx`
- [x] T037 [US5] Update glass/gradient containers to white cards in `src/features/student/pages/SubscriptionPage.tsx`
- [x] T038 [US5] Update text and accent colors in `src/features/student/pages/SubscriptionPage.tsx`
- [x] T039 [P] [US5] Update PricingCard component for light theme in `src/features/student/components/PricingCard.tsx`
- [x] T040 [P] [US5] Update FeatureList component for light theme in `src/features/student/components/FeatureList.tsx`
- [x] T041 [US5] Run `npm run build` and visual test subscription page

**Checkpoint**: Subscription page functional with light theme

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T042 Full visual regression test - compare all pages side-by-side with admin portal
- [x] T043 [P] Verify WCAG AA contrast ratios on all text elements
- [x] T044 [P] Remove any remaining dark theme classes (search for ocean-bg, glass, glow-)
- [x] T045 Run final `npm run build` to verify no TypeScript errors
- [ ] T046 Test all pages in Chrome, Firefox, Safari
- [x] T047 Update spec.md status from Draft to Complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority - can proceed in parallel
  - US3 and US4 are both P2 priority - can proceed in parallel after P1
  - US5 is P3 priority - proceed after P2
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational - Independent of US1/US2
- **User Story 4 (P2)**: Can start after Foundational - Independent of US1/US2/US3
- **User Story 5 (P3)**: Can start after Foundational - Independent of other stories

### Within Each User Story

- Page-level updates first (main TSX file)
- Component updates can run in parallel [P] within story
- Build verification at end of each story
- Story complete before marking as done

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational component reviews (T005-T008) can run in parallel
- US1 and US2 can run in parallel (both P1)
- US3 and US4 can run in parallel (both P2)
- Components within a story marked [P] can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After T004 (navbar), these can run in parallel:
Task T005: "Review Card component in src/components/common/Card.tsx"
Task T006: "Review Button component in src/components/common/Button.tsx"
Task T007: "Review Input component in src/components/common/Input.tsx"
Task T008: "Review Badge component in src/components/common/Badge.tsx"
```

## Parallel Example: User Story 1 Components

```bash
# After main dashboard updates (T010-T014), these can run in parallel:
Task T015: "Update ProfileCompleteness component"
Task T016: "Update CurrentPlanBadge component"
```

## Parallel Example: User Story 4 Components

```bash
# After main profile page updates (T029-T031), these can run in parallel:
Task T032: "Update EducationSection component"
Task T033: "Update ExperienceSection component"
Task T034: "Update SkillsSection component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Dashboard)
4. **STOP and VALIDATE**: Test dashboard independently
5. Demo if ready - students can use light-themed dashboard

### Incremental Delivery

1. Complete Setup + Foundational → Navbar and common components ready
2. Add US1 (Dashboard) → Test independently → Demo (MVP!)
3. Add US2 (Jobs) → Test independently → Demo
4. Add US3 (Applications) → Test independently → Demo
5. Add US4 (Profile) → Test independently → Demo
6. Add US5 (Subscription) → Test independently → Demo
7. Polish phase → Final validation → Complete

### Recommended Order (Single Developer)

1. Phase 1 → Phase 2 → Phase 3 (MVP)
2. Phase 4 → Phase 5 → Phase 6 → Phase 7
3. Phase 8 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies - can run simultaneously
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Run `npm run build` after each story phase to catch errors early
- Commit after each completed story for easy rollback
- Use data-model.md CSS class mapping table as reference during implementation
- Use quickstart.md code examples for consistent styling patterns
