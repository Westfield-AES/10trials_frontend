"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { CONSENT_POLICY_VERSION } from "@/lib/policy";
import type { Language } from "@/lib/types";
import { AuthGuard } from "@/components/providers/auth-guard";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { toast } from "@/lib/toast";

const languages: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
];

function OnboardingForm() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const [is13, setIs13] = useState(false);
  const [under18, setUnder18] = useState(false);
  const [guardian, setGuardian] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = sessionStorage.getItem("10trials-age");
      if (saved) {
        const value = JSON.parse(saved);
        setIs13(true);
        setUnder18(Boolean(value.under18));
        setGuardian(Boolean(value.guardian));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function finish() {
    if (!is13 || (under18 && !guardian)) {
      toast.error("Confirm the age and guardian requirements to continue.");
      return;
    }
    setBusy(true);
    try {
      await apiRequest("/api/v1/account/age-confirmation", {
        method: "POST",
        body: JSON.stringify({
          is_13_or_older: is13,
          is_under_18: under18,
          guardian_consent: guardian,
          policy_version: CONSENT_POLICY_VERSION,
        }),
      });
      await apiRequest("/api/v1/account/me", {
        method: "PATCH",
        body: JSON.stringify({ preferred_language: language }),
        toast: { success: "Your study preferences are ready." },
      });
      localStorage.setItem("10trials-language", language);
      sessionStorage.removeItem("10trials-age");
      router.push("/app");
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not save your preferences.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main-content" className="min-h-screen bg-[#fffaf5] p-5 sm:p-10">
      <div className="mx-auto max-w-2xl">
        <Logo />
        <section className="card mt-8 p-6 sm:p-10">
          <p className="eyebrow">A quick setup</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
            Make 10Trials yours
          </h1>
          <p className="mt-3 text-[#607282]">
            Your chosen language applies to both the interface and generated
            exam content.
          </p>
          <fieldset className="mt-8">
            <legend className="field-label">Study language</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {languages.map((item) => (
                <label
                  key={item.code}
                  className={`cursor-pointer rounded-xl border p-4 font-bold ${language === item.code ? "border-[#ff6b00] bg-[#fff0e5]" : "border-[#dce5eb]"}`}
                >
                  <input
                    className="mr-3"
                    type="radio"
                    name="language"
                    checked={language === item.code}
                    onChange={() => setLanguage(item.code)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-8 space-y-3 rounded-2xl bg-[#f4f8fa] p-5">
            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={is13}
                onChange={(event) => setIs13(event.target.checked)}
              />
              <span>I confirm that I am at least 13 years old.</span>
            </label>
            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={under18}
                onChange={(event) => setUnder18(event.target.checked)}
              />
              <span>I am under 18.</span>
            </label>
            {under18 && (
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={guardian}
                  onChange={(event) => setGuardian(event.target.checked)}
                />
                <span>
                  My parent or guardian consents to my use of 10Trials.
                </span>
              </label>
            )}
          </div>
          <Button
            className="mt-7 w-full sm:w-auto"
            onClick={finish}
            disabled={busy}
          >
            {busy ? "Saving…" : "Enter my study space"}
          </Button>
          <p className="mt-5 text-xs leading-5 text-[#607282]">
            Our legal pages are placeholders and will receive professional
            review before launch.
          </p>
        </section>
      </div>
    </main>
  );
}
export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingForm />
    </AuthGuard>
  );
}
