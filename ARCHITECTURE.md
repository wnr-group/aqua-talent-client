# AquaTalentz Architecture Documentation

## System Overview

AquaTalentz is a job marketplace platform connecting students with companies, featuring admin moderation workflows. The system consists of three main components:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AQUATALENTZ ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND (Vercel)                           │   │
│  │                                                                     │   │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │   │
│  │   │   Student   │   │   Company   │   │    Admin    │              │   │
│  │   │   Portal    │   │   Portal    │   │   Portal    │              │   │
│  │   │             │   │             │   │             │              │   │
│  │   │ aquatalentz │   │ aquatalentz │   │ aquatalentz │              │   │
│  │   │  .vercel    │   │  -company   │   │   -admin    │              │   │
│  │   │   .app      │   │ .vercel.app │   │ .vercel.app │              │   │
│  │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘              │   │
│  │          │                 │                 │                     │   │
│  └──────────┼─────────────────┼─────────────────┼─────────────────────┘   │
│             │                 │                 │                         │
│             └─────────────────┼─────────────────┘                         │
│                               │                                           │
│                               ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         BACKEND (Heroku)                            │   │
│  │                                                                     │   │
│  │                    Node.js / Express API Server                     │   │
│  │                                                                     │   │
│  └─────────────────────────────────┬───────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       DATABASE (MongoDB Atlas)                      │   │
│  │                                                                     │   │
│  │                         MongoDB Cluster                             │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Details

### Frontend - Vercel

| Component | Details |
|-----------|---------|
| Platform | Vercel |
| Framework | React 18 + TypeScript + Vite |
| Repository | GitHub (auto-deploy on push) |

#### Subdomain Architecture

The frontend uses a multi-project deployment strategy on Vercel to handle different portals:

| Portal | Vercel Project | URL |
|--------|---------------|-----|
| Student/Public | `aquatalentz` | `aquatalentz.vercel.app` |
| Company | `aquatalentz-company` | `aquatalentz-company.vercel.app` |
| Admin | `aquatalentz-admin` | `aquatalentz-admin.vercel.app` |

**Environment Variables by Project:**

**Student Portal (`aquatalentz`):**
```env
VITE_API_URL=https://your-backend.herokuapp.com/api
VITE_COMPANY_URL=https://aquatalentz-company.vercel.app
VITE_ADMIN_URL=https://aquatalentz-admin.vercel.app
```

**Company Portal (`aquatalentz-company`):**
```env
VITE_API_URL=https://your-backend.herokuapp.com/api
VITE_PORTAL_TYPE=company
VITE_PUBLIC_URL=https://aquatalentz.vercel.app
VITE_ADMIN_URL=https://aquatalentz-admin.vercel.app
```

**Admin Portal (`aquatalentz-admin`):**
```env
VITE_API_URL=https://your-backend.herokuapp.com/api
VITE_PORTAL_TYPE=admin
VITE_PUBLIC_URL=https://aquatalentz.vercel.app
VITE_COMPANY_URL=https://aquatalentz-company.vercel.app
```

#### Custom Domain Setup (Future)

When ready for custom domain, configure DNS CNAME records:

```
Type   Name      Value
CNAME  @         cname.vercel-dns.com
CNAME  company   cname.vercel-dns.com
CNAME  admin     cname.vercel-dns.com
```

Refer to `AGENTS.md` for detailed subdomain configuration.

---

### Backend - Heroku

| Component | Details |
|-----------|---------|
| Platform | Heroku |
| Account | wnradvisory Email |
| Runtime | Node.js |
| Framework | Express.js |

#### Team Access

New team members can be added to Heroku anytime:
1. Log in to Heroku Dashboard
2. Go to the app → Access
3. Add collaborator by email

#### Environment Variables (Heroku)

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

---

### Database - MongoDB Atlas

| Component | Details |
|-----------|---------|
| Platform | MongoDB Atlas |
| Account | wnradvisory Email (Google Sign-In) |
| Type | Cloud-hosted MongoDB cluster |

#### Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in with Google using wnradvisory email
3. Select the cluster

#### Collections

| Collection | Description |
|------------|-------------|
| `users` | All user accounts (students, companies, admins) |
| `students` | Student profile information |
| `companies` | Company profile information |
| `jobpostings` | Job listings |
| `applications` | Student job applications |

---

## Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Student    │     │   Company    │     │    Admin     │
│   Portal     │     │   Portal     │     │   Portal     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  Login Request     │  Login Request     │  Login Request
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │  Backend API   │
                   │  /auth/login   │
                   └───────┬────────┘
                           │
                           ▼
                   ┌────────────────┐
                   │  JWT Token     │
                   │  Generated     │
                   └───────┬────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Token stored in       │
              │  localStorage          │
              │  (or passed via URL    │
              │  for cross-portal)     │
              └────────────────────────┘
```

### Cross-Portal Login

When a company/admin logs in from the student portal:
1. Credentials validated against backend
2. JWT token generated
3. User redirected to company/admin portal with token in URL
4. Target portal extracts token and authenticates automatically

---

## Deployment Guide

### Frontend Deployment (Vercel)

1. **Initial Setup:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login
   ```

2. **Deploy Student Portal:**
   ```bash
   vercel --prod
   ```

3. **Create Company/Admin Projects:**
   - Import same GitHub repo in Vercel dashboard
   - Set project name (e.g., `aquatalentz-company`)
   - Configure environment variables
   - Deploy

4. **Auto-deployment:**
   - Push to `main` branch triggers automatic deployment

### Backend Deployment (Heroku)

1. **Initial Setup:**
   ```bash
   # Install Heroku CLI
   brew install heroku/brew/heroku

   # Login
   heroku login
   ```

2. **Deploy:**
   ```bash
   git push heroku main
   ```

3. **View Logs:**
   ```bash
   heroku logs --tail
   ```

---

## Local Development

### Prerequisites
- Node.js 20.x
- Docker (optional, for containerized development)

### Quick Start

**Option 1: Direct Node.js**
```bash
npm install
npm run dev
```

**Option 2: Docker (with subdomain support)**
```bash
# Setup local domains (one-time)
sudo ./setup-hosts.sh

# Start dev server
docker-compose up
```

**Local URLs:**
- Student: http://aquatalent.local
- Company: http://company.aquatalent.local
- Admin: http://admin.aquatalent.local

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/register/student` | Register student |
| POST | `/api/auth/register/company` | Register company |

### Student Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/jobs` | List available jobs |
| POST | `/api/student/jobs/:id/apply` | Apply to job |
| GET | `/api/student/applications` | My applications |

### Company Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/company/jobs` | List company jobs |
| POST | `/api/company/jobs` | Create job |
| GET | `/api/company/applications` | View applications |
| PATCH | `/api/company/applications/:id` | Hire/reject |

### Admin Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/companies` | List companies |
| PATCH | `/api/admin/companies/:id` | Approve/reject |
| GET | `/api/admin/jobs` | List all jobs |
| PATCH | `/api/admin/jobs/:id` | Approve/reject |
| GET | `/api/admin/applications` | List applications |
| PATCH | `/api/admin/applications/:id` | Approve/reject |

---

## Team Access Summary

| Service | Account | Access Method |
|---------|---------|---------------|
| Heroku (Backend) | wnradvisory | Email login, add collaborators via dashboard |
| MongoDB Atlas | wnradvisory | Google Sign-In |
| Vercel (Frontend) | - | GitHub integration |
| GitHub | - | Repository access |

---

## Troubleshooting

### Frontend Issues

**Wrong redirect URL after login:**
- Ensure `VITE_COMPANY_URL` and `VITE_ADMIN_URL` are set in Vercel
- Redeploy after changing environment variables

**Portal not detected correctly:**
- Check `VITE_PORTAL_TYPE` is set for company/admin projects

### Backend Issues

**Database connection failed:**
- Verify `MONGODB_URI` in Heroku config vars
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for Heroku)

**Authentication issues:**
- Verify `JWT_SECRET` is set
- Check token expiration settings

---

## Security Considerations

1. **Environment Variables:** Never commit secrets to git
2. **JWT Tokens:** Passed via URL only for cross-portal redirects, cleaned immediately
3. **Database:** IP whitelist configured, authentication required
4. **HTTPS:** Enforced on all production URLs

---

## Contact

For access requests or technical issues, contact the wnradvisory team.
