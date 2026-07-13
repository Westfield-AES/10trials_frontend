"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function AppError({
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
    <main className="grid min-h-screen place-items-center bg-[#fffaf5] p-6">
      <section className="card max-w-lg p-8 text-center" role="alert">
        <h1 className="text-3xl font-black text-[#032e4d]">
          Something interrupted this page
        </h1>
        <p className="mt-3 leading-7 text-[#607282]">
          Your saved work is still safe. Try loading this page again.
        </p>
        <button
          className="mt-6 rounded-xl bg-[#ff6b00] px-6 py-3 font-extrabold text-white"
          onClick={reset}
        >
          Try again
        </button>
      </section>
    </main>
  );
}
