# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEUROVA is a comprehensive Next.js 15 application for mental health professionals built with:
- **Next.js 15** with App Router and Turbopack for development
- **Supabase** for authentication and database
- **shadcn/ui** components with Tailwind CSS
- **TanStack Query** for data fetching and caching
- **EditorJS** for rich text medical notes
- **TypeScript** with strict configuration

## Essential Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build            # Build production application
npm run start            # Start production server
npm run lint             # Run ESLint with Next.js rules
```

## Architecture Overview

### Directory Structure
- `app/` - Next.js 15 App Router structure
  - `auth/` - Authentication pages (login, signup, callbacks)
  - `(main)/` - Main application routes (patients management)
  - `layout.tsx` - Root layout with theme provider and TanStack Query setup
- `components/` - Reusable UI components
  - `ui/` - shadcn/ui components (Button, Dialog, DataTable, etc.)
  - `PatientDetail/` - Patient-specific components
  - `modals/` - Modal components for various actions
- `lib/` - Utility functions and data access
  - `supabase/` - Database operations and client configuration
  - `types.ts` - TypeScript type definitions
  - `columns.tsx` - Table column definitions for data display
- `providers/` - React context providers
- `supabase/` - Supabase configuration and migrations

### Key Application Features
- **Patient Management**: Full CRUD operations for patient records
- **Medical History**: Rich text notes using EditorJS with structured medical data
- **Authentication**: Supabase Auth with cookie-based session management
- **Data Tables**: TanStack Table integration for patient listings
- **Theme Support**: Dark/light mode with next-themes

### Data Model
Core entities defined in `lib/types.ts`:
- `Patient` - Complete patient profile with personal info, emergency contacts, and medical history
- `MedicalHistoryNote` - Rich text notes with EditorJS content stored as JSONB
- `EmergencyContact` and `MedicalHistory` - Structured data types for patient records

### Supabase Integration
- Authentication handled via middleware (`middleware.ts`)
- Database operations centralized in `lib/supabase/` with individual service functions
- Cookie-based session management for SSR compatibility
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Component Architecture
- **UI Components**: Built on shadcn/ui with consistent styling
- **Data Components**: Use TanStack Query for server state management
- **Theme System**: Integrated with Tailwind CSS and next-themes
- **Form Handling**: Custom form components for patient data entry

### Development Patterns
- TypeScript path aliases configured (`@/` maps to project root)
- Strict TypeScript configuration with ES2017 target
- shadcn/ui "new-york" style with Lucide icons
- CSS custom properties for theme variables
- Server and client components clearly separated

## Testing and Quality

The project uses ESLint with Next.js and TypeScript rules. Always run `npm run lint` before committing changes to ensure code quality.