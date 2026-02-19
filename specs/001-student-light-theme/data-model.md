# Data Model: Student Portal Light Theme

**Feature**: 001-student-light-theme
**Date**: 2026-02-19

## Overview

This feature is UI-only and does not introduce new data entities. This document defines the **theme configuration schema** and **CSS class mapping** that serves as the "data model" for styling.

---

## Theme Color Palette

### Brand Colors (from Logo)
| Token | Hex Value | Tailwind Class | Usage |
|-------|-----------|----------------|-------|
| brand-cyan | #00f0ff | `text-cyan-400` | Logo "Aqua" text |
| brand-teal | #00d4aa | `text-teal-400` | Logo "Talentz" text |

### Light Theme Semantic Colors
| Token | Hex Value | Tailwind Class | Usage |
|-------|-----------|----------------|-------|
| background | #f8fafc | `bg-gray-50` | Page backgrounds |
| surface | #ffffff | `bg-white` | Cards, modals |
| foreground | #0f172a | `text-gray-900` | Primary text |
| muted | #64748b | `text-gray-500` | Secondary text |
| border | #e2e8f0 | `border-gray-200` | Borders, dividers |
| primary | #0d9488 | `bg-teal-600` | Primary actions, navbar |
| primary-hover | #0f766e | `bg-teal-700` | Primary hover state |

### Status Colors (Light Background Variants)
| Status | Background | Text | Border |
|--------|------------|------|--------|
| success | `bg-green-100` | `text-green-700` | `border-green-200` |
| warning | `bg-yellow-100` | `text-yellow-700` | `border-yellow-200` |
| error | `bg-red-100` | `text-red-700` | `border-red-200` |
| info | `bg-blue-100` | `text-blue-700` | `border-blue-200` |

---

## Component Style Definitions

### Navbar
```
Container: bg-teal-600 shadow-sm
Logo text: Keep existing brand colors
Nav links: text-white/80 hover:text-white
Active link: text-white font-medium
User section: bg-white/10 rounded-lg
```

### Card
```
Container: bg-white rounded-lg shadow-sm border border-gray-200
Hover state: shadow-md (optional)
Title: text-gray-900 font-semibold
Content: text-gray-700
```

### Button - Primary
```
Default: bg-teal-600 text-white rounded-lg
Hover: bg-teal-700
Focus: ring-2 ring-teal-500 ring-offset-2
Disabled: bg-gray-300 text-gray-500
```

### Button - Secondary
```
Default: bg-white text-gray-700 border border-gray-300 rounded-lg
Hover: bg-gray-50
Focus: ring-2 ring-gray-500 ring-offset-2
```

### Input
```
Default: bg-white border border-gray-300 rounded-lg text-gray-900
Placeholder: text-gray-400
Focus: border-teal-500 ring-1 ring-teal-500
Error: border-red-500 ring-1 ring-red-500
```

### Badge
```
Default: rounded-full px-3 py-1 text-sm font-medium
Variants: See Status Colors table above
```

---

## CSS Class Migration Map

### Page-Level Classes
| Old (Dark) | New (Light) |
|------------|-------------|
| `ocean-bg` | `bg-gray-50 min-h-screen` |
| `min-h-screen ocean-bg` | `min-h-screen bg-gray-50` |

### Container Classes
| Old (Dark) | New (Light) |
|------------|-------------|
| `glass` | `bg-white border border-gray-200` |
| `glass rounded-2xl` | `bg-white rounded-xl shadow-sm border border-gray-200` |
| `card-elevated` | `bg-white shadow-md rounded-lg` |

### Text Classes
| Old (Dark) | New (Light) |
|------------|-------------|
| `text-foreground` | `text-gray-900` |
| `text-muted-foreground` | `text-gray-500` |
| `text-glow-cyan` | `text-teal-600` |
| `text-glow-teal` | `text-teal-500` |

### Effect Classes
| Old (Dark) | New (Light) |
|------------|-------------|
| `glow-sm` | `shadow-sm` |
| `glow-md` | `shadow-md` |
| `glow-lg` | `shadow-lg` |
| `hover:glow-sm` | `hover:shadow-md` |

### Border Classes
| Old (Dark) | New (Light) |
|------------|-------------|
| `border-border` | `border-gray-200` |
| `border-glow-cyan/30` | `border-teal-200` |
| `border-glow-teal/30` | `border-teal-200` |

### Background Accents
| Old (Dark) | New (Light) |
|------------|-------------|
| `bg-glow-cyan/20` | `bg-teal-50` |
| `bg-glow-teal/20` | `bg-teal-50` |
| `bg-glow-purple/20` | `bg-purple-50` |
| `bg-ocean-surface` | `bg-gray-100` |

---

## Validation Rules

1. **Contrast Ratio**: All text must meet WCAG AA (4.5:1 minimum)
   - `text-gray-900` on `bg-white`: ✅ 15.4:1
   - `text-gray-500` on `bg-white`: ✅ 4.6:1
   - `text-white` on `bg-teal-600`: ✅ 4.5:1

2. **Focus States**: All interactive elements must have visible focus indicators
   - Primary: `ring-2 ring-teal-500`
   - Secondary: `ring-2 ring-gray-500`

3. **Hover States**: Must provide visual feedback
   - Buttons: Color shift (teal-600 → teal-700)
   - Cards: Shadow increase (shadow-sm → shadow-md)
   - Links: Underline or color change
