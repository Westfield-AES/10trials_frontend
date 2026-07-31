import * as Sentry from "@sentry/nextjs";
import { safeTelemetryUrl, scrubSentryEvent } from "@/lib/sentry-privacy";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    beforeSend: scrubSentryEvent,
    beforeSendTransaction: scrubSentryEvent,
  });
}

export function onRouterTransitionStart(href: string, navigationType: string) {
  Sentry.captureRouterTransitionStart(
    safeTelemetryUrl(href),
    navigationType,
  );
}
