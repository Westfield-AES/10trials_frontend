"use client";

import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { apiRequest, publicApiRequest } from "@/lib/api";
import type { PlanCatalogue } from "@/lib/types";
import { useAccount } from "@/lib/use-account";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/app/loading-skeleton";
import { toast } from "@/lib/toast";

export default function BillingPage() {
  const account = useAccount();
  const catalogue = useQuery({
    queryKey: ["plans"],
    queryFn: () => publicApiRequest<PlanCatalogue>("/api/v1/plans"),
  });
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [annual, setAnnual] = useState(false);
  const [busy, setBusy] = useState(false);
  const pro = account.data?.user.entitlement_tier === "pro";
  const plan = catalogue.data?.plans.find((item) => item.name === "pro");
  const price = plan?.prices.find(
    (item) =>
      item.currency === currency &&
      item.interval === (annual ? "annual" : "monthly"),
  );
  const formatted = price
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "USD" ? 2 : 0,
        maximumFractionDigits: currency === "USD" ? 2 : 0,
      }).format(price.amount / 100)
    : null;
  const pending = account.data?.journey.payment_pending;
  async function checkout() {
    if (!price || busy) return;
    setBusy(true);
    try {
      const result = await apiRequest<{ authorization_url: string }>(
        "/api/v1/billing/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            currency,
            interval: annual ? "annual" : "monthly",
          }),
        },
      );
      window.location.assign(result.authorization_url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not open checkout.",
      );
      setBusy(false);
    }
  }
  async function manage() {
    setBusy(true);
    try {
      const result = await apiRequest<{ url: string }>(
        "/api/v1/billing/manage",
        { method: "POST" },
      );
      window.location.assign(result.url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not open subscription management.",
      );
      setBusy(false);
    }
  }
  if (account.isLoading || catalogue.isLoading)
    return <PageSkeleton kind="billing" />;
  if (
    (account.isError && !account.data) ||
    (catalogue.isError && !catalogue.data)
  )
    return (
      <section className="card p-7">
        <h1 className="text-2xl font-black text-[#032e4d]">
          We couldn’t load your plans
        </h1>
        <Button
          className="mt-5"
          onClick={() => {
            void account.refetch();
            void catalogue.refetch();
          }}
        >
          Try again
        </Button>
      </section>
    );
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
        Plan & billing
      </h1>
      {pending && !pro && (
        <section className="mt-5 rounded-xl border border-[#bdd5e5] bg-[#edf6fb] p-5">
          <h2 className="font-black text-[#032e4d]">
            Payment confirmation pending
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#526877]">
            Check your payment status before paying again.
          </p>
          <Link
            href="/billing/callback"
            className="mt-3 inline-flex font-extrabold text-[#07436c]"
          >
            Check payment status →
          </Link>
        </section>
      )}
      <section className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl bg-[#032e4d] p-7 text-white sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-black text-[#ff9b52]">Pro</p>
              <h2 className="mt-2 text-3xl font-black">
                More practice with Pro
              </h2>
            </div>
            <BadgeCheck className="text-[#ff9b52]" size={30} />
          </div>
          <ul className="mt-7 space-y-4 text-sm">
            {[
              `${plan?.entitlements.session_limit ?? 30} sessions of 10 questions per calendar month`,
              "Learn, Simulate, and focused retries",
              "Priority generation and advanced insights",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check size={18} className="shrink-0 text-[#ff9b52]" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-7 border-t border-white/15 pt-5 text-sm leading-6 text-[#c7d8e4]">
            This month’s existing practice counts toward your Pro allowance.
          </p>
        </article>
        <article className="card p-7 sm:p-8">
          {pro ? (
            <>
              <h2 className="text-2xl font-black text-[#032e4d]">
                Pro is active
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#607282]">
                Update payment details or cancel renewal.
              </p>
              <Button className="mt-6 w-full" onClick={manage} disabled={busy}>
                Manage subscription <ExternalLink size={16} />
              </Button>
              <Link
                href="/app"
                className="mt-4 block text-center text-sm font-extrabold text-[#07436c]"
              >
                Back to practice
              </Link>
            </>
          ) : (
            <>
              <fieldset>
                <legend className="text-sm font-bold text-[#526877]">
                  Currency
                </legend>
                <div className="mt-2 flex rounded-xl bg-[#edf3f6] p-1">
                  {(["NGN", "USD"] as const).map((item) => (
                    <button
                      key={item}
                      aria-pressed={currency === item}
                      onClick={() => setCurrency(item)}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-black ${currency === item ? "bg-white text-[#032e4d] shadow-sm" : "text-[#607282]"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-5">
                <legend className="text-sm font-bold text-[#526877]">
                  Billing period
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[false, true].map((value) => (
                    <button
                      key={String(value)}
                      aria-pressed={annual === value}
                      onClick={() => setAnnual(value)}
                      className={`rounded-xl border p-3 text-sm font-extrabold ${annual === value ? "border-[#ff6b00] bg-[#fff0e5] text-[#a94400]" : "border-[#dce5eb] text-[#526877]"}`}
                    >
                      {value ? "Annual" : "Monthly"}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p className="mt-7 text-4xl font-black tracking-tight text-[#032e4d]">
                {formatted ?? "Unavailable"}
                <span className="ml-1 text-sm font-bold text-[#607282]">
                  /{annual ? "year" : "month"}
                </span>
              </p>
              <p className="mt-3 text-xs leading-5 text-[#607282]">
                {annual
                  ? "Billed annually. Practice allowance resets each calendar month."
                  : "Billed monthly."}{" "}
                Renews automatically until cancelled.
              </p>
              <Button
                className="mt-6 w-full"
                onClick={checkout}
                disabled={busy || !price}
              >
                {busy ? "Opening secure checkout…" : "Upgrade to Pro"}
              </Button>
              {account.data?.journey.can_generate && (
                <Link
                  href="/app/new"
                  className="mt-5 block text-center text-sm font-extrabold text-[#07436c]"
                >
                  Continue free practice
                </Link>
              )}
            </>
          )}
        </article>
      </section>
      <p className="mt-6 text-xs leading-6 text-[#607282]">
        Failed renewals have a three-day grace period. Cancelling Pro does not
        reset your free allowance.
      </p>
    </div>
  );
}
