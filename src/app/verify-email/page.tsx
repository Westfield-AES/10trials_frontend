"use client";

import { sendEmailVerification } from "firebase/auth";
import { MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function check() {
    if (!user) return;
    await user.reload();
    await user.getIdToken(true);
    if (user.emailVerified) router.push("/onboarding");
    else
      setMessage(
        "Not verified yet. Open the link in your email, then try again.",
      );
  }
  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center bg-[#fffaf5] p-5"
    >
      <div className="w-full max-w-md">
        <Logo />
        <section className="card mt-8 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#fff0e5] text-[#e85b00]">
            <MailCheck size={30} />
          </div>
          <h1 className="mt-5 text-3xl font-black text-[#032e4d]">
            Check your email
          </h1>
          <p className="mt-3 leading-7 text-[#607282]">
            We sent a verification link to{" "}
            <strong>{user?.email ?? "your email"}</strong>. Verify it before
            starting your first session.
          </p>
          {message && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800"
            >
              {message}
            </p>
          )}
          <Button className="mt-6 w-full" onClick={check}>
            I’ve verified my email
          </Button>
          <button
            className="mt-4 text-sm font-bold text-[#07436c]"
            onClick={async () => {
              if (user) {
                await sendEmailVerification(user);
                setMessage("A fresh verification link has been sent.");
              }
            }}
          >
            Send another link
          </button>
        </section>
      </div>
    </main>
  );
}
