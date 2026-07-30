"use client";

import { sendEmailVerification } from "firebase/auth";
import { MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { firebaseErrorMessage } from "@/lib/firebase-errors";
import { toast } from "@/lib/toast";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  async function check() {
    if (!user) return;
    try {
      await user.reload();
      await user.getIdToken(true);
      if (user.emailVerified) {
        toast.success("Email verified.");
        router.push("/onboarding");
      } else {
        toast.info(
          "Not verified yet. Open the link in your email, then try again.",
        );
      }
    } catch (error) {
      toast.error(firebaseErrorMessage(error, "Could not check verification."));
    }
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
          <Button className="mt-6 w-full" onClick={check}>
            I’ve verified my email
          </Button>
          <button
            className="mt-4 text-sm font-bold text-[#07436c]"
            onClick={async () => {
              if (user) {
                try {
                  await sendEmailVerification(user);
                  toast.success("A fresh verification link has been sent.");
                } catch (error) {
                  toast.error(
                    firebaseErrorMessage(
                      error,
                      "Could not send a new verification link.",
                    ),
                  );
                }
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
