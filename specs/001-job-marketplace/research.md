# Research: Job Marketplace Platform

**Date**: 2026-02-13
**Branch**: `001-job-marketplace`
**Scope**: Frontend only (API provided externally)
**Purpose**: Resolve technical decisions for frontend implementation

## Research Summary

| Topic | Decision | Confidence |
|-------|----------|------------|
| Styling | Tailwind CSS | High |
| HTTP Client | Native Fetch API | High |
| Form Handling | React Hook Form + Zod | High |
| State Management | React Context | High |
| Routing | React Router v6 | High |

---

## 1. Styling Solution

### Question
CSS Modules or Tailwind CSS? (Constitution allows either)

### Decision
**Tailwind CSS**

### Rationale
- **Velocity**: Faster to prototype UI without switching files
- **Consistency**: Design system built-in (spacing, colors, typography)
- **Bundle size**: Purges unused CSS automatically
- **Constitution alignment**: Simpler than maintaining CSS modules + design tokens

### Implementation Notes
- Install `tailwindcss`, `postcss`, `autoprefixer`
- Configure in `tailwind.config.js`
- Use `@tailwindcss/forms` plugin for form styling
- Consider `shadcn/ui` for pre-built accessible components (copy-paste, not dependency)

---

## 2. HTTP Client

### Question
Fetch API or Axios? (Constitution allows either)

### Decision
**Native Fetch API**

### Rationale
- **Zero dependencies**: Built into all modern browsers
- **Constitution alignment**: Simplicity principle - don't add dependencies without justification
- **Sufficient for needs**: No advanced features needed (interceptors, etc.)
- **TypeScript support**: Generic typing works well with fetch

### Implementation Notes
- Create thin wrapper in `src/services/api/client.ts`
- Handle common patterns: auth headers, error handling, JSON parsing
- Type responses using generics: `fetchApi<JobPosting[]>('/jobs')`

```typescript
// src/services/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiError {
  message: string;
  status: number;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // for session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

---

## 3. Form Handling

### Question
Manual form state vs form library?

### Decision
**React Hook Form + Zod**

### Rationale
- **Performance**: Minimizes re-renders with uncontrolled inputs
- **Validation**: Zod provides TypeScript-first schema validation
- **Type safety**: Zod schemas generate TypeScript types automatically
- **Constitution alignment**: Small bundle impact, significant DX improvement

### Implementation Notes
- Install `react-hook-form` and `zod` with `@hookform/resolvers`
- Define Zod schemas in `src/types/schemas/`
- Reuse schemas for API request validation

```typescript
// src/types/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

---

## 4. State Management

### Question
React Context vs Zustand/Jotai?

### Decision
**React Context only**

### Rationale
- **Simplicity**: YAGNI - Context sufficient for auth state and current user
- **Constitution alignment**: Don't add dependencies until patterns repeat
- **Scope**: Limited global state needed (auth, notifications, theme)
- **Future-proof**: Easy to migrate to Zustand if complexity grows

### Implementation Notes
- `AuthContext`: Current user, login/logout functions, loading state
- `NotificationContext`: Toast messages, alerts
- Portal-specific state stays local to feature components

---

## 5. Routing Strategy

### Question
How to handle three portals with different layouts?

### Decision
**React Router v6 with nested layouts**

### Rationale
- **Constitution requirement**: React Router v6+ specified
- **Clean separation**: Each portal gets its own layout component
- **Shared auth**: Single auth context, route guards per portal

### Implementation Notes
```typescript
// src/App.tsx routing structure
<Routes>
  {/* Auth routes - shared */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register/:type" element={<RegisterPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

  {/* Company portal */}
  <Route path="/company" element={<CompanyLayout />}>
    <Route index element={<CompanyDashboard />} />
    <Route path="jobs" element={<CompanyJobs />} />
    <Route path="jobs/new" element={<CreateJob />} />
    <Route path="jobs/:id" element={<JobDetail />} />
    <Route path="jobs/:id/applicants" element={<JobApplicants />} />
  </Route>

  {/* Student portal */}
  <Route path="/student" element={<StudentLayout />}>
    <Route index element={<JobSearch />} />
    <Route path="jobs/:id" element={<JobDetail />} />
    <Route path="applications" element={<MyApplications />} />
    <Route path="profile" element={<StudentProfile />} />
  </Route>

  {/* Admin portal */}
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="companies" element={<CompanyQueue />} />
    <Route path="applications" element={<ApplicationQueue />} />
  </Route>
</Routes>
```

---

## 6. Development with Mock Data

### Question
How to develop without backend API available?

### Decision
**MSW (Mock Service Worker) for API mocking**

### Rationale
- **Realistic**: Intercepts actual fetch calls, no code changes for production
- **Constitution alignment**: Development aid, zero production impact
- **Flexible**: Can be disabled when real API is available

### Implementation Notes
- Install `msw` as dev dependency
- Create handlers in `src/mocks/handlers.ts`
- Enable only in development mode
- Remove or disable when connecting to real API

---

## Dependency Summary

### package.json
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^5.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "@tailwindcss/forms": "^0.5.x",
    "vitest": "^1.x",
    "@testing-library/react": "^14.x",
    "msw": "^2.x"
  }
}
```

---

## Environment Configuration

```bash
# .env.development
VITE_API_URL=http://localhost:3001/api

# .env.production
VITE_API_URL=https://api.aquatalent.com
```
