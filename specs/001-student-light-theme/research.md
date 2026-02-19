# Research: Student Portal Light Theme

**Feature**: 001-student-light-theme
**Date**: 2026-02-19

## Research Summary

This document captures design decisions and patterns for implementing the light theme transformation.

---

## Decision 1: Theme Application Strategy

**Decision**: Apply light theme by modifying component classes directly rather than using CSS theme switcher.

**Rationale**:
- Spec explicitly states "light theme only, no toggle"
- Simpler implementation without theme context provider
- Existing `[data-theme="light"]` CSS variables provide color palette reference
- Direct class changes are easier to review and test

**Alternatives Considered**:
- Theme context with CSS variables: Rejected - adds complexity for a fixed theme
- Separate CSS file for light theme: Rejected - harder to maintain, not needed for single theme

---

## Decision 2: Navbar Brand Color Treatment

**Decision**: Use solid teal background (`bg-teal-600`) with white text for the navbar.

**Rationale**:
- Matches admin portal's professional aesthetic
- Teal (#0d9488) is the existing light theme primary color in CSS
- Solid color is cleaner than gradient for professional look
- White text on teal provides excellent contrast (WCAG AAA)

**Alternatives Considered**:
- Cyan-to-teal gradient: Considered but may appear less professional
- White navbar with teal text: Less distinctive brand presence
- Glassmorphism on light: Doesn't match admin portal aesthetic

---

## Decision 3: Card Styling Pattern

**Decision**: Use white background with subtle shadow and gray border (`bg-white shadow-sm border border-gray-200 rounded-lg`).

**Rationale**:
- Matches admin portal Card component exactly
- Provides clear visual hierarchy on light backgrounds
- Subtle shadow creates depth without dark theme "glow" effects

**Alternatives Considered**:
- Pure white without border: Less definition between cards
- Stronger shadows: Too heavy, doesn't match admin aesthetic

---

## Decision 4: Form Input Styling

**Decision**: White background, gray-200 border, teal-500 focus ring.

**Rationale**:
- Consistent with admin portal form inputs
- Brand color (teal) for focus states maintains identity
- Clear visual feedback for accessibility

**Alternatives Considered**:
- Gray background inputs: Inconsistent with admin portal
- Cyan focus ring: Too bright for professional aesthetic

---

## Decision 5: Glow Effect Replacement

**Decision**: Replace all glow effects with standard Tailwind shadows.

| Glow Class | Shadow Replacement |
|------------|-------------------|
| `glow-sm` | `shadow-sm` |
| `glow-md` | `shadow-md` |
| `glow-lg` | `shadow-lg` |

**Rationale**:
- Glow effects designed for dark backgrounds look wrong on light
- Standard shadows are the professional norm for light themes
- Maintains visual hierarchy without theme-specific effects

---

## Decision 6: Status Badge Colors

**Decision**: Keep semantic colors but adjust brightness for light background contrast.

| Status | Color Class |
|--------|-------------|
| Success (hired) | `bg-green-100 text-green-700 border-green-200` |
| Warning (pending) | `bg-yellow-100 text-yellow-700 border-yellow-200` |
| Error (rejected) | `bg-red-100 text-red-700 border-red-200` |
| Info (reviewed) | `bg-blue-100 text-blue-700 border-blue-200` |
| Primary (active) | `bg-teal-100 text-teal-700 border-teal-200` |

**Rationale**:
- Light background variants (100 level) work well on white
- Text colors (700 level) ensure WCAG AA contrast
- Border adds definition without relying on dark theme glow

---

## Decision 7: Page Background Strategy

**Decision**: Use `bg-gray-50` for page backgrounds, `bg-white` for content cards.

**Rationale**:
- Creates visual separation between page and content
- Matches common professional web app patterns
- Admin portal uses similar light gray/white hierarchy

---

## Implementation Order Recommendation

1. **index.css**: Update root theme variables for student/public pages
2. **StudentNavbar**: Brand-colored navbar (most visible change)
3. **Common components**: Card, Button, Input, Badge verification
4. **Public pages**: LandingPage, PublicJobsPage, PublicJobDetailPage
5. **Student pages**: Dashboard → JobSearch → Applications → Profile → Subscription
6. **Student components**: Update remaining student-specific components

This order ensures foundational styles are in place before page updates.
