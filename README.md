# 10Trials Frontend

Standalone, installable web interface for the 10Trials exam-preparation
platform, including practice sessions, subscriptions, and completed history.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- Firebase Authentication (email/password and Google)
- TanStack Query
- PostHog (consent-gated) and Sentry (PII disabled)
- Vercel deployment

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Run the FastAPI service at `http://localhost:8000`, or update
`NEXT_PUBLIC_API_URL`.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

## PWA behavior

The manifest and service worker allow installation and cache only the public
application shell. Active exams intentionally require connectivity so answers,
usage, and server-enforced timers stay authoritative.

## Deployment

Set every variable from `.env.example` in Vercel. Add the deployed frontend URL
to the backend `CORS_ORIGINS`, Firebase authorized domains, and Paystack callback
configuration.
