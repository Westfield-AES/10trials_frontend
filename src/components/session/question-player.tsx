"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flag, Send, Timer } from "lucide-react";
import { apiRequest, waitForJob } from "@/lib/api";
import type { SessionAnswer, WebSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/components/providers/i18n-provider";

export function QuestionPlayer({
  session,
  onRefresh,
}: {
  session: WebSession;
  onRefresh: () => Promise<unknown>;
}) {
  const { t } = useI18n();
  const question = session.questions[session.current_question_index];
  const existing = session.answers.find(
    (item) => item.question_index === question?.index,
  );
  const [answer, setAnswer] = useState(existing?.user_answer ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [feedback, setFeedback] = useState<SessionAnswer | null>(null);
  const [remaining, setRemaining] = useState(() =>
    session.timer_deadline
      ? Math.max(0, session.timer_deadline - Math.floor(Date.now() / 1000))
      : null,
  );
  useEffect(() => {
    const timer = window.setTimeout(
      () => setAnswer(existing?.user_answer ?? ""),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [existing?.user_answer, question?.index]);
  useEffect(() => {
    if (!session.timer_deadline) return;
    const tick = () =>
      setRemaining(
        Math.max(0, session.timer_deadline! - Math.floor(Date.now() / 1000)),
      );
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [session.timer_deadline]);
  useEffect(() => {
    if (remaining === 0) void onRefresh();
  }, [onRefresh, remaining]);
  const answered = useMemo(
    () => new Set(session.answers.map((item) => item.question_index)),
    [session.answers],
  );
  if (!question) return null;

  async function saveAnswer(value = answer) {
    if (!value.trim()) return false;
    setBusy(true);
    setError("");
    setFeedback(null);
    try {
      const result = await apiRequest<{ job_id?: string }>(
        `/api/v1/sessions/${session.id}/answers`,
        {
          method: "POST",
          body: JSON.stringify({
            question_index: question.index,
            answer: value,
          }),
        },
      );
      if (result.job_id) {
        const job = await waitForJob<{ evaluation?: SessionAnswer }>(
          result.job_id,
        );
        if (job.status === "failed")
          throw new Error(job.error_message || "Could not grade the answer.");
        if (job.result?.evaluation) setFeedback(job.result.evaluation);
      }
      await onRefresh();
      return true;
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not save the answer.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function navigate(index: number) {
    setError("");
    try {
      await apiRequest(`/api/v1/sessions/${session.id}/navigate`, {
        method: "POST",
        body: JSON.stringify({ question_index: index }),
      });
      await onRefresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not change questions.");
    }
  }
  async function flag() {
    setError("");
    try {
      await apiRequest(`/api/v1/sessions/${session.id}/flag`, {
        method: "POST",
        body: JSON.stringify({
          question_index: question.index,
          flagged: !session.flagged_question_indices.includes(question.index),
        }),
      });
      await onRefresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update the flag.");
    }
  }
  async function submitAll() {
    setBusy(true);
    setConfirmSubmit(false);
    try {
      await apiRequest(`/api/v1/sessions/${session.id}/submit`, {
        method: "POST",
      });
      await onRefresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Could not submit.",
      );
      setBusy(false);
    }
  }
  const minutes = remaining == null ? null : Math.floor(remaining / 60);
  const seconds = remaining == null ? null : remaining % 60;
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#e85b00]">
            {session.exam.confirmed_name}
          </p>
          <h1 className="mt-1 text-2xl font-black text-[#032e4d]">
            {t("question")} {question.index} / {session.questions.length}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {remaining != null && (
            <span
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black ${remaining < 300 ? "bg-red-50 text-red-700" : "bg-[#e8f3fa] text-[#07436c]"}`}
            >
              <Timer size={17} />
              {minutes}:{String(seconds).padStart(2, "0")}
            </span>
          )}
          <span className="rounded-xl bg-[#fff0e5] px-3 py-2 text-sm font-black capitalize text-[#b94700]">
            {session.config.mode}
          </span>
        </div>
      </div>
      <Progress
        value={(answered.size / session.questions.length) * 100}
        label={`${answered.size} ${t("answered")}`}
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_260px]">
        <section className="card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#e85b00]">
                {question.topic}
              </p>
              <h2 className="mt-3 text-xl font-black leading-8 text-[#032e4d]">
                {question.question}
              </h2>
            </div>
            {session.config.mode === "simulate" && (
              <button
                onClick={flag}
                aria-pressed={session.flagged_question_indices.includes(
                  question.index,
                )}
                className={`rounded-xl p-3 ${session.flagged_question_indices.includes(question.index) ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}
                aria-label="Flag question"
              >
                <Flag size={19} />
              </button>
            )}
          </div>
          {question.type === "objective" && question.options ? (
            <fieldset className="mt-7 space-y-3">
              <legend className="sr-only">Choose one answer</legend>
              {Object.entries(question.options).map(([letter, text]) => (
                <label
                  key={letter}
                  className={`flex cursor-pointer gap-4 rounded-xl border p-4 font-bold transition ${answer === letter ? "border-[#ff6b00] bg-[#fff0e5] text-[#a94100]" : "border-[#dce5eb] hover:border-[#9eb5c3]"}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.index}`}
                    value={letter}
                    checked={answer === letter}
                    onChange={() => setAnswer(letter)}
                    disabled={
                      busy ||
                      (session.config.mode === "learn" && Boolean(existing))
                    }
                  />
                  <span>
                    <strong>{letter}.</strong> {text}
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <label className="mt-7 block">
              <span className="field-label">Your answer</span>
              <textarea
                className="field min-h-44 resize-y"
                value={answer}
                disabled={
                  busy || (session.config.mode === "learn" && Boolean(existing))
                }
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Write your answer in your own words…"
              />
            </label>
          )}
          {(feedback ||
            (existing?.feedback && session.config.mode === "learn")) && (
            <div
              className={`mt-6 rounded-2xl p-5 ${(feedback?.result || existing?.result) === "correct" ? "bg-emerald-50 text-emerald-900" : "bg-orange-50 text-orange-900"}`}
            >
              <p className="font-black capitalize">
                {(feedback?.result || existing?.result) === "correct"
                  ? t("correct")
                  : `${feedback?.result || existing?.result}`}
              </p>
              <p className="mt-2 text-sm leading-6">
                {feedback?.feedback || existing?.feedback}
              </p>
              {session.feedback[String(question.index)]?.correct_answer && (
                <p className="mt-3 text-sm">
                  <strong>Correct answer:</strong>{" "}
                  {session.feedback[String(question.index)].correct_answer}
                </p>
              )}
            </div>
          )}
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700"
            >
              {error}
            </p>
          )}
          <div className="mt-7 flex flex-wrap justify-between gap-3">
            {session.config.mode === "simulate" ? (
              <>
                <Button
                  variant="ghost"
                  disabled={question.index === 1}
                  onClick={() => navigate(question.index - 1)}
                >
                  <ChevronLeft size={17} />
                  {t("previous")}
                </Button>
                <Button
                  onClick={async () => {
                    if (answer.trim() && answer !== existing?.user_answer) {
                      const saved = await saveAnswer();
                      if (!saved) return;
                    }
                    if (question.index < session.questions.length)
                      await navigate(question.index + 1);
                  }}
                  disabled={busy}
                >
                  {question.index === session.questions.length
                    ? t("saveAnswer")
                    : t("saveNext")}
                  <ChevronRight size={17} />
                </Button>
              </>
            ) : (
              <Button
                className="ml-auto"
                onClick={() => saveAnswer()}
                disabled={busy || !answer.trim() || Boolean(existing)}
              >
                {busy ? "…" : t("submitAnswer")}
                <Send size={17} />
              </Button>
            )}
          </div>
        </section>
        <aside className="card h-fit p-5">
          <h2 className="font-black text-[#032e4d]">{t("questionMap")}</h2>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {session.questions.map((item) => (
              <button
                key={item.index}
                disabled={session.config.mode === "learn"}
                onClick={() => navigate(item.index)}
                aria-label={`Question ${item.index}${answered.has(item.index) ? ", answered" : ""}`}
                className={`grid aspect-square place-items-center rounded-lg text-sm font-black ${item.index === question.index ? "bg-[#032e4d] text-white" : answered.has(item.index) ? "bg-emerald-100 text-emerald-800" : session.flagged_question_indices.includes(item.index) ? "bg-amber-100 text-amber-800" : "bg-[#f1f5f7] text-[#526877]"}`}
              >
                {item.index}
              </button>
            ))}
          </div>
          {session.config.mode === "simulate" && (
            <Button
              variant="secondary"
              className="mt-5 w-full"
              onClick={() => setConfirmSubmit(true)}
              disabled={busy}
            >
              {t("submitExam")}
            </Button>
          )}
          <div className="mt-5 space-y-2 text-xs font-bold text-[#607282]">
            <p>
              <span className="mr-2 inline-block size-2 rounded-full bg-emerald-400" />
              Answered
            </p>
            <p>
              <span className="mr-2 inline-block size-2 rounded-full bg-amber-400" />
              Flagged
            </p>
          </div>
        </aside>
      </div>
      <Modal
        open={confirmSubmit}
        title="Submit this simulation?"
        onClose={() => setConfirmSubmit(false)}
      >
        <p className="leading-7 text-[#607282]">
          You answered {answered.size} of {session.questions.length} questions.
          Submission is final; unanswered questions receive zero credit.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmSubmit(false)}>
            Keep reviewing
          </Button>
          <Button onClick={submitAll}>Submit now</Button>
        </div>
      </Modal>
    </div>
  );
}
