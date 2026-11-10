"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { AccountOverview } from "@/lib/types";
import { AuthGuard } from "@/components/providers/auth-guard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function PaymentConfirmation() {
  const [waiting, setWaiting] = useState(true);
  const account = useQuery({
    queryKey: ["account"],
    queryFn: () =>
      apiRequest<AccountOverview>("/api/v1/account/me", {
        toast: { error: false },
      }),
    refetchOnMount: "always",
    refetchInterval: (query) =>
      waiting && query.state.data?.user.entitlement_tier !== "pro"
        ? 3000
        : false,
  });
  useEffect(() => {
    const timer = window.setTimeout(() => setWaiting(false), 60_000);
    return () => window.clearTimeout(timer);
  }, []);
  const active = account.data?.user.entitlement_tier === "pro";
  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center bg-[#fffaf5] p-5"
    >
      <section
        className="card w-full max-w-lg p-8 text-center"
        aria-live="polite"
      >
        <h1 className="text-3xl font-black text-[#032e4d]">
          {active
            ? "Pro is active"
            : account.isError
              ? "We couldn’t check your upgrade"
              : waiting
                ? "Confirming payment…"
                : "Still waiting for confirmation"}
        </h1>
        <p className="mt-4 leading-7 text-[#607282]">
          {active
            ? "Your monthly practice allowance is ready."
            : "Pro activates after payment confirmation. If you’ve paid, check the status before paying again."}
        </p>
        {!active && waiting && !account.isError && (
          <div className="mt-5 flex justify-center">
            <Spinner label="Waiting for payment confirmation" />
          </div>
        )}
        {active ? (
          <Link
            href="/app/new"
            className="mt-6 inline-flex rounded-xl bg-[#e85b00] px-6 py-3 font-extrabold text-white"
          >
            Start a Pro session
          </Link>
        ) : (
          <Button
            className="mt-6"
            disabled={account.isFetching}
            onClick={() => {
              void account.refetch();
            }}
          >
            Check again
          </Button>
        )}
        <Link
          href="/app/billing"
          className="mt-5 block text-sm font-extrabold text-[#07436c]"
        >
          Back to billing
        </Link>
      </section>
    </main>
  );
}

export default function BillingCallbackPage() {
  return (
    <AuthGuard>
      <PaymentConfirmation />
    </AuthGuard>
  );
}
