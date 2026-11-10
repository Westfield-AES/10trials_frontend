"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, History as HistoryIcon } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { formatDate, formatPercent } from "@/lib/utils";
import { PageSkeleton } from "@/components/app/loading-skeleton";
import { useI18n } from "@/components/providers/i18n-provider";

interface Item {
  id: string;
  exam_name: string;
  mode: string;
  format: string;
  difficulty?: string;
  status: string;
  num_questions: number;
  percentage?: number;
  is_retry: boolean;
  completed_at?: string;
}

export default function HistoryPage() {
  const { t } = useI18n();
  const history = useQuery({
    queryKey: ["history", 100],
    queryFn: () =>
      apiRequest<{ sessions: Item[] }>("/api/v1/history?limit=100"),
  });
  if (history.isLoading) return <PageSkeleton kind="history" />;
  if (history.isError && !history.data)
    return (
      <section className="card mx-auto max-w-lg p-8 text-center">
        <h1 className="text-2xl font-black text-[#032e4d]">
          We couldn’t load your history
        </h1>
        <p className="mt-3 text-[#607282]">
          Check your connection, then try again.
        </p>
        <button
          className="mt-6 rounded-xl bg-[#ff6b00] px-5 py-3 font-extrabold text-white"
          onClick={() => history.refetch()}
        >
          Try again
        </button>
      </section>
    );
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
        {t("history")}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[#607282]">
        Every attempt is a step forward. See what you’ve learned.
      </p>
      <section className="card mt-8 overflow-hidden">
        <div className="divide-y divide-[#dce5eb]">
          {history.data?.sessions.length ? (
            history.data.sessions.map((item) => (
              <Link
                key={item.id}
                href={`/app/history/${item.id}`}
                className="group grid grid-cols-[1fr_auto] items-center gap-3 p-5 transition-colors hover:bg-[#f7f9fb] md:grid-cols-[1fr_auto_auto_auto] md:gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-[#032e4d]">
                      {item.exam_name}
                    </p>
                    {item.is_retry && (
                      <span className="rounded-full bg-[#fff0e5] px-2 py-1 text-[10px] font-black uppercase text-[#c94d00]">
                        Retry
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs capitalize leading-5 text-[#607282]">
                    {item.mode} · {item.num_questions} questions
                  </p>
                  <p className="mt-1 text-xs text-[#607282] md:hidden">
                    {formatDate(item.completed_at)}
                  </p>
                </div>
                <p className="hidden text-sm text-[#607282] md:block">
                  {formatDate(item.completed_at)}
                </p>
                <span className="hidden w-fit rounded-full bg-[#f1f5f7] px-3 py-1 text-xs font-semibold capitalize text-[#526877] md:block">
                  {item.difficulty || "intermediate"}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-[#e9f8f0] px-3 py-2 text-sm font-bold text-[#13734d]">
                  {formatPercent(item.percentage)}
                  <ChevronRight size={14} aria-hidden="true" />
                </span>
              </Link>
            ))
          ) : (
            <div className="p-12 text-center">
              <HistoryIcon className="mx-auto text-[#9eb0bc]" />
              <h2 className="mt-4 text-xl font-black text-[#032e4d]">
                No completed sessions yet
              </h2>
              <p className="mt-2 text-[#607282]">
                Your reports will appear here.
              </p>
              <Link
                href="/app/new"
                className="mt-5 inline-block font-black text-[#e85b00]"
              >
                Start practising
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
