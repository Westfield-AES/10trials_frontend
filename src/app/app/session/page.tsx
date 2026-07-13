"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Clock3, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, ApiError, waitForJob } from "@/lib/api";
import type { WebSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { QuestionPlayer } from "@/components/session/question-player";
import { ReportView } from "@/components/session/report-view";
import { useI18n } from "@/components/providers/i18n-provider";

export default function SessionPage() {
  const { t } = useI18n();
  const client = useQueryClient();
  const [jobProgress, setJobProgress] = useState(0);
  const [abandon, setAbandon] = useState(false);
  const [error, setError] = useState("");
  const session = useQuery({
    queryKey: ["active-session"],
    queryFn: () => apiRequest<WebSession>("/api/v1/sessions/active"),
    retry: false,
    refetchInterval: (query) =>
      ["generating", "grading"].includes(query.state.data?.status ?? "")
        ? 2000
        : query.state.data?.status === "active" &&
            Boolean(query.state.data.timer_deadline)
          ? 5000
          : false,
  });
  const current = session.data;
  const watchedJob =
    current?.status === "generating"
      ? current.generation_job_id
      : current?.status === "grading"
        ? current.grading_job_id
        : null;
  useEffect(() => {
    if (!watchedJob) return;
    let active = true;
    waitForJob(watchedJob, (job) => {
      if (active) setJobProgress(job.progress);
    })
      .then(async () => {
        if (active)
          await client.invalidateQueries({ queryKey: ["active-session"] });
      })
      .catch((nextError) => {
        if (active) {
          setError(nextError.message);
          client.invalidateQueries({ queryKey: ["active-session"] });
        }
      });
    return () => {
      active = false;
    };
  }, [client, watchedJob]);

  if (session.isLoading)
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <Spinner label="Opening your session" />
      </div>
    );
  if (session.error instanceof ApiError && session.error.status === 404)
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="card p-9">
          <Sparkles className="mx-auto text-[#ff6b00]" />
          <h1 className="mt-4 text-3xl font-black text-[#032e4d]">
            No active session
          </h1>
          <p className="mt-3 text-[#607282]">
            Choose an exam and shape your next attempt.
          </p>
          <Link
            href="/app/new"
            className="mt-6 inline-flex rounded-xl bg-[#ff6b00] px-6 py-3 font-extrabold text-white"
          >
            Create a session
          </Link>
        </div>
      </div>
    );
  if (session.isError)
    return (
      <div className="card mx-auto max-w-lg p-8 text-center" role="alert">
        <h1 className="text-2xl font-black text-[#032e4d]">
          We couldn’t open this session
        </h1>
        <p className="mt-3 text-[#607282]">
          {session.error instanceof Error
            ? session.error.message
            : "Please try again."}
        </p>
        <Button className="mt-6" onClick={() => session.refetch()}>
          Try again
        </Button>
      </div>
    );
  if (!current) return null;
  async function refresh() {
    return session.refetch();
  }
  const sessionId = current.id;
  async function start() {
    setError("");
    try {
      await apiRequest(`/api/v1/sessions/${sessionId}/start`, { method: "POST" });
      await refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not start the session.");
    }
  }
  async function confirmAbandon() {
    setError("");
    try {
      await apiRequest(`/api/v1/sessions/${sessionId}`, { method: "DELETE" });
      await client.invalidateQueries({ queryKey: ["account"] });
      window.location.href = "/app/new";
    } catch (nextError) {
      setAbandon(false);
      setError(nextError instanceof Error ? nextError.message : "Could not abandon the session.");
    }
  }
  if (current.status === "generating" || current.status === "grading")
    return (
      <div className="mx-auto max-w-2xl py-16">
        <section className="card p-8 text-center sm:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#fff0e5] text-[#e85b00]">
            {current.status === "generating" ? (
              <Sparkles size={30} />
            ) : (
              <Clock3 size={30} />
            )}
          </div>
          <h1 className="mt-5 text-3xl font-black text-[#032e4d]">
            {current.status === "generating" ? t("generating") : t("grading")}
          </h1>
          <p className="mx-auto mt-3 max-w-lg leading-7 text-[#607282]">
            {current.status === "generating"
              ? "We’re matching the questions to your exam, topics, year, and difficulty."
              : "Your answers are being evaluated and turned into a focused report."}
          </p>
          <div className="mt-7 text-left">
            <Progress value={jobProgress || 5} label={t("progress")} />
          </div>
          {error && (
            <p className="mt-4 text-sm font-bold text-red-700">{error}</p>
          )}
          <button
            className="mt-6 text-sm font-bold text-[#607282] underline"
            onClick={() => setAbandon(true)}
          >
            Cancel this session
          </button>
        </section>
        <Modal
          open={abandon}
          title="Abandon this session?"
          onClose={() => setAbandon(false)}
        >
          <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-900">
            <AlertTriangle className="shrink-0" />
            <p className="text-sm leading-6">
              Once questions have been generated, this session still counts
              against your monthly allowance.
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setAbandon(false)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={confirmAbandon}>
              Abandon
            </Button>
          </div>
        </Modal>
      </div>
    );
  if (current.status === "ready")
    return (
      <div className="mx-auto max-w-3xl py-10">
        <section className="card overflow-hidden">
          <div className="bg-[#032e4d] p-7 text-white">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#ff9b52]">
              Your session is ready
            </p>
            <h1 className="mt-2 text-3xl font-black">
              {current.exam.confirmed_name}
            </h1>
            <p className="mt-2 text-[#c7d8e4]">{current.exam.governing_body}</p>
          </div>
          <div className="grid gap-4 p-7 sm:grid-cols-2">
            <Info label={t("mode")} value={current.config.mode} />
            <Info
              label={t("questions")}
              value={String(current.questions.length)}
            />
            <Info label={t("difficulty")} value={current.difficulty} />
            <Info
              label={t("target")}
              value={
                current.target_score ? `${current.target_score}%` : "Not set"
              }
            />
            <Info label={t("format")} value={current.config.format} />
            <Info
              label={t("timer")}
              value={
                current.config.timer_seconds
                  ? `${Math.round(current.config.timer_seconds / 60)} minutes`
                  : "No timer"
              }
            />
          </div>
          <div className="border-t border-[#dce5eb] p-7">
            <p className="text-sm leading-6 text-[#607282]">
              {current.config.mode === "simulate"
                ? "The timer starts only when you press Start. Closing the browser will not pause it."
                : "Answers lock after grading, but you can review previous feedback throughout the session."}
            </p>
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={start}>
                <Play size={17} />
                {t("start")}
              </Button>
              <Button variant="ghost" onClick={() => setAbandon(true)}>
                {t("abandon")}
              </Button>
            </div>
          </div>
        </section>
        <Modal
          open={abandon}
          title="Discard this generated session?"
          onClose={() => setAbandon(false)}
        >
          <p className="leading-7 text-[#607282]">
            This generated session has already used part of your monthly
            allowance. Discarding it will not refund that usage.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setAbandon(false)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={confirmAbandon}>
              Discard
            </Button>
          </div>
        </Modal>
      </div>
    );
  if (current.status === "completed") return <ReportView session={current} />;
  if (current.status === "active")
    return <QuestionPlayer session={current} onRefresh={refresh} />;
  if (current.status === "failed")
    return (
      <div className="card mx-auto max-w-lg p-8 text-center" role="alert">
        <AlertTriangle className="mx-auto text-red-600" />
        <h1 className="mt-4 text-2xl font-black text-[#032e4d]">
          We couldn’t generate this session
        </h1>
        <p className="mt-3 leading-7 text-[#607282]">
          {error || current.error_message || "Please adjust the setup and try again."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="danger" onClick={confirmAbandon}>
            Clear session
          </Button>
          <Link className="rounded-xl px-5 py-3 font-extrabold text-[#e85b00]" href="/app/new">
            Back to setup
          </Link>
        </div>
      </div>
    );
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-black text-[#032e4d]">
        This session is {current.status}
      </h1>
      <Link
        href="/app/new"
        className="mt-5 inline-block font-black text-[#e85b00]"
      >
        Start another session
      </Link>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f4f8fa] p-4">
      <p className="text-xs font-extrabold uppercase tracking-wider text-[#607282]">
        {label}
      </p>
      <p className="mt-1 font-black capitalize text-[#032e4d]">{value}</p>
    </div>
  );
}
