"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { useAccount } from "@/lib/use-account";
import { PracticeJourneyCard } from "@/components/app/practice-journey";
import { ActiveSessionCard } from "@/components/app/active-session-card";
import { practiceAction } from "@/lib/practice-flow";
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
  const account = useAccount();
  const history = useQuery({
    queryKey: ["history", 5],
    queryFn: () =>
      apiRequest<{ sessions: HistoryItem[] }>("/api/v1/history?limit=5"),
  });
  const active = account.data?.journey.has_active_session
    ? account.data.active_session
    : null;
  const nextAction = practiceAction(account.data?.journey);
  const bestScore = history.data?.sessions.length
    ? Math.max(...history.data.sessions.map((item) => item.percentage ?? 0))
    : null;
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#607282]">
            {t("welcome")}
          </p>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-[#032e4d] sm:text-4xl">
            {account.data?.user.display_name?.split(" ")[0] || "candidate"}.
          </h1>
        </div>
      </div>
      {!active && (
        <section className="relative mt-6 overflow-hidden rounded-3xl bg-[#032e4d] p-6 text-white sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-12 size-64 rounded-full border-[28px] border-white/[0.035]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 top-2 size-38 rounded-full border-[22px] border-white/[0.035]"
          />
          <div className="relative max-w-lg">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#ffb580]">
              <Sparkles size={15} /> Built around your next exam
            </span>
            <h2 className="mt-4 max-w-sm text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              Make your next attempt count.
            </h2>
            <Link
              href={nextAction.href}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-[#e85b00] px-5 text-sm font-bold text-white shadow-[0_3px_0_#b94700] transition hover:bg-[#c94d00] sm:w-auto sm:min-w-52"
            >
              {nextAction.label} <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}
      {active && (
        <div className="mt-6">
          <ActiveSessionCard session={active} />
        </div>
      )}
      <div className="mt-5">
        <PracticeJourneyCard account={account.data} showAction={false} />
      </div>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#032e4d]">
              {t("recentAttempts")}
            </h2>
            {bestScore !== null && (
              <p className="mt-1 text-xs text-[#607282]">
                {t("bestScore")}:{" "}
                <span className="font-semibold text-[#07436c]">
                  {formatPercent(bestScore)}
                </span>
              </p>
            )}
          </div>
          <Link
            href="/app/history"
            className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-bold text-[#b94700]"
          >
            {t("viewAll")} <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="card divide-y divide-[#dce5eb]/70 overflow-hidden">
          {history.isLoading ? (
            <div
              role="status"
              aria-label="Loading recent attempts"
              className="space-y-4 p-5 motion-safe:animate-pulse"
            >
              <div className="h-5 w-2/5 rounded-lg bg-[#dce8ee]" />
              <div className="h-4 w-1/4 rounded-lg bg-[#dce8ee]" />
            </div>
          ) : history.isError && !history.data ? (
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
                className="group flex items-center gap-3 p-4 transition-colors hover:bg-[#f7f9fb] sm:gap-4 sm:p-5"
              >
                <div className="hidden size-11 shrink-0 place-items-center rounded-xl bg-[#edf3f6] text-[#07436c] sm:grid">
                  <BookOpen size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-6 text-[#032e4d]">
                    {item.exam_name}
                  </p>
                  <p className="mt-1 text-xs capitalize leading-5 text-[#607282]">
                    {item.mode} · {item.difficulty || "intermediate"}
                  </p>
                  <p className="mt-1 text-xs text-[#607282]">
                    {formatDate(item.completed_at)}
                  </p>
                </div>
                <span className="grid size-13 shrink-0 place-items-center rounded-full border-4 border-[#ffdcc2] bg-[#fff7f0] text-xs font-bold text-[#a94100]">
                  {formatPercent(item.percentage)}
                </span>
                <ChevronRight
                  size={16}
                  className="hidden shrink-0 text-[#8b9aa5] sm:block"
                />
              </Link>
            ))
          ) : (
            <div className="px-6 py-9 text-center text-[#607282]">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#edf3f6] text-[#07436c]">
                <BookOpen size={22} />
              </span>
              <h3 className="mt-4 font-bold text-[#032e4d]">
                Your progress starts here
              </h3>
              <p className="mt-2 text-sm leading-6">
                Complete your first session to see your report and discover what
                to practise next.
              </p>
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
