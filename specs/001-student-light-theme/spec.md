# Feature Specification: Student Portal Light Theme

**Feature Branch**: `001-student-light-theme`
**Created**: 2026-02-19
**Status**: Complete
**Input**: User description: "Make the student portal light theme similar to admin portal, Keep the nav bar and footer color similar to the logo. The admin portal has simple white elegant professional look. In the student portal do not miss out the ui aesthetics during this rework."

## Clarifications

### Session 2026-02-19

- Q: Should public pages (landing, public job listings) also adopt the light theme? → A: Yes, include all public pages for a full light theme across all student-facing pages
- Q: Should users have theme toggle (light/dark) or light-only? → A: Light theme only, no toggle - consistent experience for all users

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Student Views Dashboard with Light Theme (Priority: P1)

A student logs into their account and sees their dashboard displayed with a clean, professional light theme. The interface uses a white/light gray background with clear, readable text and the brand colors (cyan/teal) prominently featured in the navigation bar and key accent elements.

**Why this priority**: This is the primary interface students interact with daily. A consistent, professional appearance builds trust and improves usability.

**Independent Test**: Can be fully tested by logging in as a student and visually verifying the dashboard displays with light backgrounds, dark text, and brand-colored navigation elements.

**Acceptance Scenarios**:

1. **Given** a student is logged in, **When** they view the dashboard, **Then** the page displays with a light background (white or light gray) instead of the dark ocean theme
2. **Given** a student is on any student portal page, **When** they view the navigation bar, **Then** the navbar displays the brand colors (cyan/teal matching the AquaTalentz logo)
3. **Given** a student navigates the portal, **When** they read any text content, **Then** the text is dark colored for optimal readability on light backgrounds

---

### User Story 2 - Student Browses Jobs with Professional Light UI (Priority: P1)

A student searches and browses job listings in the light-themed interface. Job cards, filters, and search results display cleanly with proper contrast, professional styling, and the same visual hierarchy as the admin portal.

**Why this priority**: Job browsing is a core student activity. The light theme must work seamlessly for this high-traffic feature.

**Independent Test**: Can be tested by navigating to job search, applying filters, and viewing job detail pages - all should maintain consistent light theme styling.

**Acceptance Scenarios**:

1. **Given** a student is on the job search page, **When** they view job cards, **Then** cards display with white backgrounds, subtle shadows, and clear typography
2. **Given** a student views a job detail page, **When** they read job information, **Then** all content sections maintain the light professional aesthetic with proper visual hierarchy
3. **Given** a student uses job filters, **When** they interact with form elements, **Then** inputs and buttons follow the light theme styling with cyan/teal accents for primary actions

---

### User Story 3 - Student Manages Applications with Consistent Styling (Priority: P2)

A student views their applications list and individual application details. Status badges, progress indicators, and action buttons maintain visual consistency with the light theme while preserving their semantic color meanings.

**Why this priority**: Application tracking is important but relies on consistent styling established in higher priority stories.

**Independent Test**: Can be tested by viewing the applications page and verifying all status indicators, badges, and interactive elements follow the light theme.

**Acceptance Scenarios**:

1. **Given** a student views their applications, **When** they see status badges (pending, reviewed, hired), **Then** badges maintain distinct colors for each status while fitting the light theme aesthetic
2. **Given** a student views application details, **When** they see action buttons, **Then** primary actions use brand colors (cyan/teal) and secondary actions use subtle gray styling

---

### User Story 4 - Student Updates Profile with Light Theme Forms (Priority: P2)

A student edits their profile information using forms styled with the light theme. Form inputs, validation messages, and save confirmations provide clear visual feedback appropriate for a light background.

**Why this priority**: Profile management is secondary to job searching but requires form styling consistency.

**Independent Test**: Can be tested by navigating to profile, editing fields, and verifying form elements display correctly with proper validation styling.

**Acceptance Scenarios**:

1. **Given** a student is on the profile page, **When** they view form fields, **Then** inputs have light backgrounds with subtle borders and focus states using brand accent colors
2. **Given** a student submits a form with errors, **When** validation fails, **Then** error messages display in red with appropriate contrast against the light background

---

### User Story 5 - Student Views Subscription Page with Light Theme (Priority: P3)

A student views subscription plans and pricing information. Pricing cards, feature comparisons, and upgrade buttons display professionally in the light theme.

**Why this priority**: Subscription is an important business feature but lower priority for visual consistency.

**Independent Test**: Can be tested by navigating to subscription page and verifying pricing cards and CTAs follow light theme styling.

**Acceptance Scenarios**:

1. **Given** a student views subscription options, **When** they see pricing cards, **Then** cards display with clean white backgrounds, clear pricing, and brand-colored upgrade buttons

---

### Edge Cases

- What happens when a component uses hardcoded dark theme colors? The component must be updated to use theme-aware color variables.
- How does the system handle existing CSS classes like "ocean-bg" and "glass"? These must be replaced or modified to support light theme variants.
- What happens to glow effects designed for dark backgrounds? Glow effects should be adjusted or replaced with subtle shadows appropriate for light backgrounds.
- How do gradient backgrounds appear on light theme? Gradients should be revised to work with light backgrounds or replaced with solid colors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all student-facing pages (including public landing page, public job listings, and authenticated student portal) with a light background color (white or light gray) instead of the dark ocean theme
- **FR-002**: System MUST render the navigation bar with brand colors (cyan and teal) that match the AquaTalentz logo
- **FR-003**: System MUST display all text content in dark colors for optimal readability on light backgrounds
- **FR-004**: System MUST style all Card components with white backgrounds and subtle shadows, consistent with the admin portal
- **FR-005**: System MUST maintain semantic color meanings for status badges (success=green, warning=yellow, error=red, info=blue)
- **FR-006**: System MUST style primary action buttons with brand colors (cyan/teal gradient or solid teal)
- **FR-007**: System MUST style form inputs with light backgrounds, subtle borders, and brand-colored focus states
- **FR-008**: System MUST replace dark glassmorphism effects with appropriate light theme alternatives (subtle shadows, light borders)
- **FR-009**: System MUST ensure all hover and focus states are visible and professional on light backgrounds
- **FR-010**: System MUST maintain visual hierarchy using spacing, typography weight, and subtle color variations rather than glow effects

### Key Entities

- **Theme Configuration**: Color palette and theme tokens that define the light theme appearance
- **Navigation Component**: Header/navbar that displays brand colors and provides portal navigation
- **Card Component**: Container component used throughout the portal for content grouping
- **Form Components**: Input, select, button, and validation message styling

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of student portal pages render with light backgrounds (no dark ocean theme visible)
- **SC-002**: Navigation bar consistently displays brand colors across all student portal pages
- **SC-003**: All text maintains a minimum contrast ratio of 4.5:1 against backgrounds (WCAG AA compliance)
- **SC-004**: Visual consistency score of 90%+ when compared side-by-side with admin portal styling
- **SC-005**: Zero visual regressions in component functionality (badges, buttons, forms, cards all remain fully usable)
- **SC-006**: Page load time remains within 10% of current performance (theme changes do not impact performance)

## Out of Scope

- Theme toggle functionality (light/dark mode switcher) - not included in this feature
- Dark theme preservation for student portal - will be fully replaced by light theme

## Assumptions

- The existing light theme CSS variables (`[data-theme="light"]`) in index.css provide a foundation to build upon
- The admin portal's PageContainer and Card component patterns are the reference for the desired professional aesthetic
- Brand colors (cyan and teal from the logo) should be used as accent/primary colors, not as background colors
- The student portal should feel like part of the same product family as the admin portal while maintaining its own identity
- Form components and interactive elements should follow the same patterns used in the admin portal
- Accessibility standards (WCAG AA) for color contrast must be maintained
