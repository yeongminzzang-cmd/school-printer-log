# School Printer Usage Log App

A web-based printer usage tracking system designed for a school environment.
The app allows students to record printer usage with student ID verification, while administrators can monitor usage, manage students, export data, and enforce monthly printing limits.

## Overview

This project was built to solve a real school management problem: tracking how many pages students print each month and preventing excessive usage.

Instead of using paper logs or manually counting records, this app provides a simple digital workflow:

* Students submit printer usage records.
* The system verifies students using a 4-digit birthdate code.
* Monthly usage is automatically calculated.
* Administrators can view logs, analytics, and student status.
* The database blocks submissions that exceed the monthly page limit.

## Key Features

### Student Page

* Student ID input
* 4-digit birthdate verification
* Print page count input
* Purpose selection
* Monthly usage check
* Printer usage submission
* Clear warning UI when the monthly limit is exceeded

### Admin Page

* Admin-only login using Supabase Auth
* Usage log management
* Search by student ID or name
* Date filtering with quick buttons:

  * Today
  * This month
  * All periods
* Summary cards for usage records
* Edit and delete usage records
* CSV export
* Student management dashboard
* Class-based student tabs
* Student search and sorting
* Birthdate verification reset
* Monthly print limit setting
* Analytics dashboard with usage insights

## Tech Stack

* React
* Vite
* JavaScript
* Supabase
* PostgreSQL
* Supabase Auth
* Supabase RPC functions
* Row Level Security
* CSS

## Database Design

The app uses Supabase as the backend.

Main tables:

* `students`
* `print_logs`
* `app_settings`

Important backend logic is handled through PostgreSQL RPC functions instead of exposing direct table access to users.

Key RPC functions:

* `create_print_log_verified`
* `get_monthly_total_verified`
* `get_student_manage_list`
* `reset_student_verify_code`

## Security and Data Protection

This project avoids direct public inserts into the `print_logs` table.
Student submissions are processed through a verified RPC function.

The backend function checks:

* Valid student ID format
* Valid 4-digit verification code
* Whether the student exists
* Whether the birthdate code matches
* Whether the monthly page limit would be exceeded
* Whether the print purpose is valid

The app also separates public SQL files from private student roster data.

Private data such as student names, actual administrator email, and environment variables are excluded from the public repository.

## Monthly Limit Enforcement

Monthly usage limits are enforced at the database level, not only in the frontend.

Example:

If a student has already used 48 pages and the monthly limit is 50 pages, submitting 5 more pages will be blocked by the database.

The frontend then displays a clear warning box showing:

* Monthly limit
* Current usage
* Requested pages
* Remaining available pages

## Project Structure

```txt
printer-log
├─ public
├─ src
│  ├─ components
│  │  └─ admin
│  ├─ pages
│  ├─ utils
│  ├─ App.css
│  └─ main.jsx
├─ sql
│  ├─ 00_README.md
│  ├─ 01_app_settings.sql
│  ├─ 03_admin_functions.sql
│  ├─ 04_user_rpc_functions.sql
│  ├─ 05_security_grants_reference.sql
│  └─ 99_check_queries.sql
├─ .gitignore
├─ package.json
└─ vite.config.js
```

Private files are kept outside the public repository:

```txt
sql_private
.env
.env.local
```

## What I Learned

Through this project, I practiced building a full-stack web application for a real-world school use case.

I learned how to:

* Design a practical user flow for both students and administrators
* Connect a React frontend with Supabase
* Use PostgreSQL functions for secure backend logic
* Apply admin-only access control
* Manage database validation and error handling
* Build reusable React components
* Organize a project for deployment and GitHub portfolio presentation
* Protect sensitive student data in a public repository

## Future Improvements

Possible future improvements include:

* More detailed analytics charts
* Admin activity logs
* Automatic monthly reports
* Improved mobile UI
* Teacher account roles
* Bulk student import through CSV

## Privacy Notice

This repository does not include real student roster data, private environment variables, or actual administrator credentials.
