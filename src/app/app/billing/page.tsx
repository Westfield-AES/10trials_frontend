"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Crown, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import type { AccountOverview } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";
import { toast } from "@/lib/toast";

export default function BillingPage() {
  const { t } = useI18n();
  const account = useQuery({
    queryKey: ["account"],
    queryFn: () => apiRequest<AccountOverview>("/api/v1/account/me"),
  });
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [annual, setAnnual] = useState(false);
  const [busy, setBusy] = useState(false);
  const trialing = account.data?.user.entitlement_tier === "trial";
  const pro = account.data?.user.entitlement_tier === "pro";
  async function checkout() {
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
          toast: { success: "Secure checkout is ready." },
        },
      );
      window.location.assign(result.authorization_url);
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not open checkout.",
      );
      setBusy(false);
    }
  }
  async function manage() {
    setBusy(true);
    try {
      const result = await apiRequest<{ url: string }>(
        "/api/v1/billing/manage",
        {
          method: "POST",
          toast: { success: "Opening subscription management." },
        },
      );
      window.location.assign(result.url);
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not open billing management.",
      );
      setBusy(false);
    }
  }
  const price =
    currency === "NGN"
      ? annual
        ? "₦50,000"
        : "₦5,000"
      : annual
        ? "$50"
        : "$5";
  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Plan & billing</p>
      <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
        {t("billing")}
      </h1>
      <p className="mt-2 text-[#607282]">
        Simple limits, no surprise usage fees.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <div className="inline-flex rounded-xl bg-[#edf3f6] p-1">
          {(["NGN", "USD"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setCurrency(item)}
              className={`rounded-lg px-4 py-2 text-sm font-black ${currency === item ? "bg-white text-[#032e4d] shadow-sm" : "text-[#607282]"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 rounded-xl bg-[#edf3f6] px-4 text-sm font-bold">
          <input
            type="checkbox"
            checked={annual}
            onChange={(event) => setAnnual(event.target.checked)}
          />
          Annual <span className="text-[#17885b]">2 months free</span>
        </label>
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <article className="card p-7">
          <p className="text-sm font-black text-[#607282]">Free</p>
          <p className="mt-2 text-4xl font-black text-[#032e4d]">₦0</p>
          <p className="mt-2 text-sm text-[#607282]">
            A serious monthly practice allowance.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "10 sessions every calendar month",
              "50 questions total",
              "5 questions per session",
              "Learn and Simulate modes",
              "Reports and shared history",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="shrink-0 text-[#17885b]" size={18} />
                {item}
              </li>
            ))}
          </ul>
          {!pro && !trialing && (
            <p className="mt-7 rounded-xl bg-[#f4f8fa] p-3 text-center text-sm font-black text-[#526877]">
              Your current plan
            </p>
          )}
        </article>
        <article className="relative overflow-hidden rounded-[1.25rem] bg-[#032e4d] p-7 text-white shadow-xl">
          <div className="absolute right-5 top-5">
            <Crown className="text-[#ff8a38]" />
          </div>
          <p className="text-sm font-black text-[#ff9b52]">Pro</p>
          <p className="mt-2 text-4xl font-black">
            {price}
            <span className="text-base font-bold text-[#c7d8e4]">
              /{annual ? "year" : "month"}
            </span>
          </p>
          <p className="mt-2 text-sm text-[#c7d8e4]">
            More attempts, larger simulations, deeper momentum.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "30 sessions every calendar month",
              "Up to 300 questions total",
              "Choose 5 or 10 questions per session",
              "Priority question generation",
              "Advanced progress insights",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="shrink-0 text-[#ff8a38]" size={18} />
                {item}
              </li>
            ))}
          </ul>
          {pro ? (
            <Button className="mt-7 w-full" onClick={manage} disabled={busy}>
              Manage subscription <ExternalLink size={17} />
            </Button>
          ) : (
            <>
              <Button
                className="mt-7 w-full"
                onClick={checkout}
                disabled={busy}
              >
                {busy
                  ? "Please wait…"
                  : trialing
                    ? "Keep Pro after trial"
                    : "Choose Pro"}
              </Button>
              {trialing && (
                <p className="mt-3 text-center text-sm font-black text-[#ffb37b]">
                  <Sparkles className="mr-1 inline" size={16} />
                  Your 7-day trial includes 5 sessions and up to 50 questions.
                </p>
              )}
            </>
          )}
        </article>
      </div>
      <p className="mt-6 text-xs leading-5 text-[#607282]">
        Paid access includes a three-day grace period after a failed renewal.
        Payment details are handled securely; 10Trials does not store card
        numbers.
      </p>
    </div>
  );
}
