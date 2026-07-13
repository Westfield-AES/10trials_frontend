"use client";

import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { formatDate, formatPercent } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/components/providers/i18n-provider";

interface Item {
  id: string;
  exam_name: string;
  mode: string;
  format: string;
  difficulty?: string;
  channel: string;
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
  if (history.isLoading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner label="Loading session history" />
      </div>
    );
  if (history.isError)
    return (
      <section className="card mx-auto max-w-lg p-8 text-center" role="alert">
        <h1 className="text-2xl font-black text-[#032e4d]">We couldn’t load your history</h1>
        <p className="mt-3 text-[#607282]">
          {history.error instanceof Error ? history.error.message : "Please try again."}
        </p>
        <button className="mt-6 rounded-xl bg-[#ff6b00] px-5 py-3 font-extrabold text-white" onClick={() => history.refetch()}>
          Try again
        </button>
      </section>
    );
  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Your attempts</p>
      <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
        {t("history")}
      </h1>
      <p className="mt-2 text-[#607282]">
        Web and WhatsApp reports live together under the same account.
      </p>
      <section className="card mt-8 overflow-hidden">
        <div className="divide-y divide-[#dce5eb]">
          {history.data?.sessions.length ? (
            history.data.sessions.map((item) => (
              <Link
                key={item.id}
                href={`/app/history/${item.id}`}
                className="grid gap-4 p-5 hover:bg-[#fbfdfd] md:grid-cols-[1fr_auto_auto_auto] md:items-center"
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
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#607282]">
                    {item.channel} · {item.mode} · {item.num_questions}{" "}
                    questions
                  </p>
                </div>
                <p className="text-sm text-[#607282]">
                  {formatDate(item.completed_at)}
                </p>
                <span className="w-fit rounded-full bg-[#f1f5f7] px-3 py-1 text-xs font-black capitalize text-[#526877]">
                  {item.difficulty || "intermediate"}
                </span>
                <span className="w-fit rounded-full bg-[#e9f8f0] px-3 py-1 text-sm font-black text-[#13734d]">
                  {formatPercent(item.percentage)}
                </span>
              </Link>
            ))
          ) : (
            <div className="p-12 text-center">
              <HistoryIcon className="mx-auto text-[#9eb0bc]" />
              <h2 className="mt-4 text-xl font-black text-[#032e4d]">
                Nothing here yet
              </h2>
              <p className="mt-2 text-[#607282]">
                Complete a session and its report will appear here.
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
