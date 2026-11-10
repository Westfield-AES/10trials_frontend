"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { ArrowRight, BookOpen, Check, Eye, EyeOff, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { apiRequest, publicApiRequest } from "@/lib/api";
import { firebaseErrorMessage } from "@/lib/firebase-errors";
import { toast } from "@/lib/toast";
import { AgeConfirmationField } from "@/components/auth/age-confirmation-field";
import {
  AGE_CONFIRMATION_STORAGE_KEY,
  ageConfirmationError,
} from "@/lib/age-confirmation";

type Mode = "login" | "signup" | "forgot";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (mode === "signup") {
      const error = ageConfirmationError(ageConfirmed);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "forgot") {
        await publicApiRequest("/auth/password-reset", {
          method: "POST",
          body: JSON.stringify({ email }),
          toast: { error: false },
        });
        toast.success(
          "If an account exists for that email, reset instructions are on their way.",
        );
      } else if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(credential.user, { displayName: name });
        sessionStorage.setItem(
          AGE_CONFIRMATION_STORAGE_KEY,
          JSON.stringify({
            userId: credential.user.uid,
            confirmed: true,
          }),
        );
        try {
          await apiRequest("/auth/email-verification", {
            method: "POST",
            toast: { error: false },
          });
          toast.success("Account created. Check your email to verify it.");
        } catch (emailError) {
          toast.error(
            emailError instanceof Error
              ? `Your account was created, but we couldn’t send the verification email. ${emailError.message}`
              : "Your account was created, but we couldn’t send the verification email. Try sending another link.",
          );
        }
        router.push("/verify-email");
      } else {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        if (!credential.user.emailVerified) {
          toast.info("Verify your email to finish signing in.");
          router.push("/verify-email");
        } else {
          toast.success("Welcome back.");
          router.push("/app");
        }
      }
    } catch (nextError) {
      toast.error(firebaseErrorMessage(nextError));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (mode === "signup") {
      const error = ageConfirmationError(ageConfirmed);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setBusy(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      if (mode === "signup") {
        sessionStorage.setItem(
          AGE_CONFIRMATION_STORAGE_KEY,
          JSON.stringify({
            userId: credential.user.uid,
            confirmed: true,
          }),
        );
      }
      toast.success("You’re signed in.");
      router.replace(mode === "signup" ? "/onboarding" : "/app");
    } catch (nextError) {
      toast.error(firebaseErrorMessage(nextError));
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "login"
      ? "Welcome back"
      : mode === "signup"
        ? "Start your free practice"
        : "Reset your password";
  const subtitle =
    mode === "login"
      ? "Your next step starts with a little practice."
      : mode === "signup"
        ? "5 free sessions. No card required."
        : "We’ll email you a secure reset link.";

  return (
    <main
      id="main-content"
      className="grid min-h-dvh bg-white lg:grid-cols-[1.1fr_.9fr]"
    >
      <section className="flex items-center justify-center px-6 pb-10 pt-7 sm:p-10">
        <div className="w-full max-w-md">
          <Logo />
          <div className="mt-10 sm:mt-12">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#b94700]">
              {mode === "login"
                ? "Good to see you again"
                : mode === "signup"
                  ? "Let’s make progress"
                  : "Back on track"}
            </p>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-[#032e4d]">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-[#607282]">{subtitle}</p>}
            {mode !== "forgot" && (
              <Button
                type="button"
                variant="ghost"
                className="mt-6 w-full"
                onClick={google}
                disabled={busy}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
                  <path
                    fill="#4285F4"
                    d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.31 2.98-7.36Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"
                  />
                </svg>{" "}
                Continue with Google
              </Button>
            )}
            {mode !== "forgot" && (
              <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#8b9aa5]">
                <span className="h-px flex-1 bg-[#dce5eb]" />
                or use email
                <span className="h-px flex-1 bg-[#dce5eb]" />
              </div>
            )}
            <form onSubmit={submit} className="space-y-5 [&>label]:block">
              {mode === "signup" && (
                <label>
                  <span className="field-label">Full name</span>
                  <input
                    className="field"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Your full name"
                  />
                </label>
              )}
              <label>
                <span className="field-label">Email</span>
                <input
                  className="field"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                />
              </label>
              {mode !== "forgot" && (
                <label>
                  <span className="field-label">Password</span>
                  <span className="relative block">
                    <input
                      className="field pr-12"
                      required
                      minLength={6}
                      placeholder={
                        mode === "signup"
                          ? "At least 6 characters"
                          : "Your password"
                      }
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-4 text-[#607282]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
              )}
              {mode === "signup" && (
                <div className="space-y-3 pt-3">
                  <AgeConfirmationField
                    checked={ageConfirmed}
                    onChange={setAgeConfirmed}
                    disabled={busy}
                  />
                  <p className="text-xs leading-5 text-[#607282]">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="font-bold text-[#07436c]">
                      Terms of Use
                    </Link>{" "}
                    and acknowledge our{" "}
                    <Link href="/privacy" className="font-bold text-[#07436c]">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              )}
              <div className={mode === "login" ? "pt-3" : undefined}>
                <Button className="w-full" disabled={busy}>
                  {busy
                    ? "Please wait…"
                    : mode === "login"
                      ? "Log in"
                      : mode === "signup"
                        ? "Create free account"
                        : "Send reset link"}
                  {!busy && <ArrowRight size={17} />}
                </Button>
              </div>
            </form>
            <div className="mt-5 text-center text-sm text-[#607282]">
              {mode === "login" ? (
                <>
                  <Link
                    href="/forgot-password"
                    className="font-bold text-[#07436c]"
                  >
                    Forgot password?
                  </Link>
                  <p className="mt-3">
                    New here?{" "}
                    <Link href="/signup" className="font-black text-[#e85b00]">
                      Create an account
                    </Link>
                  </p>
                </>
              ) : mode === "signup" ? (
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="font-black text-[#e85b00]">
                    Log in
                  </Link>
                </p>
              ) : (
                <Link href="/login" className="font-black text-[#07436c]">
                  Back to login
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-[#032e4d] p-14 text-white lg:flex lg:flex-col lg:justify-center">
        <div
          aria-hidden="true"
          className="absolute -right-48 -top-40 size-[36rem] rounded-full border-[60px] border-white/[0.035]"
        />
        <div className="relative max-w-lg">
          <span className="mb-8 grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/5 text-[#ff9b52]">
            <BookOpen size={26} />
          </span>
          <h2 className="text-5xl font-bold leading-[1.12] tracking-[-0.04em]">
            Small sessions.
            <br />
            <span className="text-[#ff9b52]">Bigger confidence.</span>
          </h2>
          <p className="mt-6 max-w-sm text-base leading-7 text-[#c7d8e4]">
            Know what you understand, find what needs work, and feel more
            prepared for your next exam.
          </p>
          <div className="mt-10 space-y-5">
            {[
              [Target, "Practice shaped around your exam"],
              [Check, "Clear explanations, every step"],
              [BookOpen, "Your progress, all in one place"],
            ].map(([Icon, label]) => {
              const FeatureIcon = Icon as typeof Target;
              return (
                <div
                  key={String(label)}
                  className="flex items-center gap-3 text-sm text-[#dcebf4]"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-white/8 text-[#ff9b52]">
                    <FeatureIcon size={16} />
                  </span>
                  {String(label)}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </main>
  );
}
