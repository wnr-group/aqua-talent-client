# Implementation Plan: Student Portal Light Theme

**Branch**: `001-student-light-theme` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-student-light-theme/spec.md`

## Summary

Transform the student portal and public pages from a dark ocean theme to a clean, professional light theme matching the admin portal aesthetic. The navigation bar will feature brand colors (cyan/teal) from the AquaTalentz logo. This is a UI-only change affecting CSS variables, component styling, and page layouts—no backend or API changes required.

## Technical Context

**Language/Version**: TypeScript 5.6 with React 18.3
**Primary Dependencies**: React, Tailwind CSS 4.x, Vite 6.x, Lucide React (icons)
**Storage**: N/A (UI-only change)
**Testing**: Manual visual testing, `npm run build` for type checking
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web frontend (single-page application)
**Performance Goals**: Page load within 10% of current performance
**Constraints**: WCAG AA compliance (4.5:1 contrast ratio minimum)
**Scale/Scope**: 16 pages/components to update, ~3000 lines of CSS/TSX changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Component-First Architecture** | ✅ PASS | Changes are scoped to existing components; no new architecture patterns |
| **II. Type Safety** | ✅ PASS | No new types required; using existing Tailwind class strings |
| **III. Simplicity** | ✅ PASS | Leveraging existing `[data-theme="light"]` CSS variables; no new dependencies |

**Technology Standards Compliance**:
- React with Vite: ✅ Already in use
- TypeScript (strict): ✅ Already configured
- Tailwind CSS: ✅ Already in use
- React Router v6+: ✅ Using v7

**No violations identified. Proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-student-light-theme/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Theme patterns research
├── data-model.md        # Phase 1: Theme configuration schema
├── quickstart.md        # Phase 1: Implementation guide
└── checklists/
    └── requirements.md  # Validation checklist
```

### Source Code (repository root)

```text
src/
├── index.css                          # Theme variables (PRIMARY CHANGE)
├── components/
│   ├── common/
│   │   ├── Logo.tsx                   # Brand colors reference
│   │   ├── Card.tsx                   # Light theme styling
│   │   ├── Button.tsx                 # Brand color accents
│   │   ├── Input.tsx                  # Form styling
│   │   └── Badge.tsx                  # Status colors
│   └── layout/
│       └── StudentNavbar.tsx          # Brand-colored navbar
├── features/
│   ├── public/
│   │   └── pages/
│   │       ├── LandingPage.tsx        # Light theme update
│   │       ├── PublicJobsPage.tsx     # Light theme update
│   │       └── PublicJobDetailPage.tsx # Light theme update
│   └── student/
│       ├── pages/
│       │   ├── StudentDashboard.tsx   # Light theme update
│       │   ├── StudentApplications.tsx # Light theme update
│       │   ├── StudentJobDetail.tsx   # Light theme update
│       │   ├── StudentJobSearch.tsx   # Light theme update
│       │   ├── StudentProfile.tsx     # Light theme update
│       │   └── SubscriptionPage.tsx   # Light theme update
│       └── components/
│           ├── CurrentPlanBadge.tsx   # Light theme update
│           ├── EducationSection.tsx   # Light theme update
│           ├── ExperienceSection.tsx  # Light theme update
│           ├── FeatureList.tsx        # Light theme update
│           ├── PricingCard.tsx        # Light theme update
│           ├── ProfileCompleteness.tsx # Light theme update
│           └── SkillsSection.tsx      # Light theme update
```

**Structure Decision**: Single frontend project. All changes are within existing `src/` structure. No new directories required.

## Complexity Tracking

> No violations identified. Table not applicable.

## Files Requiring Changes

### Tier 1: Foundation (Must complete first)
| File | Change Type | Description |
|------|-------------|-------------|
| `src/index.css` | Modify | Apply light theme as default for student/public pages |
| `src/components/layout/StudentNavbar.tsx` | Modify | Brand-colored navbar with cyan/teal |

### Tier 2: Common Components
| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/common/Card.tsx` | Review | Ensure light theme compatibility |
| `src/components/common/Button.tsx` | Review | Brand color primary buttons |
| `src/components/common/Input.tsx` | Review | Light background form fields |
| `src/components/common/Badge.tsx` | Review | Semantic colors on light bg |

### Tier 3: Public Pages
| File | Change Type | Description |
|------|-------------|-------------|
| `src/features/public/pages/LandingPage.tsx` | Modify | Replace ocean-bg with light theme |
| `src/features/public/pages/PublicJobsPage.tsx` | Modify | Light theme job cards |
| `src/features/public/pages/PublicJobDetailPage.tsx` | Modify | Light theme job details |

### Tier 4: Student Pages
| File | Change Type | Description |
|------|-------------|-------------|
| `src/features/student/pages/StudentDashboard.tsx` | Modify | Replace ocean-bg, glass effects |
| `src/features/student/pages/StudentApplications.tsx` | Modify | Light theme cards/badges |
| `src/features/student/pages/StudentJobDetail.tsx` | Modify | Light theme job view |
| `src/features/student/pages/StudentJobSearch.tsx` | Modify | Light theme search/filters |
| `src/features/student/pages/StudentProfile.tsx` | Modify | Light theme forms |
| `src/features/student/pages/SubscriptionPage.tsx` | Modify | Light theme pricing cards |

### Tier 5: Student Components
| File | Change Type | Description |
|------|-------------|-------------|
| `src/features/student/components/PricingCard.tsx` | Modify | White bg, subtle shadows |
| `src/features/student/components/ProfileCompleteness.tsx` | Modify | Light theme progress |
| `src/features/student/components/EducationSection.tsx` | Modify | Light theme forms |
| `src/features/student/components/ExperienceSection.tsx` | Modify | Light theme forms |
| `src/features/student/components/SkillsSection.tsx` | Modify | Light theme chips |
| `src/features/student/components/CurrentPlanBadge.tsx` | Modify | Light theme badge |
| `src/features/student/components/FeatureList.tsx` | Modify | Light theme list |

## CSS Class Replacements

| Dark Theme Class | Light Theme Replacement |
|------------------|------------------------|
| `ocean-bg` | `bg-gray-50` or `bg-white` |
| `glass` | `bg-white shadow-sm border border-gray-200` |
| `text-foreground` | `text-gray-900` |
| `text-muted-foreground` | `text-gray-500` |
| `border-border` | `border-gray-200` |
| `bg-ocean-deep` | `bg-white` |
| `bg-ocean-dark` | `bg-gray-50` |
| `glow-cyan/20` (backgrounds) | `bg-teal-50` or `bg-cyan-50` |
| `glow-sm`, `glow-md`, `glow-lg` | `shadow-sm`, `shadow-md`, `shadow-lg` |
| `text-glow-cyan` | `text-teal-600` |
| `text-glow-teal` | `text-teal-500` |

## Navbar Color Specification

The navigation bar should use brand colors matching the logo:
- **Background**: Gradient from cyan (`#00f0ff`) to teal (`#00d4aa`) OR solid teal (`#0d9488`)
- **Text**: White or dark contrast depending on background intensity
- **Logo text**: Keep existing `text-glow-cyan` / `text-glow-teal` for brand recognition
