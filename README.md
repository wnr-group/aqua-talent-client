# Aqua Talent Client

A modern job marketplace platform connecting students with companies, featuring admin moderation workflows.

## Overview

Aqua Talent is a full-featured job marketplace with three distinct portals:

| Portal | Purpose |
|--------|---------|
| **Student Portal** | Browse jobs, submit applications (2 limit), track application status |
| **Company Portal** | Post job listings, review approved applicants, hire candidates |
| **Admin Portal** | Approve companies, moderate job postings, review applications |

## Features

### For Students
- Browse and search job listings
- Filter by location, keywords
- One-click apply with profile link
- Track application status (pending, approved, rejected, hired)
- Withdraw pending applications
- 2 application limit (restored when withdrawn)

### For Companies
- Register company account (requires admin approval)
- Create job postings (requires admin approval)
- View admin-approved applications only
- Review applicant profiles
- Mark applicants as hired

### For Admins
- Dashboard with pending items overview
- Approve/reject company registrations
- Approve/reject job postings
- Approve/reject student applications
- Rejection requires reason (sent to user)

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router 7** - Navigation
- **React Hook Form + Zod** - Form handling & validation
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **MSW 2** - Mock Service Worker for API mocking

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aqua-talent-client

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
npm run lint
```

## Backend Configuration

The app supports two modes: **Mock Server** (default) and **Real Backend**.

### Mode Selection

| Environment Variable | Backend Mode |
|---------------------|--------------|
| `VITE_API_URL` not set | Mock Server (MSW) - simulates API in browser |
| `VITE_API_URL` set | Real Backend - connects to actual server |

### Using Mock Server (Default)

By default, the app uses **Mock Service Worker (MSW)** to simulate a backend API. No actual backend server is required.

**How It Works:**
1. MSW intercepts all API requests made to `http://localhost:3001/api/*`
2. Mock handlers in `src/mocks/handlers.ts` process these requests
3. Mock data in `src/mocks/data.ts` provides the initial dataset
4. Data persists in memory during the session (resets on page refresh)

### Using Real Backend

To connect to a real backend server:

**1. Set the API URL environment variable:**

For local development, edit `.env.development`:
```bash
VITE_API_URL=http://localhost:3001/api
```

For production, edit `.env.production`:
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

**2. Restart the development server:**
```bash
npm run dev
```

You'll see in the console:
```
[API] Using real backend: http://localhost:3001/api
```

**3. Implement the API endpoints** (see API Endpoints section below)

### Switching Back to Mock Server

To switch back to mock mode, simply remove or comment out `VITE_API_URL` from your `.env` file:

```bash
# VITE_API_URL=http://localhost:3001/api  # Commented out = use mock server
```

### Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `password123` |
| Company | `acme` | `password123` |
| Student | `john` | `password123` |

### API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user |
| POST | `/auth/register/company` | Register company |
| POST | `/auth/register/student` | Register student |

#### Company Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/company/dashboard` | Get dashboard stats |
| GET | `/company/jobs` | List company jobs |
| POST | `/company/jobs` | Create job posting |
| GET | `/company/jobs/:id` | Get job details |
| PATCH | `/company/jobs/:id` | Update job |
| GET | `/company/applications` | List approved applications |
| PATCH | `/company/applications/:id` | Update application (hire) |

#### Student Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/dashboard` | Get dashboard stats |
| GET | `/student/jobs` | Search jobs |
| GET | `/student/jobs/:id` | Get job details |
| POST | `/student/jobs/:id/apply` | Apply to job |
| GET | `/student/applications` | List my applications |
| PATCH | `/student/applications/:id/withdraw` | Withdraw application |
| GET | `/student/profile` | Get profile |
| PATCH | `/student/profile` | Update profile |

#### Admin Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Get dashboard stats |
| GET | `/admin/companies` | List companies |
| PATCH | `/admin/companies/:id` | Approve/reject company |
| GET | `/admin/jobs` | List jobs |
| PATCH | `/admin/jobs/:id` | Approve/reject job |
| GET | `/admin/applications` | List applications |
| PATCH | `/admin/applications/:id` | Approve/reject application |

### Modifying Mock Data

Edit `src/mocks/data.ts` to:
- Add more test users
- Add more job postings
- Modify initial application states
- Change test credentials

### Adding New Endpoints

Edit `src/mocks/handlers.ts`:

```typescript
http.get(`${API_URL}/new-endpoint`, async () => {
  await delay(DELAY_MS)
  return HttpResponse.json({ data: 'response' })
})
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components (Button, Input, Card, etc.)
│   └── layout/          # Layout components (Header, Sidebar, PageContainer)
├── contexts/            # React contexts (Auth, Notifications)
├── features/
│   ├── admin/pages/     # Admin portal pages
│   ├── auth/pages/      # Login, registration pages
│   ├── company/pages/   # Company portal pages
│   └── student/pages/   # Student portal pages
├── mocks/
│   ├── browser.ts       # MSW browser setup
│   ├── data.ts          # Mock data & test credentials
│   └── handlers.ts      # API endpoint handlers
├── services/api/        # API client
├── types/               # TypeScript types, enums, schemas
├── App.tsx              # Routes configuration
├── main.tsx             # App entry point
└── index.css            # Design system CSS variables
```

## Application Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APPLICATION FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  COMPANY                    ADMIN                    STUDENT        │
│  ───────                    ─────                    ───────        │
│                                                                     │
│  Register ──────────────► Review ──────────────► (Approved)         │
│  (Pending)                Company                                   │
│                                                                     │
│  Post Job ──────────────► Review ──────────────► Browse Jobs        │
│  (Pending)                  Job                  (Approved only)    │
│                                                                     │
│                                                      │              │
│                                                      ▼              │
│                                                   Apply             │
│                                                  (Pending)          │
│                                                      │              │
│                                                      ▼              │
│                          Review ◄────────────── Application         │
│                        Application               Submitted          │
│                             │                                       │
│                             ▼                                       │
│  View ◄──────────────── Approved                                    │
│  Applicants              (Reviewed)                                 │
│      │                                                              │
│      ▼                                                              │
│   Hire ─────────────────────────────────────────► Hired!           │
│                                                  (Blocked from      │
│                                                   more apps)        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Documentation

- **[AGENTS.md](./AGENTS.md)** - Design system, component patterns, and examples for AI agents
- **[CLAUDE.md](./CLAUDE.md)** - Specific instructions for Claude Code

## License

Private - All rights reserved
