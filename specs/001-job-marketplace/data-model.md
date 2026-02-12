# Data Model: Job Marketplace Platform

**Date**: 2026-02-13
**Branch**: `001-job-marketplace`
**Source**: [spec.md](./spec.md) Key Entities section

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Company   │       │   Student   │       │    Admin    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ username    │       │ username    │       │ username    │
│ password    │       │ password    │       │ password    │
│ name        │       │ name        │       │ name        │
│ industry    │       │ email       │       │ email       │
│ email       │       │ education   │       │ createdAt   │
│ status      │       │ skills      │       └─────────────┘
│ createdAt   │       │ createdAt   │              │
│ approvedAt  │       └─────────────┘              │
│ approvedBy  │────┐         │                     │
└─────────────┘    │         │                     │
       │           │         │                     │
       │ 1:N       │         │ 1:N                 │
       ▼           │         ▼                     │
┌─────────────┐    │   ┌─────────────┐             │
│ JobPosting  │    │   │ Application │◄────────────┘
├─────────────┤    │   ├─────────────┤      reviewedBy
│ id          │    │   │ id          │
│ companyId   │◄───┘   │ studentId   │
│ title       │        │ jobId       │
│ description │◄───────│ status      │
│ requirements│   1:N  │ submittedAt │
│ location    │        │ reviewedAt  │
│ salaryMin   │        │ reviewedBy  │
│ salaryMax   │        │ rejectReason│
│ deadline    │        └─────────────┘
│ status      │
│ createdAt   │
└─────────────┘
```

## Entities

### Company

Represents an employer organization that can post jobs after admin approval.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| username | String | Unique, required, 3-30 chars | Login credential |
| passwordHash | String | Required | Bcrypt-hashed password |
| name | String | Required, 2-100 chars | Company display name |
| industry | String | Required | Industry category |
| email | String | Required, valid email format | For notifications/recovery |
| status | Enum | Required | pending, approved, rejected, inactive |
| createdAt | DateTime | Auto-set | Registration timestamp |
| approvedAt | DateTime | Nullable | When admin approved |
| approvedBy | UUID | FK → Admin, nullable | Admin who approved |

**Validation Rules**:
- Username: alphanumeric + underscore, 3-30 characters
- Password: minimum 8 characters (validated before hashing)
- Email: valid email format (not verified)
- Status transitions: pending → approved/rejected; approved → inactive

**Indexes**:
- Unique: username
- Index: status (for admin queue queries)

---

### Student

Represents a job seeker who can search and apply for jobs.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| username | String | Unique, required, 3-30 chars | Login credential |
| passwordHash | String | Required | Bcrypt-hashed password |
| name | String | Required, 2-100 chars | Full name |
| email | String | Required, valid email format | For notifications/recovery |
| education | String | Optional, max 500 chars | Education history (free text) |
| skills | String | Optional, max 500 chars | Skills list (free text) |
| createdAt | DateTime | Auto-set | Registration timestamp |
| isHired | Boolean | Default false | Whether student has been hired |

**Validation Rules**:
- Username: alphanumeric + underscore, 3-30 characters
- Password: minimum 8 characters
- Application limit: 2 total for Free Tier (computed, not stored)
- Cannot apply if isHired = true

**Indexes**:
- Unique: username

**Computed Fields** (not stored):
- `applicationCount`: COUNT of applications (excluding withdrawn)
- `remainingApplications`: 2 - applicationCount (0 if hired)

---

### Admin

Represents a platform moderator who reviews companies and applications.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| username | String | Unique, required, 3-30 chars | Login credential |
| passwordHash | String | Required | Bcrypt-hashed password |
| name | String | Required, 2-100 chars | Display name |
| email | String | Required, valid email format | For notifications |
| createdAt | DateTime | Auto-set | Account creation timestamp |

**Notes**:
- Admin accounts created by existing admins or system setup (no self-registration)
- First admin seeded during initial deployment

---

### JobPosting

Represents an employment opportunity posted by an approved company.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| companyId | UUID | FK → Company, required | Posting company |
| title | String | Required, 5-100 chars | Job title |
| description | String | Required, 50-5000 chars | Full job description |
| requirements | String | Required, 20-2000 chars | Required qualifications |
| location | String | Required, 2-100 chars | Job location |
| salaryMin | Integer | Optional, >= 0 | Minimum salary (annual) |
| salaryMax | Integer | Optional, >= salaryMin | Maximum salary (annual) |
| deadline | DateTime | Required, future date | Application deadline |
| status | Enum | Required | pending, active, rejected, expired, filled, inactive |
| createdAt | DateTime | Auto-set | Posting creation timestamp |
| approvedAt | DateTime | Nullable | When admin approved |
| approvedBy | UUID | FK → Admin, nullable | Admin who approved |
| rejectReason | String | Nullable | Reason if rejected |

**Validation Rules**:
- Deadline must be in the future when creating
- salaryMax >= salaryMin when both provided
- Only approved companies can create postings
- Jobs start as 'pending' until admin approves
- Status transitions:
  - pending → active (admin approval)
  - pending → rejected (admin rejection)
  - active → expired (automatic when deadline passes)
  - active → filled (manual by company)
  - active → inactive (manual by company)

**Indexes**:
- Index: companyId
- Index: status (for student search)
- Index: deadline (for expiration job)
- Composite: (status, deadline) for active job queries

---

### Application

Represents a student's one-click application to a job posting.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| studentId | UUID | FK → Student, required | Applying student |
| jobId | UUID | FK → JobPosting, required | Target job |
| status | Enum | Required | pending, approved, rejected, withdrawn, hired |
| submittedAt | DateTime | Auto-set | Application submission timestamp |
| reviewedAt | DateTime | Nullable | When admin reviewed |
| reviewedBy | UUID | FK → Admin, nullable | Admin who reviewed |
| rejectReason | String | Required if rejected, max 500 chars | Rejection explanation |

**Validation Rules**:
- Unique constraint on (studentId, jobId) - no duplicate applications
- Can only apply to active jobs (status = 'active', deadline not passed)
- Student must have remaining application count > 0
- Status transitions:
  - pending → approved/rejected (by admin)
  - pending → withdrawn (by student, restores count)
  - approved → hired (by company, sets student.isHired = true)
  - rejected/withdrawn/hired are terminal states

**Indexes**:
- Unique: (studentId, jobId)
- Index: studentId (for student's applications list)
- Index: jobId (for job's applicants list)
- Index: status (for admin queue)
- Composite: (studentId, submittedAt) for monthly count calculation

---

## Prisma Schema

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite" for dev
  url      = env("DATABASE_URL")
}

enum CompanyStatus {
  pending
  approved
  rejected
  inactive
}

enum JobStatus {
  pending
  active
  rejected
  expired
  filled
  inactive
}

enum ApplicationStatus {
  pending
  approved
  rejected
  withdrawn
  hired
}

model Company {
  id           String        @id @default(uuid())
  username     String        @unique
  passwordHash String
  name         String
  industry     String
  email        String
  status       CompanyStatus @default(pending)
  createdAt    DateTime      @default(now())
  approvedAt   DateTime?
  approvedBy   String?
  approver     Admin?        @relation(fields: [approvedBy], references: [id])
  jobs         JobPosting[]
}

model Student {
  id           String        @id @default(uuid())
  username     String        @unique
  passwordHash String
  name         String
  email        String
  education    String?
  skills       String?
  isHired      Boolean       @default(false)
  createdAt    DateTime      @default(now())
  applications Application[]
}

model Admin {
  id                    String        @id @default(uuid())
  username              String        @unique
  passwordHash          String
  name                  String
  email                 String
  createdAt             DateTime      @default(now())
  approvedCompanies     Company[]
  approvedJobs          JobPosting[]  @relation("JobApprover")
  reviewedApplications  Application[]
}

model JobPosting {
  id           String      @id @default(uuid())
  companyId    String
  company      Company     @relation(fields: [companyId], references: [id])
  title        String
  description  String
  requirements String
  location     String
  salaryMin    Int?
  salaryMax    Int?
  deadline     DateTime
  status       JobStatus   @default(pending)
  createdAt    DateTime    @default(now())
  approvedAt   DateTime?
  approvedBy   String?
  approver     Admin?      @relation("JobApprover", fields: [approvedBy], references: [id])
  rejectReason String?
  applications Application[]

  @@index([companyId])
  @@index([status])
  @@index([deadline])
}

model Application {
  id           String            @id @default(uuid())
  studentId    String
  student      Student           @relation(fields: [studentId], references: [id])
  jobId        String
  job          JobPosting        @relation(fields: [jobId], references: [id])
  status       ApplicationStatus @default(pending)
  submittedAt  DateTime          @default(now())
  reviewedAt   DateTime?
  reviewedBy   String?
  reviewer     Admin?            @relation(fields: [reviewedBy], references: [id])
  rejectReason String?

  @@unique([studentId, jobId])
  @@index([studentId])
  @@index([jobId])
  @@index([status])
}
```

---

## State Transitions

### Company Status
```
[Register] → pending
                ├── [Admin Approve] → approved → [Deactivate] → inactive
                └── [Admin Reject] → rejected
```

### Job Posting Status
```
[Create] → pending
             ├── [Admin Approve] → active
             │                       ├── [Deadline Pass] → expired
             │                       ├── [Company Mark Filled] → filled
             │                       └── [Company Deactivate] → inactive
             └── [Admin Reject] → rejected
```

### Application Status
```
[Student Apply] → pending
                    ├── [Admin Approve] → approved
                    │                       └── [Company Mark Hired] → hired (sets student.isHired=true)
                    ├── [Admin Reject] → rejected (terminal)
                    └── [Student Withdraw] → withdrawn (restores count)
```
