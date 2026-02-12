# Feature Specification: Job Marketplace Platform

**Feature Branch**: `001-job-marketplace`
**Created**: 2026-02-13
**Status**: Draft
**Input**: Job marketplace enabling companies to post jobs, students to apply with limits, and admins to moderate applications

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Company Registration & Job Posting (Priority: P1)

A company representative visits the platform to create a company account and post job openings for students. They provide company details during registration, then create job listings with position details, requirements, and application deadlines.

**Why this priority**: Without companies and job postings, the marketplace has no value. This is the foundational supply side of the platform.

**Independent Test**: Can be fully tested by registering a company account and creating a job posting. Delivers value by establishing the job inventory.

**Acceptance Scenarios**:

1. **Given** a visitor on the company portal, **When** they complete the registration form with username, password, company name, industry, and email, **Then** a company account is created in "pending approval" status and they receive a confirmation email indicating admin review is required.

2. **Given** a pending company account, **When** an admin approves the registration, **Then** the company receives a notification and can now create job postings.

3. **Given** an approved company user, **When** they fill out a job posting form with title, description, requirements, location, salary range, and deadline, **Then** the job is saved and visible in their job listings dashboard.

4. **Given** a company with existing job postings, **When** they view their dashboard, **Then** they see all their jobs with status indicators (active, expired, filled).

5. **Given** a company user viewing a job posting, **When** they edit the posting details, **Then** the changes are saved and reflected immediately.

---

### User Story 2 - Student Job Search & Application (Priority: P2)

A student visits the platform to find and apply for relevant job opportunities. They can browse available jobs, filter by criteria, view job details, and submit applications within their allowed application limit.

**Why this priority**: Students are the demand side of the marketplace. Once jobs exist, students need to discover and apply for them.

**Independent Test**: Can be fully tested by creating a student account, searching for jobs, and submitting an application. Delivers value by enabling the core matching workflow.

**Acceptance Scenarios**:

1. **Given** a visitor on the student portal, **When** they complete registration with username, password, name, email, and basic profile information, **Then** a student account is created and they can access the job search.

2. **Given** a logged-in student, **When** they browse the job listings, **Then** they see all active, non-expired job postings with key details (title, company, location, deadline).

3. **Given** a logged-in student, **When** they filter jobs by location, industry, or keywords, **Then** the results update to show only matching jobs.

4. **Given** a student viewing a job posting, **When** they click apply and confirm, **Then** their profile is linked to the job as an application (one-click apply) and their remaining application count decreases by one.

5. **Given** a student who has reached their application limit, **When** they attempt to apply for another job, **Then** they see a message indicating they have reached their limit and when it resets.

6. **Given** a student with submitted applications, **When** they view their applications dashboard, **Then** they see all their applications with current status (pending review, approved, rejected).

7. **Given** a student with a pending application, **When** they withdraw the application, **Then** the application is removed and their application count is restored by one.

---

### User Story 3 - Admin Application Moderation (Priority: P3)

An administrator reviews submitted applications before they become visible to companies. They can approve applications that meet quality standards or reject inappropriate submissions with feedback.

**Why this priority**: The moderation layer is essential for platform quality and trust, but requires the application flow to exist first.

**Independent Test**: Can be fully tested by logging in as admin and processing pending applications. Delivers value by ensuring only quality applications reach companies.

**Acceptance Scenarios**:

1. **Given** an admin user, **When** they log into the admin portal, **Then** they see a dashboard with pending applications count and quick access to the review queue.

2. **Given** an admin viewing the review queue, **When** they select an application, **Then** they see the full application details including student profile and the job they applied for.

3. **Given** an admin reviewing an application, **When** they approve it, **Then** the application status changes to approved and it becomes visible to the respective company.

4. **Given** an admin reviewing an application, **When** they reject it with a reason, **Then** the application status changes to rejected and the student is notified with the reason.

5. **Given** an approved application, **When** the company views their applicants, **Then** they see the approved application with student details and can proceed with their hiring process.

---

### User Story 4 - Multi-Portal User Experience (Priority: P4)

Each user type (company, student, admin) accesses the platform through a dedicated portal with an interface tailored to their needs and workflows.

**Why this priority**: While important for user experience and scalability, the core functionality can work with a single interface initially.

**Independent Test**: Can be tested by accessing each portal URL and verifying the appropriate interface loads with role-specific features.

**Acceptance Scenarios**:

1. **Given** a company user, **When** they access the company portal, **Then** they see a company-focused interface with job posting and applicant management features.

2. **Given** a student user, **When** they access the student portal, **Then** they see a student-focused interface with job search, applications, and profile management.

3. **Given** an admin user, **When** they access the admin portal, **Then** they see an admin-focused interface with moderation queue and platform management.

---

### Edge Cases

- What happens when a job posting deadline passes while a student is mid-application?
  - Application is rejected with a message that the deadline has passed.
- How does the system handle a company trying to view an application that was rejected by admin?
  - Rejected applications are never visible to companies.
- What happens when a student applies to the same job twice?
  - System prevents duplicate applications and shows a message that they already applied.
- How does the system handle a company account being deactivated with active job postings?
  - Active postings are marked as inactive and hidden from students.
- What happens when an admin is reviewing an application that was withdrawn by the student?
  - Application is removed from the review queue with a notification.

## Requirements *(mandatory)*

### Functional Requirements

**Company Portal**
- **FR-001**: System MUST allow companies to register with username, password, company name, industry, and email (for notifications/recovery).
- **FR-001a**: System MUST place newly registered companies in "pending approval" status until admin approves them.
- **FR-002**: System MUST allow only admin-approved companies to create job postings with title, description, requirements, location, salary range (optional), and application deadline.
- **FR-002a**: System MUST place newly created job postings in "pending approval" status until admin approves them.
- **FR-003**: System MUST allow companies to edit or deactivate their own job postings.
- **FR-004**: System MUST display only admin-approved applications to companies.
- **FR-005**: System MUST allow companies to view applicant profiles and application details for approved applications.
- **FR-005a**: System MUST allow companies to update an application status to 'Hired', which restricts the student from further applications.

**Student Portal**
- **FR-006**: System MUST allow students to register with username, password, name, email (for notifications/recovery), and basic profile information (education, skills).
- **FR-007**: System MUST allow students to search and filter active job postings by location, industry, and keywords.
- **FR-008**: System MUST enforce application limit of 2 total applications for Free Tier students.
- **FR-008a**: System MUST notify students when they reach their application limit.
- **FR-009**: System MUST allow students to submit applications to jobs within their application limit.
- **FR-009a**: System MUST disable the Apply button for students who have been marked as 'Hired'.
- **FR-010**: System MUST prevent duplicate applications from the same student to the same job.
- **FR-011**: System MUST allow students to view status of their submitted applications.
- **FR-012**: System MUST allow students to withdraw pending (not yet reviewed) applications and restore their application count upon withdrawal.

**Admin Portal**
- **FR-013**: System MUST provide admins access to all pending applications in a review queue.
- **FR-013a**: System MUST provide admins access to all pending company registrations in a review queue.
- **FR-014**: System MUST allow admins to approve applications, making them visible to respective companies.
- **FR-014a**: System MUST allow admins to approve company registrations, enabling them to post jobs.
- **FR-014b**: System MUST allow admins to approve job postings, making them visible to students.
- **FR-015**: System MUST allow admins to reject applications with a required reason.
- **FR-015b**: System MUST allow admins to reject job postings with a required reason.
- **FR-015a**: System MUST allow admins to reject company registrations with a required reason.
- **FR-016**: System MUST notify students when their application is rejected, including the rejection reason.
- **FR-016a**: System MUST notify companies when their registration is approved or rejected.
- **FR-017**: System MUST provide admins with a dashboard showing pending, approved, and rejected counts for applications, company registrations, and job postings.
- **FR-017a**: System MUST provide admins access to all pending job postings in a review queue.

**General**
- **FR-018**: System MUST automatically mark job postings as expired when their deadline passes.
- **FR-019**: System MUST prevent applications to expired or inactive job postings.
- **FR-020**: System MUST support password reset functionality for all user types.
- **FR-021**: System MUST maintain separate authentication sessions for each portal.

### Key Entities

- **Company**: Represents an employer organization. Key attributes: username (unique, for login), name, industry, email (for notifications), registration date, account status (pending/approved/rejected/inactive).

- **Student**: Represents a job seeker. Key attributes: username (unique, for login), name, email (for notifications), education history, skills, registration date, remaining applications (out of 2), hired status (boolean).

- **Admin**: Represents a platform moderator. Key attributes: name, email, role permissions.

- **Job Posting**: Represents an employment opportunity. Key attributes: title, description, requirements, location, salary range, deadline, status (pending/active/rejected/expired/filled/inactive), posting company. Jobs start as 'pending' and require admin approval to become 'active'.

- **Application**: Represents a student's interest in a job. Key attributes: student (reference to profile), job posting, submission date, status (pending/approved/rejected/hired), admin reviewer, review date, rejection reason (if applicable). Note: Applications contain only a reference to the student profile; no additional documents or cover letters are submitted per application. When status is 'hired', the student is blocked from further applications.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Companies can complete registration and post their first job in under 10 minutes.
- **SC-002**: Students can search, filter, and apply to a job in under 5 minutes.
- **SC-003**: Admins can review and process an application (approve or reject) in under 2 minutes.
- **SC-004**: 95% of job searches return relevant results within 2 seconds.
- **SC-005**: Students can view their application status updates within 1 minute of admin action.
- **SC-006**: System supports at least 100 concurrent users across all portals without degradation.
- **SC-007**: 90% of first-time users successfully complete their primary task (post job / apply to job) without assistance.
- **SC-008**: Application approval queue maintains zero backlog older than 48 hours during normal operation.

## Clarifications

### Session 2026-02-13

- Q: Must companies be verified before posting jobs? → A: Admin must approve company accounts before they can post jobs.
- Q: What does a student submit when applying? → A: Application is just a link to student profile (one-click apply).
- Q: What identifier is used for registration/login? → A: Username for login, email still collected for notifications/recovery.
- Q: Is email verification required? → A: No email verification required; notifications sent to unverified emails.
- Q: Does withdrawing an application restore the monthly count? → A: Yes, withdrawing a pending application restores the application count.
- Q: What is the application limit for Free Tier students? → A: 2 applications total (not monthly).
- Q: Can students be marked as hired? → A: Yes, companies can mark approved applications as 'Hired', blocking the student from further applications.
- Q: Do job postings require admin approval? → A: Yes, jobs start as 'pending' and require admin approval to become visible to students.

## Assumptions

- **Application Limit**: Free Tier students are limited to 2 applications total. Limit does not reset monthly.
- **Portal Structure**: Each user type accesses a dedicated portal via distinct URLs (e.g., company.aquatalent.com, student.aquatalent.com, admin.aquatalent.com).
- **Authentication**: Username/password authentication with session-based login. Email is collected separately for notifications and password recovery but is not verified; users are responsible for providing a valid email. Social login may be added in future iterations.
- **Notifications**: Email notifications are sent for key events (registration confirmation, application status changes, job posting confirmations).
- **Data Retention**: Application data is retained for 2 years. Expired job postings remain viewable to companies for historical reference.
- **Admin Creation**: Admin accounts are created by existing admins or system administrators, not through self-registration.
