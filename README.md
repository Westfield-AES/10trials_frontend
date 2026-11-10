# 10Trials Frontend

Standalone, installable web interface for the 10Trials exam-preparation
platform, including practice sessions, subscriptions, and completed history.

Learners can enter an official exam name or describe it naturally. Exact
matches proceed to editable topics; partial matches keep the recognized context
and ask one inline clarification instead of showing an error.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- Firebase Authentication (email/password and Google)
- TanStack Query
- PostHog (automatic product analytics and masked session replay) and Sentry (PII disabled)
- Vercel deployment

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Run the FastAPI service at `http://localhost:8000`, or update
`NEXT_PUBLIC_API_URL`.

Firebase authenticates users and validates secure action links. The frontend
requests verification and password-reset email from the backend so all
transactional delivery and branding is handled by Brevo.

## Verification

```bash
npm run lint
npm run typecheck
npm run test:analytics
npm run build
```

## Analytics

PostHog starts before hydration from `src/instrumentation-client.ts` whenever
`NEXT_PUBLIC_POSTHOG_KEY` is set. It captures page visits (including client-side
navigation), page leaves, interactions, and masked session replay without a
cookie prompt. Previous SDK consent gates are cleared during initialization;
no user opt-in event is generated.

Replay masks form inputs and page text, excludes network bodies, headers, and
console logs, and removes URL query strings and fragments from analytics and
replay metadata. The recorder is bundled locally; CSP permits PostHog config
and ingestion requests without allowing remote scripts.

Enable session replay in the PostHog project and review its sampling, trigger,
and minimum-duration settings. Client code respects those project controls.
Browser blockers and unavailable ingestion endpoints can still prevent delivery.
Public environment variables are fixed at build time, so redeploy after changes.

## PWA behavior

The manifest and service worker allow installation and cache only the public
application shell. Active exams intentionally require connectivity so answers,
usage, and server-enforced timers stay authoritative.

## Deployment

Set every variable from `.env.example` in Vercel. Add the deployed frontend URL
to the backend `CORS_ORIGINS`, Firebase authorized domains, and Paystack callback
configuration.
