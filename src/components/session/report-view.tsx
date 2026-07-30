"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { WebSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";
import { toast } from "@/lib/toast";

export function ReportView({ session }: { session: WebSession }) {
  const { t } = useI18n();
  const report = session.report;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!report) return null;
  async function retry() {
    setBusy(true);
    try {
      const result = await apiRequest<{ job_id: string }>(
        `/api/v1/sessions/${session.id}/retry`,
        {
          method: "POST",
          toast: { success: "Retry session is being prepared." },
        },
      );
      router.push(`/app/session?job=${result.job_id}`);
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not start retry.",
      );
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-5xl">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#032e4d] p-6 text-white sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="grid size-40 place-items-center rounded-full border-[12px] border-[#ff6b00] bg-white text-[#032e4d]">
            <div className="text-center">
              <p className="text-4xl font-black">{report.percentage}%</p>
              <p className="text-xs font-extrabold uppercase tracking-wider">
                {report.performance_label}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-widest text-[#ff9b52]">
              {t("report")}
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              {session.exam.confirmed_name}
            </h1>
            <p className="mt-3 text-lg text-[#d6e4ec]">
              {report.total_score} of {report.total_possible} points
            </p>
            {session.target_score && (
              <p className="mt-2 flex items-center gap-2 text-sm text-[#c7d8e4]">
                <Target size={17} />
                Your target was {session.target_score}%
              </p>
            )}
            <p className="mt-5 max-w-2xl leading-7 text-[#d6e4ec]">
              {report.motivational_note}
            </p>
          </div>
        </div>
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-xl font-black text-[#032e4d]">Topic breakdown</h2>
          <div className="mt-5 space-y-5">
            {report.topic_breakdown.map((topic) => (
              <div key={topic.topic}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="font-bold">{topic.topic}</span>
                  <span className="font-black text-[#032e4d]">
                    {topic.correct}/{topic.total} · {topic.percentage}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#dcebf4]">
                  <div
                    className={`h-full rounded-full ${topic.percentage >= 80 ? "bg-[#17885b]" : topic.percentage < 60 ? "bg-[#e85b00]" : "bg-[#07436c]"}`}
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-xl font-black text-[#032e4d]">Your focus map</h2>
          <div className="mt-5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#c94d00]">
              Needs another attempt
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {report.weak_areas.length ? (
                report.weak_areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-[#fff0e5] px-3 py-2 text-sm font-bold text-[#b94700]"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#607282]">
                  No weak areas identified.
                </span>
              )}
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#13734d]">
              Looking strong
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {report.strong_areas.length ? (
                report.strong_areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-[#e9f8f0] px-3 py-2 text-sm font-bold text-[#13734d]"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#607282]">
                  Keep building—strong areas will appear here.
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
      {report.wrong_answers_review.length > 0 && (
        <section className="card mt-6 p-6">
          <h2 className="text-xl font-black text-[#032e4d]">
            Questions to revisit
          </h2>
          <div className="mt-4 divide-y divide-[#dce5eb]">
            {report.wrong_answers_review.map((item) => (
              <details key={item.question_index} className="py-4">
                <summary className="cursor-pointer list-none font-black text-[#032e4d]">
                  Q{item.question_index} · {item.topic}
                </summary>
                <div className="mt-4 space-y-3 text-sm leading-6">
                  <p className="font-bold">{item.question}</p>
                  <p className="rounded-xl bg-red-50 p-3">
                    <strong>Your answer:</strong> {item.user_answer}
                  </p>
                  <p className="rounded-xl bg-emerald-50 p-3">
                    <strong>Correct answer:</strong> {item.correct_answer}
                  </p>
                  <p className="text-[#526877]">{item.explanation}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        {report.retry_recommended && (
          <Button onClick={retry} disabled={busy}>
            <RotateCcw size={17} />
            {busy ? "…" : t("retry")}
          </Button>
        )}
        <Link
          href="/app/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#c8d5dd] bg-white px-5 text-sm font-extrabold text-[#032e4d]"
        >
          {t("fresh")} <ArrowRight size={17} />
        </Link>
        <Link
          href="/app/history"
          className="inline-flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-extrabold text-[#607282]"
        >
          <CheckCircle2 size={17} />
          View history
        </Link>
      </div>
    </div>
  );
}
