# AI Agent Development Guide

This document provides comprehensive guidance for AI agents working on the Aqua Talent Client project.

## Project Overview

Aqua Talent is a job marketplace platform with three portals:
- **Student Portal**: Job seekers browse and apply to jobs (2 application limit)
- **Company Portal**: Employers post jobs and hire candidates
- **Admin Portal**: Platform moderators approve companies, jobs, and applications

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 with TypeScript |
| Build Tool | Vite 6 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |
| Date Handling | date-fns |
| Mock API | MSW (Mock Service Worker) 2 |

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Alert.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── NotificationToast.tsx
│   └── layout/          # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── PageContainer.tsx
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── features/            # Feature-based organization
│   ├── auth/pages/      # Login, registration pages
│   ├── student/pages/   # Student portal pages
│   ├── company/pages/   # Company portal pages
│   └── admin/pages/     # Admin portal pages
├── mocks/               # MSW mock server
│   ├── browser.ts       # MSW browser setup
│   ├── data.ts          # Mock data & test credentials
│   └── handlers.ts      # API endpoint handlers
├── services/api/        # API client
├── types/               # TypeScript types
│   ├── enums.ts
│   ├── entities.ts
│   └── schemas/         # Zod validation schemas
└── index.css            # Design system CSS variables
```

## Design System

### CSS Variables

The design system uses CSS custom properties defined in `src/index.css`:

```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --card: #ffffff;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --destructive: #dc2626;
  --success: #16a34a;
  --warning: #d97706;
  --border: #e2e8f0;
  --radius: 0.5rem;
}
```

### Color Palette

| Purpose | Color | Tailwind Class |
|---------|-------|----------------|
| Primary actions | Blue 600 | `bg-blue-600`, `text-blue-600` |
| Success states | Green 600 | `bg-green-600`, `text-green-600` |
| Warning states | Yellow 600 | `bg-yellow-600`, `text-yellow-600` |
| Error/Destructive | Red 600 | `bg-red-600`, `text-red-600` |
| Backgrounds | Gray 50 | `bg-gray-50` |
| Cards | White | `bg-white` |
| Text primary | Gray 900 | `text-gray-900` |
| Text secondary | Gray 500 | `text-gray-500` |
| Borders | Gray 200 | `border-gray-200` |

### Typography

- **Headings**: `font-semibold` with appropriate text sizes
- **Body text**: `text-sm` (14px) or `text-base` (16px)
- **Labels**: `text-sm font-medium text-gray-700`
- **Helper text**: `text-sm text-gray-500`

## Component Patterns

### Button Component

```tsx
import Button from '@/components/common/Button'
import { Plus } from 'lucide-react'

// Variants: primary, secondary, outline, destructive, ghost, link
// Sizes: sm, md, lg, icon

<Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
  Create New
</Button>

<Button variant="outline" size="sm" isLoading={isSubmitting}>
  Submit
</Button>

<Button variant="destructive" onClick={handleDelete}>
  Delete
</Button>
```

### Input Component

```tsx
import Input from '@/components/common/Input'
import { Search, Mail } from 'lucide-react'

<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  error={errors.email?.message}
  helperText="We'll never share your email"
  leftIcon={<Mail className="w-4 h-4" />}
  {...register('email')}
/>
```

### Card Component

```tsx
import Card, { CardContent, CardTitle, CardDescription, CardFooter } from '@/components/common/Card'

// Basic card
<Card>
  <CardContent>Content here</CardContent>
</Card>

// Interactive card with hover effect
<Card hover>
  <CardContent>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>

// Card with custom padding
<Card padding="lg">...</Card>
```

### Badge Component

```tsx
import Badge from '@/components/common/Badge'

// Variants: default, primary, secondary, success, warning, destructive, outline

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Rejected</Badge>
```

### Alert Component

```tsx
import Alert from '@/components/common/Alert'

// Variants: success, error, warning, info

<Alert variant="warning" title="Attention Required">
  Your account is pending approval.
</Alert>

<Alert variant="success" onClose={() => setShowAlert(false)}>
  Changes saved successfully!
</Alert>
```

### PageContainer Layout

```tsx
import { PageContainer } from '@/components/layout'
import Button from '@/components/common/Button'

<PageContainer
  title="Dashboard"
  description="Overview of your activity"
  actions={
    <Button leftIcon={<Plus className="w-4 h-4" />}>
      New Item
    </Button>
  }
>
  {/* Page content */}
</PageContainer>
```

## Common UI Patterns

### Stat Card Pattern

```tsx
<Card hover>
  <CardContent>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <Briefcase className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Total Jobs</p>
        <p className="text-2xl font-bold text-gray-900">42</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### List Item Card Pattern

```tsx
<Card hover className="group">
  <CardContent>
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">John Doe</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              San Francisco
            </span>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
        View
      </Button>
    </div>
  </CardContent>
</Card>
```

### Empty State Pattern

```tsx
<Card>
  <div className="text-center py-12">
    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <FileText className="w-6 h-6 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">No items found</h3>
    <p className="text-gray-500">Try adjusting your search criteria.</p>
  </div>
</Card>
```

### Filter Tabs Pattern

```tsx
const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all')

<div className="mb-6 flex gap-2 flex-wrap">
  {(['all', 'active', 'pending'] as const).map((status) => (
    <button
      key={status}
      onClick={() => setFilter(status)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        filter === status
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  ))}
</div>
```

## Form Handling

### With React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  email: z.string().email('Invalid email'),
})

type FormData = z.infer<typeof schema>

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    // Handle submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        {...register('title')}
        error={errors.title?.message}
      />
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## API Integration

### Using the API Client

```tsx
import { api } from '@/services/api/client'

// GET request
const data = await api.get<{ items: Item[] }>('/endpoint')

// POST request
const result = await api.post('/endpoint', { field: 'value' })

// PATCH request
await api.patch(`/endpoint/${id}`, { status: 'approved' })
```

### Data Fetching Pattern

```tsx
const [data, setData] = useState<DataType | null>(null)
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await api.get<DataType>('/endpoint')
      setData(result)
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }
  fetchData()
}, [])
```

## Authentication Context

```tsx
import { useAuthContext } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthContext()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <div>Welcome, {user?.username}</div>
}
```

## Notifications

```tsx
import { useNotification } from '@/contexts/NotificationContext'

function MyComponent() {
  const { success, error, warning, info } = useNotification()

  const handleAction = async () => {
    try {
      await doSomething()
      success('Action completed successfully!')
    } catch (err) {
      error(err instanceof Error ? err.message : 'Action failed')
    }
  }
}
```

## Icon Usage

Always use Lucide React icons:

```tsx
import {
  User, Building2, Briefcase, FileText,
  Search, Plus, ArrowRight, CheckCircle,
  XCircle, Clock, Calendar, MapPin,
  ExternalLink, Loader2, LogOut
} from 'lucide-react'

// Standard sizes
<Icon className="w-4 h-4" />  // Small (in buttons, inline)
<Icon className="w-5 h-5" />  // Medium (in navigation)
<Icon className="w-6 h-6" />  // Large (in cards, stats)
```

## Enums & Types

### User Types
```typescript
enum UserType {
  COMPANY = 'company',
  STUDENT = 'student',
  ADMIN = 'admin',
}
```

### Status Enums
```typescript
enum CompanyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

enum JobStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CLOSED = 'closed',
}

enum ApplicationStatus {
  PENDING = 'pending',    // Awaiting admin review
  REVIEWED = 'reviewed',  // Admin approved, visible to company
  HIRED = 'hired',        // Company hired the applicant
  REJECTED = 'rejected',  // Admin rejected
  WITHDRAWN = 'withdrawn', // Student withdrew
}
```

## Test Credentials

```
Admin:   username: admin    password: password123
Company: username: acme     password: password123
Student: username: john     password: password123
```

## Best Practices

1. **Always use TypeScript** - Define proper types for all data
2. **Use the design system** - Follow established patterns and components
3. **Handle loading states** - Show LoadingSpinner during async operations
4. **Handle empty states** - Provide meaningful empty state messages
5. **Handle errors** - Use notification context for user feedback
6. **Use Lucide icons** - Consistent icon library throughout
7. **Follow naming conventions** - PascalCase for components, camelCase for functions
8. **Keep components focused** - Single responsibility principle
