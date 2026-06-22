# NEUROVA

NEUROVA is a practice-management platform for mental health professionals. It helps therapists organize patients, schedule appointments, manage session notes, track payments, export records, and keep day-to-day clinical admin in one secure workspace.

Built with Next.js, Clerk, Convex, Google Calendar, EditorJS, Tailwind CSS, and shadcn/ui.

## What It Does

- Patient management with searchable patient lists, profiles, emergency contacts, and soft delete recovery
- Appointment scheduling with Google Calendar integration, Google Meet links, recurring appointments, and attendee invites
- Clinical records with rich-text EditorJS notes, record preview/edit flows, and PDF export
- Session history with payment status tracking
- Therapist profile management, avatar upload, and account deletion flow
- Guided onboarding tours for key workflows
- English and Spanish localization with `next-intl`
- Dark mode, responsive UI, and accessible shadcn/Radix primitives
- Sentry instrumentation for production error monitoring

## Tech Stack

| Area | Technology |
| --- | --- |
| App framework | Next.js App Router |
| UI | React, Tailwind CSS v4, shadcn/ui, Radix UI, Lucide |
| Auth | Clerk |
| Backend/data | Convex |
| Calendar | Google Calendar API via Clerk OAuth |
| Rich text | EditorJS |
| Data tables | TanStack Table |
| Server state | TanStack Query |
| i18n | next-intl |
| Monitoring | Sentry |
| PDF export | jsPDF |

## Project Structure

```txt
app/                    Next.js routes, layouts, API handlers
app/(main)/             Authenticated product routes
app/api/                Calendar, Clerk webhook, account APIs
components/             Reusable UI and feature components
components/modals/      Patient, record, appointment, and payment dialogs
components/ui/          shadcn/Radix UI primitives
convex/                 Convex schema, queries, mutations, auth config
hooks/                  Product hooks for appointments, tutorials, timeouts
i18n/                   Locale configuration
lib/                    Types, utilities, columns, PDF generation, integrations
messages/               English and Spanish translation files
public/                 Logo, favicon, and illustration assets
providers/              App-level React providers
supabase/               Legacy migrations kept for migration/reference context
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Convex project
- A Clerk application
- A Google OAuth connection configured in Clerk if you want calendar features locally

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
CLERK_FRONTEND_API_URL=your-app.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Optional
BYPASS_AUTH=false
LOOPS_API_KEY=
LOOPS_LIST_ID=
SENTRY_AUTH_TOKEN=
```

Notes:

- `BYPASS_AUTH=true` is only for local development and lets you inspect protected pages without signing in.
- Convex auth expects a Clerk JWT template named `convex`.
- Google Calendar access is handled through Clerk OAuth. Configure Google as an OAuth provider in Clerk and enable the calendar scopes needed for reading and writing events.
- See [ENV_SETUP.md](./ENV_SETUP.md) for a more detailed environment guide.

### Start Convex

In one terminal:

```bash
npx convex dev
```

This watches Convex functions and updates deployment configuration.

### Start the App

In another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev      # Start the Next.js dev server with Turbopack
npm run build    # Build the production app
npm run start    # Start the production server
npm run lint     # Run linting
```

## Core Workflows

### Authentication

Users sign in with Clerk, currently through Google OAuth. A Clerk webhook creates or updates the therapist profile in Convex when a user is created or updated.

### Calendar

Appointments are created in a dedicated Google Calendar named `Neurova Appointments`. The calendar ID is cached on the therapist profile in Convex. Appointments can include:

- Patient attendee
- Google Meet conference link
- Email and popup reminders
- Recurrence metadata
- Linked session data

### Patients and Records

Patients belong to therapists and are stored in Convex. Clinical records are stored as EditorJS JSON content, with supporting metadata such as title, description, and date.

### Trash and Recovery

Patients and records support soft deletion. Deleted items are shown in the trash area and can be restored or permanently removed. Old trash is cleaned up by Convex cron logic.

## Internationalization

Translations live in:

```txt
messages/en.json
messages/es.json
```

Use `next-intl` hooks such as `useTranslations` for user-facing strings. Some screens still contain hardcoded English, so new product work should continue moving copy into the message files.

## Design System

Global theme tokens live in:

```txt
app/globals.css
```

The app uses Tailwind v4 CSS variables, shadcn/ui primitives, Lucide icons, dark mode via `next-themes`, and `sonner` for toast feedback.

## Deployment Notes

The app is designed for Vercel deployment. Make sure production has:

- Convex deployment variables
- Clerk production keys and webhook secret
- Clerk Google OAuth configured for the production domain
- Sentry token if source map upload is enabled
- Any optional Loops email marketing credentials

## Repository Notes

- The `supabase/` directory is legacy migration/reference material from an earlier data layer.
- Convex is the active application backend.
- `CLAUDE.md` contains agent/development notes, but some references may be older than the current Clerk + Convex architecture.

## License

Private project. All rights reserved.
