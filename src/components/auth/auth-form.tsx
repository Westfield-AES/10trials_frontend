"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { firebaseErrorMessage } from "@/lib/firebase-errors";
import { toast } from "@/lib/toast";

type Mode = "login" | "signup" | "forgot";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [is13, setIs13] = useState(false);
  const [under18, setUnder18] = useState(false);
  const [guardian, setGuardian] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        await sendPasswordResetEmail(auth, email);
        toast.success(
          "Password reset instructions are on their way. Check your inbox.",
        );
      } else if (mode === "signup") {
        if (!is13) throw new Error("AGE");
        if (under18 && !guardian) throw new Error("GUARDIAN");
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(credential.user, { displayName: name });
        sessionStorage.setItem(
          "10trials-age",
          JSON.stringify({ under18, guardian }),
        );
        await sendEmailVerification(credential.user);
        toast.success("Account created. Check your email to verify it.");
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
      if ((nextError as Error).message === "AGE")
        toast.error("You must be at least 13 to use 10Trials.");
      else if ((nextError as Error).message === "GUARDIAN")
        toast.error("Guardian consent is required for users under 18.");
      else toast.error(firebaseErrorMessage(nextError));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("You’re signed in.");
      router.replace("/app");
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
        ? "Build your next win"
        : "Reset your password";
  const subtitle =
    mode === "login"
      ? "Pick up where you left off."
      : mode === "signup"
        ? "Your first ten sessions each month are free."
        : "We’ll email you a secure reset link.";

  return (
    <main
      id="main-content"
      className="grid min-h-screen bg-[#fffaf5] lg:grid-cols-[.9fr_1.1fr]"
    >
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <Logo />
          <div className="card mt-8 p-6 sm:p-8">
            <p className="eyebrow">10Trials account</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#032e4d]">
              {title}
            </h1>
            <p className="mt-2 text-[#607282]">{subtitle}</p>
            {mode !== "forgot" && (
              <Button
                type="button"
                variant="ghost"
                className="mt-6 w-full"
                onClick={google}
                disabled={busy}
              >
                <span className="text-lg font-black text-[#4285f4]">G</span>{" "}
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
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <label>
                  <span className="field-label">Full name</span>
                  <input
                    className="field"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
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
                <div className="space-y-3 rounded-xl bg-[#f4f8fa] p-4 text-sm">
                  <label className="flex gap-3">
                    <input
                      type="checkbox"
                      checked={is13}
                      onChange={(event) => setIs13(event.target.checked)}
                    />
                    <span>I confirm I am at least 13 years old.</span>
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
                        My parent or guardian has agreed to my use of 10Trials.
                      </span>
                    </label>
                  )}
                </div>
              )}
              <Button className="w-full" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Log in"
                    : mode === "signup"
                      ? "Create free account"
                      : "Send reset link"}
                <ArrowRight size={17} />
              </Button>
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
        <div className="grid-dots absolute inset-0 opacity-20" />
        <div className="relative max-w-lg">
          <p className="eyebrow text-[#ff9b52]">Designed for momentum</p>
          <blockquote className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em]">
            “I don’t need another pile of notes. I need to know what to practise
            next.”
          </blockquote>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ["4", "languages"],
              ["2", "study modes"],
              ["10", "retry questions"],
            ].map(([number, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/15 bg-white/7 p-4"
              >
                <p className="text-2xl font-black text-[#ff8a38]">{number}</p>
                <p className="mt-1 text-xs font-bold text-[#c7d8e4]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
