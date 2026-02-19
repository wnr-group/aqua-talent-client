# Quickstart: Student Portal Light Theme

**Feature**: 001-student-light-theme
**Date**: 2026-02-19

## Prerequisites

- Node.js 20+
- Docker (for local development with subdomains)
- Access to student portal at http://aquatalent.local

## Setup

```bash
# Ensure you're on the feature branch
git checkout 001-student-light-theme

# Install dependencies
npm install

# Start development server
docker-compose up
# OR
npm run dev
```

## Testing URLs

| Portal | URL |
|--------|-----|
| Student (main) | http://aquatalent.local |
| Company | http://company.aquatalent.local |
| Admin | http://admin.aquatalent.local |

**Note**: Run `sudo ./setup-hosts.sh` once to configure local domains.

---

## Implementation Steps

### Step 1: Update StudentNavbar (Foundation)

File: `src/components/layout/StudentNavbar.tsx`

Replace the dark glass navbar with brand-colored solid navbar:

```tsx
// Before (dark theme)
<nav className="fixed top-0 left-0 right-0 z-50 glass">

// After (light theme)
<nav className="fixed top-0 left-0 right-0 z-50 bg-teal-600 shadow-sm">
```

Update nav link classes:
```tsx
// Before
className="text-muted-foreground hover:text-foreground"

// After
className="text-white/80 hover:text-white"
```

### Step 2: Update Page Backgrounds

For each page file, replace the dark background:

```tsx
// Before
<div className="min-h-screen ocean-bg">

// After
<div className="min-h-screen bg-gray-50">
```

### Step 3: Update Card/Container Classes

Replace glass morphism with standard cards:

```tsx
// Before
<div className="glass rounded-2xl p-6">

// After
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
```

### Step 4: Update Text Colors

```tsx
// Before
<h1 className="text-foreground">
<p className="text-muted-foreground">

// After
<h1 className="text-gray-900">
<p className="text-gray-500">
```

### Step 5: Replace Glow Effects

```tsx
// Before
<div className="glow-sm">
<button className="hover:glow-md">

// After
<div className="shadow-sm">
<button className="hover:shadow-md">
```

### Step 6: Update Accent Colors

```tsx
// Before
<span className="text-glow-cyan">
<div className="bg-glow-teal/20 border-glow-teal/30">

// After
<span className="text-teal-600">
<div className="bg-teal-50 border-teal-200">
```

---

## Verification Checklist

After each file change, verify:

- [ ] Page loads without errors (`npm run build`)
- [ ] Background is light gray or white
- [ ] Text is readable (dark on light)
- [ ] Navbar shows brand teal color
- [ ] Cards have white backgrounds with shadows
- [ ] Buttons use teal for primary actions
- [ ] Status badges are visible and distinct
- [ ] Focus states are visible when tabbing
- [ ] No dark theme classes remain (`ocean-bg`, `glass`, `glow-*`)

---

## Common Patterns

### Stat Cards (Dashboard)
```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
      <Icon className="w-6 h-6 text-teal-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">Label</p>
      <p className="text-2xl font-bold text-gray-900">Value</p>
    </div>
  </div>
</div>
```

### Status Badge
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
  Hired
</span>
```

### Primary Button
```tsx
<button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
  Apply Now
</button>
```

### Form Input
```tsx
<input
  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
  placeholder="Enter text..."
/>
```

---

## Files to Update (Priority Order)

1. `src/components/layout/StudentNavbar.tsx`
2. `src/features/public/pages/LandingPage.tsx`
3. `src/features/public/pages/PublicJobsPage.tsx`
4. `src/features/public/pages/PublicJobDetailPage.tsx`
5. `src/features/student/pages/StudentDashboard.tsx`
6. `src/features/student/pages/StudentJobSearch.tsx`
7. `src/features/student/pages/StudentJobDetail.tsx`
8. `src/features/student/pages/StudentApplications.tsx`
9. `src/features/student/pages/StudentProfile.tsx`
10. `src/features/student/pages/SubscriptionPage.tsx`
11. `src/features/student/components/*.tsx` (remaining components)

---

## Build & Validate

```bash
# Type check and build
npm run build

# If successful, verify visually
npm run dev
# Visit http://localhost:5173
```

## Success Criteria Check

- [ ] All student pages have light backgrounds
- [ ] Navbar is teal with white text
- [ ] Cards are white with subtle shadows
- [ ] No `ocean-bg` or `glass` classes in student/public files
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Build passes without TypeScript errors
