"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { CONSENT_POLICY_VERSION } from "@/lib/policy";
import type { Language } from "@/lib/types";
import { AuthGuard } from "@/components/providers/auth-guard";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { toast } from "@/lib/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { AgeConfirmationField } from "@/components/auth/age-confirmation-field";
import {
  AGE_CONFIRMATION_STORAGE_KEY,
  ageConfirmationError,
  readAgeConfirmation,
} from "@/lib/age-confirmation";

const languages: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
];

function OnboardingForm() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState<Language>("en");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageLoaded, setAgeLoaded] = useState(false);
  const [hasSavedAge, setHasSavedAge] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved =
        user &&
        readAgeConfirmation(
          sessionStorage.getItem(AGE_CONFIRMATION_STORAGE_KEY),
          user.uid,
        );
      if (saved) {
        setAgeConfirmed(true);
      } else {
        setAgeConfirmed(false);
      }
      setHasSavedAge(Boolean(saved));
      setAgeLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);
  async function finish() {
    if (!ageLoaded) return;
    const error = ageConfirmationError(ageConfirmed);
    if (error) {
      toast.error(error);
      return;
    }
    setBusy(true);
    try {
      await apiRequest("/api/v1/account/age-confirmation", {
        method: "POST",
        body: JSON.stringify({
          is_13_or_older: true,
          is_under_18: false,
          guardian_consent: false,
          policy_version: CONSENT_POLICY_VERSION,
        }),
      });
      await apiRequest("/api/v1/account/me", {
        method: "PATCH",
        body: JSON.stringify({ preferred_language: language }),
        toast: { success: "Your study preferences are ready." },
      });
      localStorage.setItem("10trials-language", language);
      sessionStorage.removeItem(AGE_CONFIRMATION_STORAGE_KEY);
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      router.push("/app/new");
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
          <h1 className="text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
            Choose your study language
          </h1>
          <p className="mt-3 text-[#607282]">
            You can change this later in Settings.
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
          {ageLoaded && !hasSavedAge && (
            <div className="mt-8">
              <AgeConfirmationField
                checked={ageConfirmed}
                onChange={setAgeConfirmed}
                disabled={busy}
              />
            </div>
          )}
          <Button
            className="mt-7 w-full sm:w-auto"
            onClick={finish}
            disabled={busy || !ageLoaded}
          >
            {busy ? "Saving…" : "Continue"}
          </Button>
          <p className="mt-5 text-xs leading-5 text-[#607282]">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-bold text-[#07436c]">
              Terms of Use
            </Link>{" "}
            and acknowledge our{" "}
            <Link href="/privacy" className="font-bold text-[#07436c]">
              Privacy Policy
            </Link>
            .
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
