# Claude Code Instructions

Instructions for Claude Code when working on the Aqua Talent Client project.

## Project Context

This is a **React + TypeScript** job marketplace frontend with MSW for API mocking. The project uses a custom design system with Tailwind CSS.

## Key Files to Reference

Before making changes, read these files:
- `AGENTS.md` - Complete design system and component patterns
- `src/index.css` - CSS variables and design tokens
- `src/types/` - TypeScript types and enums
- `src/mocks/handlers.ts` - API endpoints and business logic

## Commands

```bash
# Development (local)
npm run dev          # Start dev server with MSW mocking

# Development (Docker - recommended)
docker-compose up    # Start with subdomain support

# Build
npm run build        # TypeScript check + Vite build

# Lint
npm run lint         # ESLint check
```

## Docker Development

The project uses Docker for development with pre-configured subdomain support.

### Quick Start
```bash
# Setup hosts (one-time)
sudo ./setup-hosts.sh

# Start dev server
docker-compose up
```

### Portal URLs
- Student: http://aquatalent.local
- Company: http://company.aquatalent.local
- Admin: http://admin.aquatalent.local

### Docker Files
- `Dockerfile` - Vite dev server container
- `docker-compose.yml` - Development orchestration with hot reload
- `setup-hosts.sh` - Hosts file configuration script

## Code Style

### Imports Order
```typescript
// 1. React/external libraries
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// 2. Internal components/hooks
import { PageContainer } from '@/components/layout'
import Button from '@/components/common/Button'

// 3. Types
import { Application, ApplicationStatus } from '@/types'

// 4. Services/utilities
import { api } from '@/services/api/client'
import { format } from 'date-fns'

// 5. Icons (always from lucide-react)
import { User, Briefcase, Calendar } from 'lucide-react'
```

### Component Structure
```typescript
export default function ComponentName() {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [data, setData] = useState<Type[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { success, error } = useNotification()

  // 2. Derived state
  const filteredData = data.filter(...)

  // 3. Event handlers
  const handleAction = async () => { ... }

  // 4. Effects
  useEffect(() => { ... }, [])

  // 5. Render
  return (...)
}
```

## Component Patterns

### Use Existing Components
Always use existing components from `src/components/common/`:
- `Button` - All buttons (variants: primary, secondary, outline, destructive, ghost)
- `Input` - Form inputs (supports leftIcon, rightIcon, error, helperText)
- `Card` - Content containers (supports hover prop for interactive cards)
- `Badge` - Status indicators (variants: default, primary, success, warning, destructive)
- `Alert` - Notifications (variants: success, error, warning, info)
- `Modal` - Dialog windows
- `LoadingSpinner` - Loading states

### Page Layout
Always wrap pages in `PageContainer`:
```tsx
<PageContainer
  title="Page Title"
  description="Optional description"
  actions={<Button>Optional Action</Button>}
>
  {/* Content */}
</PageContainer>
```

## Styling Guidelines

### Do Use
- Tailwind utility classes
- Design system colors: `blue-600`, `gray-50`, `gray-200`, `gray-500`, `gray-900`
- Consistent spacing: `gap-2`, `gap-4`, `gap-6`, `mb-4`, `mb-6`, `mb-8`
- Rounded corners: `rounded-lg`, `rounded-xl`, `rounded-full`
- Consistent shadows: `shadow-sm`, `shadow-lg`

### Don't Use
- Inline styles
- Custom CSS files (use Tailwind)
- Random color values (stick to the palette)
- Non-standard icons (use Lucide only)

## API Integration

### Mock Server (MSW)
The project uses MSW for API mocking. All endpoints are defined in `src/mocks/handlers.ts`.

To add a new endpoint:
```typescript
// In src/mocks/handlers.ts
http.get(`${API_URL}/new-endpoint`, async () => {
  await delay(DELAY_MS)
  // Return mock data
  return HttpResponse.json({ data: [] })
})
```

### API Client Usage
```typescript
import { api } from '@/services/api/client'

// GET
const data = await api.get<ResponseType>('/endpoint')

// POST
await api.post('/endpoint', payload)

// PATCH
await api.patch(`/endpoint/${id}`, updates)
```

## Authentication Flow

Users are identified by `UserType`:
- `UserType.STUDENT` - Students searching for jobs
- `UserType.COMPANY` - Companies posting jobs
- `UserType.ADMIN` - Platform administrators

Auth state is managed via `AuthContext`:
```typescript
const { user, isAuthenticated, login, logout } = useAuthContext()
```

## Business Logic

### Application Status Flow
```
PENDING → (Admin reviews) → REVIEWED or REJECTED
REVIEWED → (Company action) → HIRED
Any state → (Student action) → WITHDRAWN
```

### Key Rules
1. Companies must be admin-approved before posting jobs
2. Jobs must be admin-approved before visible to students
3. Applications must be admin-approved before visible to companies
4. Students limited to 2 active applications
5. Students marked as "hired" cannot apply to more jobs

## Testing Changes

After making changes:
1. Run `npm run build` to check for TypeScript errors
2. Run `npm run dev` and test the feature manually
3. Check all three portals if changes affect shared components

## Common Tasks

### Adding a New Page
1. Create page component in appropriate feature folder
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Sidebar.tsx` if needed

### Adding a New API Endpoint
1. Add handler in `src/mocks/handlers.ts`
2. Update mock data in `src/mocks/data.ts` if needed
3. Add types in `src/types/entities.ts` if needed

### Updating a Component
1. Read the current implementation
2. Follow existing patterns
3. Ensure TypeScript types are correct
4. Test across all usage sites

## File Locations Quick Reference

| Need | Location |
|------|----------|
| Add UI component | `src/components/common/` |
| Add page | `src/features/{portal}/pages/` |
| Add API endpoint | `src/mocks/handlers.ts` |
| Add mock data | `src/mocks/data.ts` |
| Add type | `src/types/entities.ts` |
| Add enum | `src/types/enums.ts` |
| Add validation schema | `src/types/schemas/` |
| Modify design tokens | `src/index.css` |
| Add route | `src/App.tsx` |

## Don'ts

- Don't create new CSS files - use Tailwind
- Don't use random icons - use Lucide React
- Don't hardcode colors - use design system
- Don't skip TypeScript types
- Don't forget loading/empty states
- Don't forget error handling with notifications
