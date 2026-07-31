"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { disableAnalytics, enableAnalytics } from "@/lib/analytics";
import { CONSENT_POLICY_VERSION } from "@/lib/policy";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "@/lib/toast";

type Consent = "accepted" | "essential" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("10trials-cookie-consent") as Consent;
    if (saved === "accepted") enableAnalytics();
    else if (saved === "essential") disableAnalytics();
    const timer = window.setTimeout(() => {
      setConsent(saved);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function choose(value: Exclude<Consent, null>) {
    localStorage.setItem("10trials-cookie-consent", value);
    setConsent(value);
    if (value === "accepted") enableAnalytics();
    else disableAnalytics();
    if (user) {
      try {
        await apiRequest("/api/v1/account/consents", {
          method: "POST",
          body: JSON.stringify({
            consent_type: "cookies",
            granted: value === "accepted",
            policy_version: CONSENT_POLICY_VERSION,
          }),
        });
      } catch {
        return;
      }
    }
    toast.success("Cookie preferences saved.");
  }

  if (!ready) return null;
  if (consent) return null;

  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-[#dce5eb] bg-white p-5 shadow-2xl"
      aria-label="Cookie preferences"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="font-black text-[#032e4d]">Your privacy, your choice</p>
          <p className="mt-1 text-sm text-[#607282]">
            Essential cookies keep 10Trials working. With permission, PostHog
            helps us improve the learning experience.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => choose("essential")}>
            Essential only
          </Button>
          <Button onClick={() => choose("accepted")}>Allow analytics</Button>
        </div>
      </div>
    </aside>
  );
}
