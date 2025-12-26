# Environment Variables Setup Guide

This document describes all environment variables used in the Neurova application.

## Required Variables

### Convex Configuration
Convex is used for real-time database and backend functions.  
Get these from: https://dashboard.convex.dev

```bash
# Deployment identifier (set automatically by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment-name

# Public Convex URL for client connections
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Clerk Authentication
Clerk handles user authentication and session management.  
Get these from: https://dashboard.clerk.com

```bash
# Public key for client-side Clerk integration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Secret key for server-side Clerk operations
CLERK_SECRET_KEY=sk_test_xxxxx

# JWT issuer domain for Convex authentication
# Format: https://your-app.clerk.accounts.dev
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

# Clerk frontend API URL (without https://)
# Format: your-app.clerk.accounts.dev
CLERK_FRONTEND_API_URL=your-app.clerk.accounts.dev
```

## Optional Variables

### Sentry Error Tracking
Sentry is used for error monitoring and performance tracking.  
Get this from: https://sentry.io

```bash
# Authentication token for uploading source maps during build
# This is stored in .env.sentry-build-plugin (auto-generated)
SENTRY_AUTH_TOKEN=sntrys_xxxxx
```

The Sentry DSN is hardcoded in `sentry.edge.config.ts` and `sentry.server.config.ts`.

### Vercel Deployment
These are automatically set by Vercel during deployment. You don't need to set these manually.

```bash
VERCEL_ENV=development|preview|production
VERCEL_URL=your-deployment.vercel.app
VERCEL_PROJECT_PRODUCTION_URL=your-app.vercel.app
```

## File Structure

- `.env` - Convex and Clerk configuration (committed to repo)
- `.env.local` - Local development overrides (gitignored)
- `.env.sentry-build-plugin` - Sentry auth token (gitignored)
- `.env.example` - Template for required variables (committed to repo)

## Setup Instructions

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. For Convex, run:
   ```bash
   npx convex dev
   ```
   This will automatically populate `CONVEX_DEPLOYMENT` in `.env`

4. Never commit `.env.local` or `.env.sentry-build-plugin` to version control
