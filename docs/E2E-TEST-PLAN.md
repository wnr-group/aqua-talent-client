# Aqua Talent — End-to-End Test Plan

## Portals

### Production (Vercel)

| Portal | URL |
|--------|-----|
| Landing / Student | https://aqua-talent-client.vercel.app/ |
| Company | https://aquatalentz-company.vercel.app/ |
| Admin | https://aquatalentz-admin.vercel.app/ |

### Local Development (Docker)

| Portal | URL |
|--------|-----|
| Student | http://aquatalent.local |
| Company | http://company.aquatalent.local |
| Admin | http://admin.aquatalent.local |

## Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `password123` |
| Existing Company | `acme` | `password123` |
| Existing Student | `john` | `password123` |

---

## Phase 1 — Company Registration & Approval

### TC-1.1: Company Registration (Happy Path)
**Portal:** Company (`/register`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to http://company.aquatalent.local/register | Registration form loads |
| 2 | Fill: Company Name = "TechNova Labs", Username = "technova", Email = "hr@technova.com", Domain = "technova.com", Password = "Test@1234", Confirm = "Test@1234" | All fields accept input |
| 3 | Click "Register" | Success message: "Registration submitted! Please wait for admin approval." Redirects to login |
| 4 | Try logging in as "technova" | Login should fail or redirect to "pending approval" state |

### TC-1.2: Company Registration (Validation)
| Step | Action | Expected |
|------|--------|----------|
| 1 | Submit with empty fields | Validation errors on all required fields |
| 2 | Enter username < 3 chars ("ab") | "Username must be at least 3 characters" |
| 3 | Enter invalid domain ("notadomain") | Domain validation error |
| 4 | Enter mismatched passwords | "Passwords must match" |
| 5 | Enter password < 8 chars | "Password must be at least 8 characters" |

### TC-1.3: Admin Approves Company
**Portal:** Admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as admin | Admin dashboard loads, shows pending company count |
| 2 | Navigate to Companies | Filter shows "Pending" tab with TechNova Labs |
| 3 | Click "Approve" on TechNova Labs | Status changes to "Approved", success toast |
| 4 | Switch filter to "Approved" | TechNova Labs appears in approved list |

### TC-1.4: Admin Rejects Company
| Step | Action | Expected |
|------|--------|----------|
| 1 | Register another company (e.g., "SpamCorp") | Registration succeeds |
| 2 | In admin, find SpamCorp under Pending | Visible |
| 3 | Click "Reject", enter reason: "Incomplete company details" | Status = Rejected, reason saved |
| 4 | Verify SpamCorp cannot post jobs | SpamCorp login works but job creation is blocked |

---

## Phase 2 — Job Posting & Approval

### TC-2.1: Company Posts a Job (Happy Path)
**Portal:** Company (login as `technova`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as technova at company portal | Dashboard loads |
| 2 | Navigate to Jobs > Create New Job | Job creation form loads |
| 3 | Fill: Title = "Frontend Developer", Description (50+ chars), Requirements (10+ chars), Location = "Mumbai", Type = "Full-time", Salary = "6-10 LPA", Deadline = future date | All fields accept input |
| 4 | Click "Submit for Review" | Success: "Job submitted for review!", redirects to job list |
| 5 | Verify job shows as "Pending" in company's job list | Status badge = Pending |

### TC-2.2: Save Job as Draft
| Step | Action | Expected |
|------|--------|----------|
| 1 | Start creating a job, fill only title | Partial data |
| 2 | Click "Save as Draft" | Job saved with status = Draft |
| 3 | Return to drafts, open the job | All previously entered data preserved |
| 4 | Complete all fields, submit for review | Status changes to Pending |

### TC-2.3: Admin Approves Job
**Portal:** Admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Job Postings | "Frontend Developer" appears under Pending filter |
| 2 | Click to view job details | Full details shown in modal (title, company, description, requirements, location, salary, deadline) |
| 3 | Click "Approve" | Status = Approved, success toast, job now visible to students |

### TC-2.4: Admin Rejects Job
| Step | Action | Expected |
|------|--------|----------|
| 1 | Post another job with vague description | Submitted as Pending |
| 2 | Admin rejects with reason: "Description too vague" | Status = Rejected, reason stored |
| 3 | Company sees rejection reason in their job list | Reason displayed, can edit and resubmit |

---

## Phase 3 — Student Registration & Job Discovery

### TC-3.1: Student Registration (Happy Path)
**Portal:** Student (`/register/student`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to http://aquatalent.local/register/student | Registration form loads |
| 2 | Fill: Full Name = "Priya Sharma", Student ID = "STU2026", Username = "priya", Email = "priya@gmail.com", Password = "Test@1234", Confirm = "Test@1234", DG Shipping = No, Profile Link = "https://linkedin.com/in/priyasharma" (optional) | All fields accept input |
| 3 | Click "Register" | Success, auto-login, redirects to dashboard |
| 4 | Verify dashboard shows: Free Tier, 0/2 applications, 2 remaining | Correct quota display |

### TC-3.2: Student Browses Jobs
| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Browse Jobs | Job list loads with approved jobs only |
| 2 | Verify "Frontend Developer" by TechNova Labs is visible | Job card shows title, company, location, type, salary |
| 3 | Search for "Frontend" | Filtered results show matching jobs |
| 4 | Filter by location "Mumbai" | Only Mumbai jobs shown |
| 5 | Click on job card | Job detail page loads with full description |

### TC-3.3: Student Views Job Detail
| Step | Action | Expected |
|------|--------|----------|
| 1 | Open "Frontend Developer" job | Full details: description, requirements, company info, salary, deadline |
| 2 | Verify "Apply" button is active | Button enabled (quota not exhausted) |
| 3 | Verify company info section | Company name, logo, website visible |

---

## Phase 4 — Student Applies to Job

### TC-4.1: First Application (Happy Path)
**Portal:** Student (logged in as `priya`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | On job detail page, click "Apply" | Application submitted |
| 2 | Success message: "Application submitted! Awaiting admin review." | Toast + redirect to My Applications |
| 3 | Verify My Applications shows: 1 application, status = Pending | Correct status badge |
| 4 | Verify dashboard: 1/2 applications used, 1 remaining | Quota updated |

### TC-4.2: Second Application (Quota Boundary)
| Step | Action | Expected |
|------|--------|----------|
| 1 | Find another approved job | Job visible |
| 2 | Click "Apply" | Application submitted (2/2 used) |
| 3 | Dashboard shows: 2/2 applications, 0 remaining | Quota exhausted |

### TC-4.3: Third Application Blocked (Quota Exhausted)
| Step | Action | Expected |
|------|--------|----------|
| 1 | Find a third approved job | Job visible |
| 2 | Verify job description is **locked/blurred** | Description hidden with lock message |
| 3 | Apply button is disabled | Cannot click |
| 4 | Verify unlock options shown | "Upgrade Plan" / "Buy Job Credits" / "Pay per Job" options visible |

### TC-4.4: Duplicate Application Prevention
| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to a job student already applied to | Job detail loads |
| 2 | Verify "Already Applied" indicator shown | Apply button disabled or shows "Applied" |

---

## Phase 5 — Subscription Upgrade & Payment

### TC-5.1: View Subscription Page
**Portal:** Student

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Subscription page | Current plan (Free Tier) highlighted |
| 2 | Verify plan cards: Free, Pro (INR 499), Pro Yearly (INR 4,999), Lifetime (INR 9,999) | All plans displayed with features |
| 3 | Verify usage stats: 2/2 used, 0 remaining | Correct quota |

### TC-5.2: Upgrade to Pro Plan (Razorpay)
| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Upgrade" on Pro plan | Razorpay checkout modal opens |
| 2 | Complete payment in Razorpay test mode (card: 4111 1111 1111 1111) | Payment processes |
| 3 | On success, redirected to payment success page | "Payment successful!" message |
| 4 | Return to dashboard | Subscription = Pro, applications = Unlimited |
| 5 | Browse jobs | All descriptions unlocked, Apply buttons enabled |

### TC-5.3: Job Credit Addon Purchase
| Step | Action | Expected |
|------|--------|----------|
| 1 | On free tier, navigate to subscription | Job credit addon section visible |
| 2 | Click purchase on an addon | Razorpay modal opens |
| 3 | Complete payment | Extra credits added to quota |
| 4 | Verify updated application limit | Limit increased by addon amount |

### TC-5.4: Pay-Per-Job Unlock
| Step | Action | Expected |
|------|--------|----------|
| 1 | On a locked job (quota exhausted), click "Unlock this job" | Razorpay modal for single job unlock |
| 2 | Complete payment | Job description unlocked, Apply button enabled |
| 3 | Apply to the unlocked job | Application submitted |

---

## Phase 6 — Admin Application Review

### TC-6.1: Admin Reviews Pending Applications
**Portal:** Admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Applications | "Pending Review" tab shows Priya's applications |
| 2 | Click on an application | Full details: student name, profile link, job title, company |
| 3 | Click "View Full Profile" | Student profile modal opens with all details |
| 4 | Click "Approve" | Status = Reviewed, success toast |
| 5 | Application disappears from Pending tab, appears under Approved | Correct tab movement |

### TC-6.2: Admin Rejects Application
| Step | Action | Expected |
|------|--------|----------|
| 1 | Find another pending application | Visible in Pending tab |
| 2 | Click "Reject", enter reason: "Profile incomplete" | Rejection modal opens |
| 3 | Confirm rejection | Status = Rejected, reason saved |
| 4 | Application moves to Rejected tab | Correct status, reason displayed |

### TC-6.3: Admin Re-approves Rejected Application
| Step | Action | Expected |
|------|--------|----------|
| 1 | Find the rejected application | Under Rejected filter |
| 2 | Click "Re-approve" | Status changes back to Reviewed |
| 3 | Application now visible to company | Verified in company portal |

---

## Phase 7 — Company Reviews Applications & Hires

### TC-7.1: Company Sees Approved Applications
**Portal:** Company (login as `technova`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Applications | Only admin-approved (Reviewed) applications visible |
| 2 | Verify Priya's application appears | Student name, profile link, application date shown |
| 3 | Click "View Full Profile" | Student profile modal with skills, education, experience, resume |

### TC-7.2: Company Schedules Interview
| Step | Action | Expected |
|------|--------|----------|
| 1 | On Priya's application, click "Schedule Interview" | Interview scheduling modal opens |
| 2 | Set date, time, location/link, notes | All fields accept input |
| 3 | Click "Schedule" | Status = Interview Scheduled, success toast |
| 4 | Verify interview details shown on application card | Date, notes visible |

### TC-7.3: Company Extends Offer
| Step | Action | Expected |
|------|--------|----------|
| 1 | On Interview Scheduled application, click "Make Offer" | Status = Offer Extended |
| 2 | Verify status badge updates | "Offer Extended" badge shown |

### TC-7.4: Company Hires Student
| Step | Action | Expected |
|------|--------|----------|
| 1 | On Offer Extended application, click "Hire" | Status = Hired (final state) |
| 2 | Verify no more action buttons | Read-only state |
| 3 | **Switch to Student portal** — login as priya | Dashboard shows "Hired" status |
| 4 | Try applying to another job | **Blocked** — "You are already hired" message |

### TC-7.5: Company Rejects Application
| Step | Action | Expected |
|------|--------|----------|
| 1 | Find a different Reviewed application | Visible |
| 2 | Click "Reject", enter reason | Rejection modal, enter reason |
| 3 | Confirm | Status = Rejected, reason displayed |

---

## Phase 8 — Student Withdrawal Flow

### TC-8.1: Student Requests Withdrawal
**Portal:** Student

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to My Applications | List of applications shown |
| 2 | On a Pending/Reviewed application, click "Withdraw" | Confirmation prompt |
| 3 | Confirm withdrawal | Status = Withdrawal Requested |
| 4 | Verify button state | No further actions available, waiting for admin |

### TC-8.2: Admin Approves Withdrawal
**Portal:** Admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Applications > "Withdrawal Requested" tab | Student's withdrawal request visible |
| 2 | Click "Approve Withdrawal" | Status = Withdrawn (final) |
| 3 | **Student portal**: verify application shows "Withdrawn" | Final state, no actions |
| 4 | Verify quota freed (if applicable) | Application slot may be restored |

### TC-8.3: Admin Rejects Withdrawal
| Step | Action | Expected |
|------|--------|----------|
| 1 | On a withdrawal request, click "Reject Withdrawal" | Status reverts to Reviewed |
| 2 | Application back in company's view | Company can continue review |

---

## Phase 9 — Account Lifecycle (M3)

### TC-9.1: Student Delete Account Request
**Portal:** Student

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Profile, scroll to Danger Zone | Red-bordered section with "Delete My Account" button |
| 2 | Click "Delete My Account" | Confirmation modal with warning text |
| 3 | Click "Cancel" | Modal closes, nothing happens |
| 4 | Click "Delete My Account" again, then "Yes, Request Deletion" | Email client opens with pre-filled mailto to support@aquatalentz.com |

### TC-9.2: Company Delete Account Request
**Portal:** Company

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Profile, scroll to Danger Zone | Same pattern as student |
| 2 | Click "Delete My Account" > Confirm | Mailto opens to support@aquatalentz.com |

### TC-9.3: Admin Suspends Student Account
**Portal:** Admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Students > click "View" on a student | Student detail page loads |
| 2 | Verify "Account Status" card shows "Active" badge | Green badge, "Suspend Account" button |
| 3 | Click "Suspend Account" | Confirmation modal: "Are you sure?" |
| 4 | Click "Yes, Suspend" | Badge changes to "Suspended", toast: "Account suspended" |
| 5 | **Student portal**: try logging in as that student | **Login blocked** — "Your account has been suspended. Please contact support@aquatalentz.com." |

### TC-9.4: Admin Reactivates Student Account
| Step | Action | Expected |
|------|--------|----------|
| 1 | On suspended student detail, click "Reactivate Account" | Confirmation modal |
| 2 | Click "Yes, Reactivate" | Badge = Active, toast: "Account reactivated" |
| 3 | Student can log in again | Dashboard loads normally |

### TC-9.5: Admin Suspends Company Account
| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Companies, find a company row | Account badge + Suspend button visible |
| 2 | Click "Suspend" > Confirm | Account suspended |
| 3 | Company cannot log in | Suspension message shown |
| 4 | Reactivate > Company can log in | Normal access restored |

---

## Phase 10 — Zone & Geographic Restrictions

### TC-10.1: Free Tier Zone Restriction
**Portal:** Student (free tier)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Browse jobs | Some jobs show lock icon (zone-restricted) |
| 2 | Click on a zone-locked job | Lock message with zone name shown |
| 3 | Verify unlock options | Zone addon pricing shown |
| 4 | Apply button disabled for locked zone jobs | Cannot apply |

### TC-10.2: Zone Addon Purchase
| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Unlock Zone" on a locked job | Zone selection modal opens |
| 2 | Select zone, proceed to payment | Razorpay modal opens |
| 3 | Complete payment | Zone unlocked, job description visible |
| 4 | Other jobs in same zone also unlocked | Zone access persists |

### TC-10.3: Paid Tier Full Zone Access
| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as a Pro/Lifetime student | Dashboard shows paid plan |
| 2 | Browse jobs | No zone lock icons, all jobs accessible |
| 3 | Filter by any zone | All zones show checkmark, no locks |

---

## Phase 11 — Public Pages (M2)

### TC-11.1: Landing Page & Navigation
| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to http://aquatalent.local | Landing page loads with hero section |
| 2 | Verify footer visible | Brand, Platform links (Home, About, Terms, Security), Contact form |
| 3 | Click "About Us" | /about page loads with hero, mission, 3-column grid |
| 4 | Click "Terms" | /terms page loads with placeholder T&C sections |
| 5 | Click "Security" | /security page loads with technical measures (bcrypt, JWT, Razorpay, S3) |

### TC-11.2: Footer Contact Form
| Step | Action | Expected |
|------|--------|----------|
| 1 | Scroll to footer on any public page | Contact form: Name, Email, Message, Send button |
| 2 | Fill fields and click "Send Message" | Opens mailto with pre-filled content |

### TC-11.3: Footer Visibility Scope
| Step | Action | Expected |
|------|--------|----------|
| 1 | Check footer on landing page | Visible |
| 2 | Check footer on student dashboard | Visible (in PublicRoutes) |
| 3 | Check footer on admin dashboard | **Not visible** (scoped to public routes only) |
| 4 | Check footer on company dashboard | **Not visible** |

---

## Phase 12 — Edge Cases & Negative Tests

### TC-12.1: Hired Student Cannot Apply
| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as a student who has been hired | isHired = true |
| 2 | Navigate to Browse Jobs | Jobs visible |
| 3 | Try to apply to any job | Blocked with "You are already hired" |

### TC-12.2: Unapproved Company Cannot Post Jobs
| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as a pending/rejected company | Dashboard loads |
| 2 | Try to create a job | Blocked or warning shown |

### TC-12.3: Expired Job Deadline
| Step | Action | Expected |
|------|--------|----------|
| 1 | Find a job with past deadline | Status = Closed |
| 2 | Student tries to apply | Apply button disabled, "Deadline passed" |

### TC-12.4: Concurrent Session Test
| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as same student in two tabs | Both sessions active |
| 2 | Apply to a job in tab 1 | Success |
| 3 | Apply to same job in tab 2 | "Already applied" error |

### TC-12.5: Suspended Account Mid-Session
| Step | Action | Expected |
|------|--------|----------|
| 1 | Student is logged in | Active session |
| 2 | Admin suspends the student | isActive = false |
| 3 | Student performs any API action | 401/403 — forced logout |

---

## Status Flow Summary

```
COMPANY REGISTRATION:
  Register → PENDING → (Admin) → APPROVED / REJECTED

JOB POSTING:
  Create → DRAFT → PENDING → (Admin) → APPROVED / REJECTED
  APPROVED → UNPUBLISHED (by company) → REPUBLISHED
  APPROVED → CLOSED (deadline passed)

APPLICATION:
  Student Applies → PENDING
    → (Admin Approves) → REVIEWED
      → (Company) → INTERVIEW_SCHEDULED → OFFER_EXTENDED → HIRED ✓
      → (Company) → REJECTED ✗
    → (Admin Rejects) → REJECTED ✗
    → (Student) → WITHDRAWAL_REQUESTED
      → (Admin Approves) → WITHDRAWN ✗
      → (Admin Rejects) → REVIEWED (restored)

ACCOUNT:
  Active → (Admin Suspend) → Suspended → (Admin Reactivate) → Active
```

---

## Test Data Cleanup

After testing, reset the database:
```bash
cd aqua-talent-service
npm run seed
```

This re-seeds with default test data (admin, acme company, john student).
