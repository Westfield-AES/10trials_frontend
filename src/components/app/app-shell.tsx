"use client";

import { useQuery } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import {
  BookOpenCheck,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { auth } from "@/lib/firebase";
import type { AccountOverview } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/components/providers/i18n-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [actionError, setActionError] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { t, setLocale } = useI18n();
  const links = [
    { href: "/app", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/app/new", label: t("newSession"), icon: Plus },
    { href: "/app/history", label: t("history"), icon: History },
    { href: "/app/billing", label: t("billing"), icon: CreditCard },
    { href: "/app/settings", label: t("settings"), icon: Settings },
  ];
  const overview = useQuery({
    queryKey: ["account"],
    queryFn: () => apiRequest<AccountOverview>("/api/v1/account/me"),
  });
  useEffect(() => {
    if (overview.data && !overview.data.user.age_confirmed)
      router.replace("/onboarding");
  }, [overview.data, router]);
  useEffect(() => {
    if (!overview.data?.user.preferred_language) return;
    const timer = window.setTimeout(
      () => setLocale(overview.data!.user.preferred_language),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [overview.data, setLocale]);
  if (overview.isLoading)
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label={t("loading")} />
      </div>
    );
  if (overview.isError) {
    const authFailure =
      overview.error instanceof ApiError && overview.error.status === 401;
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffaf5] p-6">
        <section className="card max-w-lg p-8 text-center" role="alert">
          <h1 className="text-2xl font-black text-[#032e4d]">
            {authFailure ? "Your session has expired" : "We couldn’t open your account"}
          </h1>
          <p className="mt-3 leading-7 text-[#607282]">
            {overview.error instanceof Error
              ? overview.error.message
              : "Please try again."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {authFailure ? (
              <button
                className="rounded-xl bg-[#ff6b00] px-5 py-3 font-extrabold text-white"
                onClick={async () => {
                  await signOut(auth);
                  router.replace("/login");
                }}
              >
                Sign in again
              </button>
            ) : (
              <button
                className="rounded-xl bg-[#ff6b00] px-5 py-3 font-extrabold text-white"
                onClick={() => overview.refetch()}
              >
                Try again
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }
  if (overview.data?.user.status !== "active") {
    const restorable = overview.data?.user.status === "soft_deleted";
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffaf5] p-6">
        <section className="card max-w-lg p-8 text-center">
          <h1 className="text-2xl font-black text-[#032e4d]">
            {restorable ? "Your account is scheduled for deletion" : "This account is unavailable"}
          </h1>
          <p className="mt-3 leading-7 text-[#607282]">
            {restorable
              ? "Restore it during the 30-day recovery period to continue learning."
              : "Contact support if you believe this account status is incorrect."}
          </p>
          {actionError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{actionError}</p>}
          <div className="mt-6 flex justify-center gap-3">
            {restorable && (
              <button
                disabled={restoring}
                className="rounded-xl bg-[#ff6b00] px-5 py-3 font-extrabold text-white disabled:opacity-60"
                onClick={async () => {
                  setRestoring(true);
                  setActionError("");
                  try {
                    await apiRequest("/api/v1/account/me/restore", { method: "POST" });
                    await overview.refetch();
                  } catch (nextError) {
                    setActionError(nextError instanceof Error ? nextError.message : "Could not restore the account.");
                  } finally {
                    setRestoring(false);
                  }
                }}
              >
                {restoring ? "Restoring…" : "Restore account"}
              </button>
            )}
            <button
              className="rounded-xl px-5 py-3 font-extrabold text-[#607282]"
              onClick={async () => {
                await signOut(auth);
                router.replace("/");
              }}
            >
              Sign out
            </button>
          </div>
        </section>
      </div>
    );
  }
  const navigation = (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Logo href="/app" />
        <button
          className="md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
      </div>
      <nav className="space-y-1" aria-label="Study navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/app" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold",
                active
                  ? "bg-[#fff0e5] text-[#c94d00]"
                  : "text-[#526877] hover:bg-[#f4f8fa]",
              )}
            >
              <Icon size={19} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-[#032e4d] p-4 text-white">
        <BookOpenCheck className="text-[#ff8a38]" />
        <p className="mt-3 text-sm font-black">
          {overview.data?.user.plan === "pro" ? "Pro learner" : "Free plan"}
        </p>
        <p className="mt-1 text-xs text-[#c7d8e4]">
          {overview.data?.usage.sessions ?? 0} of{" "}
          {overview.data?.entitlements.sessions_per_month ?? 5} sessions used
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full bg-[#ff6b00]"
            style={{
              width: `${Math.min(100, ((overview.data?.usage.sessions ?? 0) / (overview.data?.entitlements.sessions_per_month ?? 5)) * 100)}%`,
            }}
          />
        </div>
      </div>
      <button
        onClick={async () => {
          await signOut(auth);
          router.push("/");
        }}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#607282] hover:bg-slate-100"
      >
        <LogOut size={18} />
        {t("logout")}
      </button>
    </>
  );
  return (
    <div className="min-h-screen bg-[#f7fafb]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#dce5eb] bg-white p-5 md:flex">
        {navigation}
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-[#011c30]/65 md:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="flex h-full w-72 flex-col bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            {navigation}
          </aside>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dce5eb] bg-white/95 px-4 backdrop-blur md:ml-64 md:px-8">
        <button
          className="rounded-lg p-2 md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>
        <div className="ml-auto text-right">
          <p className="text-sm font-black text-[#032e4d]">
            {overview.data?.user.display_name || "Learner"}
          </p>
          <p className="text-xs text-[#607282]">{overview.data?.user.email}</p>
        </div>
      </header>
      <main id="main-content" className="p-4 md:ml-64 md:p-8">
        {children}
      </main>
    </div>
  );
}
