"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ClipboardCheck,
  Target,
} from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import type { AccountOverview } from "@/lib/types";
import { formatDate, formatPercent } from "@/lib/utils";
import { InstallPrompt } from "@/components/site/install-prompt";
import { useI18n } from "@/components/providers/i18n-provider";

interface HistoryItem {
  id: string;
  exam_name: string;
  mode: string;
  percentage?: number;
  completed_at?: string;
  difficulty?: string;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const account = useQuery({
    queryKey: ["account"],
    queryFn: () => apiRequest<AccountOverview>("/api/v1/account/me"),
  });
  const history = useQuery({
    queryKey: ["history", 5],
    queryFn: () =>
      apiRequest<{ sessions: HistoryItem[] }>("/api/v1/history?limit=5"),
  });
  const active = account.data?.active_session;
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Preparation overview</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
            {t("welcome")},{" "}
            {account.data?.user.display_name?.split(" ")[0] || "candidate"}.
          </h1>
          <p className="mt-2 text-[#607282]">{t("welcomeBody")}</p>
        </div>
        <Link
          href="/app/new"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-6 font-extrabold text-white"
        >
          {t("startSession")} <ArrowRight size={18} />
        </Link>
      </div>
      {active && (
        <section className="mt-8 rounded-2xl bg-[#032e4d] p-6 text-white">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#ff9b52]">
                Resume your session
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {active.exam_name || "Your generated session"}
              </h2>
              <p className="mt-1 text-sm text-[#c7d8e4]">
                Status: {active.status}
              </p>
            </div>
            <Link
              href="/app/session"
              className="rounded-xl bg-white px-5 py-3 text-center font-extrabold text-[#032e4d]"
            >
              {t("continue")}
            </Link>
          </div>
        </section>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: ClipboardCheck,
            label: t("sessionsUsed"),
            value: `${account.data?.usage.sessions ?? 0}/${account.data?.entitlements.sessions_per_month ?? 10}`,
            color: "bg-[#e8f3fa] text-[#07436c]",
          },
          {
            icon: Target,
            label: t("questionsUsed"),
            value: `${account.data?.usage.questions ?? 0}/${account.data?.entitlements.questions_per_month ?? 50}`,
            color: "bg-[#fff0e5] text-[#e85b00]",
          },
          {
            icon: BarChart3,
            label: t("bestScore"),
            value: formatPercent(
              Math.max(
                0,
                ...(history.data?.sessions.map(
                  (item) => item.percentage ?? 0,
                ) ?? [0]),
              ),
            ),
            color: "bg-[#e9f8f0] text-[#17885b]",
          },
          {
            icon: BadgeCheck,
            label: t("plan"),
            value:
              account.data?.user.entitlement_tier === "trial"
                ? "Trial"
                : account.data?.user.entitlement_tier === "pro"
                  ? "Pro"
                  : "Free",
            color: "bg-[#edf3f6] text-[#07436c]",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <article key={label} className="card p-5">
            <div
              className={`grid size-10 place-items-center rounded-xl ${color}`}
            >
              <Icon size={20} />
            </div>
            <p className="mt-4 text-2xl font-black text-[#032e4d]">{value}</p>
            <p className="mt-1 text-sm font-bold text-[#607282]">{label}</p>
          </article>
        ))}
      </div>
      <section className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#dce5eb] p-5">
          <div>
            <h2 className="text-xl font-black text-[#032e4d]">
              {t("recentAttempts")}
            </h2>
            <p className="mt-1 text-sm text-[#607282]">
              Every result is a clue for the next session.
            </p>
          </div>
          <Link
            href="/app/history"
            className="text-sm font-extrabold text-[#e85b00]"
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="divide-y divide-[#dce5eb]">
          {history.isError ? (
            <div className="p-8 text-center text-[#607282]">
              <p>Recent attempts are temporarily unavailable.</p>
              <button
                className="mt-3 font-black text-[#e85b00]"
                onClick={() => history.refetch()}
              >
                Try again
              </button>
            </div>
          ) : history.data?.sessions.length ? (
            history.data.sessions.map((item) => (
              <Link
                key={item.id}
                href={`/app/history/${item.id}`}
                className="grid gap-3 p-5 hover:bg-[#fbfdfd] sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div>
                  <p className="font-black text-[#032e4d]">{item.exam_name}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#607282]">
                    {item.mode} · {item.difficulty || "intermediate"}
                  </p>
                </div>
                <p className="text-sm text-[#607282]">
                  {formatDate(item.completed_at)}
                </p>
                <span className="w-fit rounded-full bg-[#fff0e5] px-3 py-1 text-sm font-black text-[#c94d00]">
                  {formatPercent(item.percentage)}
                </span>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-[#607282]">
              No completed sessions yet. Your first report will appear here.
            </div>
          )}
        </div>
      </section>
      <div className="mt-8">
        <InstallPrompt />
      </div>
    </div>
  );
}
