"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ fontFamily: "system-ui", padding: "3rem", textAlign: "center" }}>
          <h1>10Trials couldn’t load</h1>
          <p>Please retry. Your completed work remains stored.</p>
          <button onClick={reset} style={{ marginTop: "1rem", padding: "0.8rem 1.2rem" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
