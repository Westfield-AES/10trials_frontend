"use client";

import { useAccount } from "@/lib/use-account";
import { signOut } from "firebase/auth";
import {
  CircleGauge,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { PageSkeleton, pageKind } from "@/components/app/loading-skeleton";
import { useI18n } from "@/components/providers/i18n-provider";
import { firebaseErrorMessage } from "@/lib/firebase-errors";
import { toast } from "@/lib/toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [restoring, setRestoring] = useState(false);
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
  const overview = useAccount();
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
  if (
    overview.isError &&
    (!overview.data ||
      (overview.error instanceof ApiError && overview.error.status === 401))
  ) {
    const authFailure =
      overview.error instanceof ApiError && overview.error.status === 401;
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffaf5] p-6">
        <section className="card max-w-lg p-8 text-center">
          <h1 className="text-2xl font-black text-[#032e4d]">
            {authFailure
              ? "Your session has expired"
              : "We couldn’t open your account"}
          </h1>
          <p className="mt-3 leading-7 text-[#607282]">
            {authFailure
              ? "Sign in again to keep your account secure."
              : "Check your connection, then try again."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {authFailure ? (
              <button
                className="rounded-xl bg-[#ff6b00] px-5 py-3 font-extrabold text-white"
                onClick={async () => {
                  try {
                    await signOut(auth);
                    toast.info("You’ve been signed out.");
                    router.replace("/login");
                  } catch (error) {
                    toast.error(firebaseErrorMessage(error));
                  }
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
  if (overview.data && overview.data.user.status !== "active") {
    const restorable = overview.data?.user.status === "soft_deleted";
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffaf5] p-6">
        <section className="card max-w-lg p-8 text-center">
          <h1 className="text-2xl font-black text-[#032e4d]">
            {restorable
              ? "Your account is deleted"
              : "This account is unavailable"}
          </h1>
          <p className="mt-3 leading-7 text-[#607282]">
            {restorable
              ? "Restore your account to continue learning."
              : "Contact support if you believe this account status is incorrect."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {restorable && (
              <button
                disabled={restoring}
                className="rounded-xl bg-[#ff6b00] px-5 py-3 font-extrabold text-white disabled:opacity-60"
                onClick={async () => {
                  setRestoring(true);
                  try {
                    await apiRequest("/api/v1/account/me/restore", {
                      method: "POST",
                      toast: { success: "Your account has been restored." },
                    });
                    await overview.refetch();
                  } catch (nextError) {
                    toast.error(
                      nextError instanceof Error
                        ? nextError.message
                        : "Could not restore the account.",
                    );
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
                try {
                  await signOut(auth);
                  toast.info("You’ve been signed out.");
                  router.replace("/");
                } catch (error) {
                  toast.error(firebaseErrorMessage(error));
                }
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
      <div className="mb-8 hidden items-center justify-between md:flex">
        <Logo href="/app" />
      </div>
      <nav className="space-y-1" aria-label="Application navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/app" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors",
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
      {overview.data ? (
        <div className="mt-8 rounded-2xl bg-[#032e4d] p-4 text-white md:mt-auto">
          <CircleGauge className="text-[#ff8a38]" />
          <p className="mt-3 text-sm font-black">
            {overview.data?.user.entitlement_tier === "trial"
              ? "Trial plan"
              : overview.data?.user.entitlement_tier === "pro"
                ? "Pro plan"
                : "Free plan"}
          </p>
          <p className="mt-1 text-xs text-[#c7d8e4]">
            {overview.data?.usage.sessions ?? 0} of{" "}
            {overview.data?.entitlements.session_limit ?? 5} sessions used
            {overview.data?.entitlements.usage_period === "lifetime"
              ? ""
              : " · this month"}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-[#ff6b00]"
              style={{
                width: `${Math.min(100, ((overview.data?.usage.sessions ?? 0) / (overview.data?.entitlements.session_limit ?? 5)) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="mt-auto h-32 rounded-2xl bg-[#edf3f6] motion-safe:animate-pulse"
        />
      )}
      <button
        onClick={async () => {
          try {
            await signOut(auth);
            toast.info("You’ve been signed out.");
            router.push("/");
          } catch (error) {
            toast.error(firebaseErrorMessage(error));
          }
        }}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#607282] hover:bg-slate-100"
      >
        <LogOut size={18} />
        {t("logout")}
      </button>
    </>
  );
  return (
    <div className="min-h-dvh bg-[#f7f9fb]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#dce5eb] bg-white p-5 md:flex">
        {navigation}
      </aside>
      <header className="app-header sticky top-0 z-30 flex h-18 items-center justify-between gap-3 border-b border-[#dce5eb]/70 bg-white/95 px-5 backdrop-blur-xl md:ml-64 md:px-8">
        <div className="md:hidden">
          <Logo href="/app" />
        </div>
        <p className="hidden text-sm font-semibold text-[#607282] md:block">
          {links.find(({ href }) =>
            href === "/app" ? pathname === href : pathname.startsWith(href),
          )?.label || "Practice session"}
        </p>
        {overview.data ? (
          <div className="ml-auto hidden min-w-0 text-right md:block">
            <p className="text-sm font-black text-[#032e4d]">
              {overview.data?.user.display_name || "Candidate"}
            </p>
            <p className="max-w-64 truncate text-xs text-[#607282]">
              {overview.data?.user.email}
            </p>
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="ml-auto hidden h-8 w-32 rounded-lg bg-[#edf3f6] motion-safe:animate-pulse md:block"
          />
        )}
        <div className="flex items-center gap-2">
          <Link
            href="/app/settings"
            aria-label="Your profile and settings"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#edcbb3] bg-[#fff0e5] text-sm font-bold text-[#b94700]"
          >
            {overview.data?.user.display_name
              ?.trim()
              .slice(0, 1)
              .toUpperCase() || "C"}
          </Link>
        </div>
      </header>
      <main
        id="main-content"
        className="app-content px-5 pt-7 md:ml-64 md:px-8 md:pt-9"
      >
        {overview.data?.user.age_confirmed ? (
          children
        ) : (
          <PageSkeleton kind={pageKind(pathname)} />
        )}
      </main>
      <nav
        aria-label="Mobile application navigation"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#dce5eb] bg-white/95 px-2 pt-2 shadow-[0_-4px_24px_rgba(3,46,77,0.04)] backdrop-blur-xl md:hidden"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/app"
              ? pathname === href
              : pathname.startsWith(href) ||
                (href === "/app/new" && pathname === "/app/session");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-center text-[10px] font-semibold leading-tight transition-colors",
                active
                  ? "bg-[#fff0e5] text-[#b94700]"
                  : "text-[#607282] hover:bg-[#f4f8fa]",
              )}
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.4 : 1.8}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
