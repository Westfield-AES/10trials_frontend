"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { Report } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";

interface StoredSession {
  id: string;
  exam_name: string;
  mode: string;
  format: string;
  difficulty?: string;
  num_questions: number;
  percentage?: number;
  score?: number;
  weak_areas?: unknown;
  strong_areas?: unknown;
  report?: unknown;
  completed_at?: string;
}

function storedJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function stringList(value: unknown) {
  const parsed = storedJson(value);
  return Array.isArray(parsed)
    ? parsed.filter((item): item is string => typeof item === "string")
    : [];
}

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const detail = useQuery({
    queryKey: ["history-detail", id],
    queryFn: () =>
      apiRequest<{ session: StoredSession }>(`/api/v1/sessions/${id}`),
  });
  if (detail.isLoading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner label="Opening report" />
      </div>
    );
  if (detail.isError)
    return (
      <section className="card mx-auto max-w-lg p-8 text-center">
        <h1 className="text-2xl font-black text-[#032e4d]">
          We couldn’t open this report
        </h1>
        <p className="mt-3 text-[#607282]">
          Check your connection, then try again.
        </p>
        <button
          className="mt-6 rounded-xl bg-[#ff6b00] px-5 py-3 font-extrabold text-white"
          onClick={() => detail.refetch()}
        >
          Try again
        </button>
      </section>
    );
  const item = detail.data?.session;
  if (!item) return <div className="card p-8">Report not found.</div>;
  const storedReport = storedJson(item.report);
  const report =
    storedReport &&
    typeof storedReport === "object" &&
    !Array.isArray(storedReport)
      ? (storedReport as Partial<Report>)
      : null;
  const topicBreakdown = Array.isArray(report?.topic_breakdown)
    ? report.topic_breakdown.filter(
        (topic): topic is Report["topic_breakdown"][number] =>
          Boolean(topic && typeof topic.topic === "string"),
      )
    : [];
  const weakAreas = stringList(report?.weak_areas ?? item.weak_areas);
  const strongAreas = stringList(report?.strong_areas ?? item.strong_areas);
  const wrongAnswers = Array.isArray(report?.wrong_answers_review)
    ? report.wrong_answers_review.filter(
        (entry): entry is Report["wrong_answers_review"][number] =>
          Boolean(entry && typeof entry.question_index === "number"),
      )
    : [];
  const motivationalNote =
    typeof report?.motivational_note === "string"
      ? report.motivational_note
      : "";
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/app/history"
        className="inline-flex items-center gap-2 text-sm font-black text-[#607282]"
      >
        <ChevronLeft size={17} />
        Back to history
      </Link>
      <section className="mt-5 rounded-xl bg-[#032e4d] p-7 text-white sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#ff9b52]">
          Completed report
        </p>
        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-black">{item.exam_name}</h1>
            <p className="mt-2 capitalize text-[#c7d8e4]">
              {item.mode} · {item.format} · {item.difficulty || "intermediate"}
            </p>
          </div>
          <p className="text-5xl font-black text-[#ff8a38]">
            {Math.round(item.percentage ?? 0)}%
          </p>
        </div>
      </section>
      {report ? (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="card p-6">
              <h2 className="text-xl font-black text-[#032e4d]">
                Topic performance
              </h2>
              <div className="mt-5 space-y-4">
                {topicBreakdown.length ? (
                  topicBreakdown.map((topic, index) => (
                    <div key={`${topic.topic}-${index}`}>
                      <div className="mb-2 flex justify-between text-sm font-bold">
                        <span>{topic.topic}</span>
                        <span>{Math.round(topic.percentage ?? 0)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#dcebf4]">
                        <div
                          className="h-full rounded-full bg-[#ff6b00]"
                          style={{
                            width: `${Math.max(0, Math.min(100, topic.percentage ?? 0))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[#607282]">
                    Topic-level results were not recorded for this session.
                  </p>
                )}
              </div>
            </section>
            <section className="card p-6">
              <h2 className="text-xl font-black text-[#032e4d]">Report note</h2>
              <p className="mt-4 leading-7 text-[#526877]">
                {motivationalNote ||
                  "A detailed report note was not recorded for this session."}
              </p>
              <h3 className="mt-6 text-xs font-black uppercase tracking-wider text-[#c94d00]">
                Weak areas
              </h3>
              <p className="mt-2 text-sm">
                {weakAreas.join(", ") || "None recorded"}
              </p>
              <h3 className="mt-5 text-xs font-black uppercase tracking-wider text-[#13734d]">
                Strong areas
              </h3>
              <p className="mt-2 text-sm">
                {strongAreas.join(", ") || "Still emerging"}
              </p>
            </section>
          </div>
          {wrongAnswers.length > 0 && (
            <section className="card mt-6 p-6">
              <h2 className="text-xl font-black text-[#032e4d]">Review</h2>
              {wrongAnswers.map((entry) => (
                <details
                  key={entry.question_index}
                  className="border-b border-[#dce5eb] py-4"
                >
                  <summary className="cursor-pointer font-black">
                    Q{entry.question_index} · {entry.topic}
                  </summary>
                  <div className="mt-3 space-y-3 text-sm leading-6">
                    <p>{entry.question}</p>
                    <p>
                      <strong>Your answer:</strong> {entry.user_answer}
                    </p>
                    <p>
                      <strong>Correct:</strong> {entry.correct_answer}
                    </p>
                    <p className="text-[#607282]">{entry.explanation}</p>
                  </div>
                </details>
              ))}
            </section>
          )}
        </>
      ) : (
        <section className="card mt-6 p-8 text-[#607282]">
          The summary is available, but this legacy session does not contain a
          full structured report.
        </section>
      )}
    </div>
  );
}
