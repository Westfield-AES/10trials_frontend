"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Clock3, FileSearch, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, ApiError, waitForJob } from "@/lib/api";
import type { WebSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EstimatedProgress } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/app/loading-skeleton";
import { QuestionPlayer } from "@/components/session/question-player";
import { ReportView } from "@/components/session/report-view";
import { useI18n } from "@/components/providers/i18n-provider";
import { toast } from "@/lib/toast";

export default function SessionPage() {
  const { t } = useI18n();
  const client = useQueryClient();
  const [jobProgress, setJobProgress] = useState<{
    id: string;
    value: number;
  } | null>(null);
  const [abandon, setAbandon] = useState(false);
  const [starting, setStarting] = useState(false);
  const session = useQuery({
    queryKey: ["active-session"],
    queryFn: () =>
      apiRequest<WebSession>("/api/v1/sessions/active", {
        toast: {
          error: (error) =>
            !(error instanceof ApiError && error.status === 404),
        },
      }),
    retry: false,
    refetchOnMount: "always",
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
      if (active && !["failed", "cancelled"].includes(job.status))
        setJobProgress((previous) => ({
          id: watchedJob,
          value: Math.max(
            previous?.id === watchedJob ? previous.value : 0,
            job.progress,
          ),
        }));
    })
      .then(async () => {
        if (active)
          await Promise.all([
            client.invalidateQueries({ queryKey: ["active-session"] }),
            client.invalidateQueries({ queryKey: ["account"] }),
          ]);
      })
      .catch((nextError) => {
        if (active) {
          toast.error(
            nextError instanceof Error
              ? nextError.message
              : "Could not finish this session operation.",
          );
          client.invalidateQueries({ queryKey: ["active-session"] });
        }
      });
    return () => {
      active = false;
    };
  }, [client, watchedJob]);
  useEffect(() => {
    if (current?.status === "failed") {
      toast.error(
        current.error_message ||
          "We couldn’t generate this session. Adjust the setup and try again.",
      );
    }
  }, [current?.error_message, current?.status]);

  if (session.isLoading) return <PageSkeleton kind="session" />;
  if (session.error instanceof ApiError && session.error.status === 404)
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="card p-9">
          <FileSearch className="mx-auto text-[#e85b00]" />
          <h1 className="mt-4 text-3xl font-black text-[#032e4d]">
            No active session
          </h1>
          <Link
            href="/app/new"
            className="mt-6 inline-flex rounded-xl bg-[#ff6b00] px-6 py-3 font-extrabold text-white"
          >
            Create a session
          </Link>
        </div>
      </div>
    );
  if (session.isError && !current)
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <h1 className="text-2xl font-black text-[#032e4d]">
          We couldn’t open this session
        </h1>
        <p className="mt-3 text-[#607282]">
          Check your connection, then try again.
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
    if (starting) return;
    setStarting(true);
    try {
      await apiRequest(`/api/v1/sessions/${sessionId}/start`, {
        method: "POST",
        toast: { success: "Session started." },
      });
      await refresh();
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not start the session.",
      );
    } finally {
      setStarting(false);
    }
  }
  async function confirmAbandon() {
    try {
      await apiRequest(`/api/v1/sessions/${sessionId}`, {
        method: "DELETE",
        toast: { success: "Session cleared." },
      });
      await client.invalidateQueries({ queryKey: ["account"] });
      window.location.href = "/app/new";
    } catch (nextError) {
      setAbandon(false);
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not abandon the session.",
      );
    }
  }
  if (current.status === "generating" || current.status === "grading")
    return (
      <div className="mx-auto max-w-2xl py-16">
        <section className="card p-8 text-center sm:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#fff0e5] text-[#e85b00]">
            {current.status === "generating" ? (
              <FileSearch size={30} />
            ) : (
              <Clock3 size={30} />
            )}
          </div>
          <h1 className="mt-5 text-3xl font-black text-[#032e4d]">
            {current.status === "generating" ? t("generating") : t("grading")}
          </h1>
          <div className="mt-7 text-left">
            <EstimatedProgress
              key={watchedJob ?? current.status}
              value={Math.min(
                jobProgress && jobProgress.id === watchedJob
                  ? jobProgress.value
                  : 5,
                95,
              )}
              label={t("progress")}
            />
          </div>
          <button
            className="mt-6 text-sm font-bold text-[#607282] underline"
            onClick={() => setAbandon(true)}
          >
            Cancel this session
          </button>
        </section>
        <Modal
          open={abandon}
          title="Cancel this session?"
          onClose={() => setAbandon(false)}
        >
          <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-900">
            <AlertTriangle className="shrink-0" />
            <p className="text-sm leading-6">
              Generated questions still count toward your allowance.
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setAbandon(false)}>
              Keep session
            </Button>
            <Button variant="danger" onClick={confirmAbandon}>
              Cancel session
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
                ? current.config.timer_seconds
                  ? "The timer starts when you begin. Closing the browser won’t pause it."
                  : "Review your answers before submitting. Submission is final."
                : "Answers lock after grading. You can still review the feedback."}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={start} disabled={starting}>
                <Play size={17} />
                {starting ? "Starting your session…" : t("start")}
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
            Generated questions still count toward your allowance if you discard
            this session.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setAbandon(false)}>
              Keep session
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
      <div className="card mx-auto max-w-lg p-8 text-center">
        <AlertTriangle className="mx-auto text-red-600" />
        <h1 className="mt-4 text-2xl font-black text-[#032e4d]">
          We couldn’t generate this session
        </h1>
        <p className="mt-3 leading-7 text-[#607282]">
          Please adjust the setup and try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="danger" onClick={confirmAbandon}>
            Clear session
          </Button>
          <Link
            className="rounded-xl px-5 py-3 font-extrabold text-[#e85b00]"
            href="/app/new"
          >
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
