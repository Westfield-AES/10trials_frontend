"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Flag, Send, Timer } from "lucide-react";
import { apiRequest, waitForJob } from "@/lib/api";
import type { SessionAnswer, WebSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/components/providers/i18n-provider";
import { toast } from "@/lib/toast";

type AnswerEvaluation = Pick<
  SessionAnswer,
  "feedback" | "result" | "score" | "weak_area_flag"
>;

function scrollToSection(element: HTMLElement) {
  const margin =
    parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0;
  const start = window.scrollY;
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const target = Math.max(
    0,
    Math.min(maxScroll, start + element.getBoundingClientRect().top - margin),
  );
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: target, behavior: "instant" });
    return () => {};
  }

  const distance = target - start;
  if (Math.abs(distance) < 1) return () => {};
  const duration = Math.min(800, 550 + Math.abs(distance) * 0.15);
  const startedAt = performance.now();
  let frame = 0;
  const stop = () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("pointerdown", stop);
    window.removeEventListener("keydown", stop);
  };
  const animate = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = progress * progress * (3 - 2 * progress);
    window.scrollTo({ top: start + distance * eased, behavior: "instant" });
    if (progress < 1) frame = window.requestAnimationFrame(animate);
    else stop();
  };
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("pointerdown", stop, { passive: true });
  window.addEventListener("keydown", stop);
  frame = window.requestAnimationFrame(animate);
  return stop;
}

export function QuestionPlayer({
  session,
  onRefresh,
}: {
  session: WebSession;
  onRefresh: () => Promise<unknown>;
}) {
  const { t } = useI18n();
  const client = useQueryClient();
  const questionStartRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const scrollToQuestionIndex = useRef<number | null>(null);
  const scrollToFeedbackIndex = useRef<number | null>(null);
  const cancelScroll = useRef<(() => void) | null>(null);
  const activeQuestion =
    session.questions[session.current_question_index] ??
    (session.config.mode === "learn" ? session.questions.at(-1) : undefined);
  const [reviewedQuestionIndex, setReviewedQuestionIndex] = useState<
    number | null
  >(null);
  const question =
    session.config.mode === "learn" && reviewedQuestionIndex !== null
      ? (session.questions.find(
          (item) => item.index === reviewedQuestionIndex,
        ) ?? activeQuestion)
      : activeQuestion;
  const existing = session.answers.find(
    (item) => item.question_index === question?.index,
  );
  const [answer, setAnswer] = useState(existing?.user_answer ?? "");
  const [busy, setBusy] = useState(false);
  const [pendingQuestionIndex, setPendingQuestionIndex] = useState<
    number | null
  >(null);
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [feedback, setFeedback] = useState<{
    questionIndex: number;
    evaluation: AnswerEvaluation;
  } | null>(null);
  const [remaining, setRemaining] = useState(() =>
    session.timer_deadline
      ? Math.max(0, session.timer_deadline - Math.floor(Date.now() / 1000))
      : null,
  );
  useEffect(() => () => cancelScroll.current?.(), []);
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
  const answered = useMemo(() => {
    const indices = new Set(session.answers.map((item) => item.question_index));
    if (session.config.mode === "simulate" && pendingAnswer !== null)
      indices.add(pendingAnswer);
    return indices;
  }, [pendingAnswer, session.answers, session.config.mode]);
  const learnComplete =
    session.config.mode === "learn" &&
    session.questions.every((item) =>
      session.answers.some(
        (saved) => saved.question_index === item.index && Boolean(saved.result),
      ),
    );
  useEffect(() => {
    if (
      question?.index !== undefined &&
      scrollToQuestionIndex.current === question.index &&
      questionStartRef.current
    ) {
      scrollToQuestionIndex.current = null;
      cancelScroll.current?.();
      cancelScroll.current = scrollToSection(questionStartRef.current);
    }
  }, [question?.index]);
  useEffect(() => {
    if (
      question?.index !== undefined &&
      scrollToFeedbackIndex.current === question.index &&
      feedbackRef.current
    ) {
      scrollToFeedbackIndex.current = null;
      cancelScroll.current?.();
      cancelScroll.current = scrollToSection(feedbackRef.current);
    }
  }, [question?.index, feedback, existing, session.feedback]);
  if (!question) return null;
  const isLastQuestion = question.index === session.questions.length;

  async function saveAnswer(value = answer) {
    if (!value.trim()) return false;
    const submittedQuestionIndex = question.index;
    setBusy(true);
    setPendingAnswer(submittedQuestionIndex);
    setFeedback(null);
    try {
      await client.cancelQueries({ queryKey: ["active-session"] });
      const result = await apiRequest<{
        job_id?: string;
        session?: WebSession;
      }>(`/api/v1/sessions/${session.id}/answers`, {
        method: "POST",
        body: JSON.stringify({
          question_index: question.index,
          answer: value,
        }),
      });
      if (result.session)
        client.setQueryData(["active-session"], result.session);
      if (result.job_id) {
        const job = await waitForJob<{ evaluation?: AnswerEvaluation }>(
          result.job_id,
        );
        if (job.status === "failed")
          throw new Error(job.error_message || "Could not grade the answer.");
        if (job.result?.evaluation) {
          if (session.config.mode === "learn")
            scrollToFeedbackIndex.current = submittedQuestionIndex;
          setFeedback({
            questionIndex: submittedQuestionIndex,
            evaluation: job.result.evaluation,
          });
        }
        if (session.config.mode === "learn") {
          setReviewedQuestionIndex(submittedQuestionIndex);
        }
      }
      if (result.job_id || !result.session) await onRefresh();
      toast.success(
        session.config.mode === "learn" ? "Answer graded." : "Answer saved.",
      );
      return true;
    } catch (nextError) {
      // A lost response can still mean the server accepted the answer.
      await onRefresh();
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not save the answer.",
      );
      return false;
    } finally {
      setPendingAnswer(null);
      setBusy(false);
    }
  }
  async function navigate(index: number) {
    if (busy) return;
    if (index === question.index) return;
    if (session.config.mode === "learn") {
      const canReview = answered.has(index) || activeQuestion?.index === index;
      if (!canReview) return;
      const targetAnswer = session.answers.find(
        (item) => item.question_index === index,
      );
      scrollToQuestionIndex.current = index;
      setAnswer(targetAnswer?.user_answer ?? "");
      setFeedback(null);
      setReviewedQuestionIndex(index === activeQuestion?.index ? null : index);
      return;
    }
    scrollToQuestionIndex.current = index;
    setPendingQuestionIndex(index);
    setBusy(true);
    try {
      const result = await apiRequest<{ current_question_index: number }>(
        `/api/v1/sessions/${session.id}/navigate`,
        {
          method: "POST",
          body: JSON.stringify({ question_index: index }),
        },
      );
      await client.cancelQueries({ queryKey: ["active-session"] });
      client.setQueryData<WebSession>(["active-session"], (previous) =>
        previous?.id === session.id
          ? {
              ...previous,
              current_question_index: result.current_question_index,
            }
          : previous,
      );
    } catch (nextError) {
      scrollToQuestionIndex.current = null;
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not change questions.",
      );
    } finally {
      setPendingQuestionIndex(null);
      setBusy(false);
    }
  }
  async function flag() {
    if (busy) return;
    const willFlag = !session.flagged_question_indices.includes(question.index);
    try {
      await apiRequest(`/api/v1/sessions/${session.id}/flag`, {
        method: "POST",
        body: JSON.stringify({
          question_index: question.index,
          flagged: willFlag,
        }),
        toast: {
          success: willFlag ? "Question flagged." : "Flag removed.",
        },
      });
      await onRefresh();
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not update the flag.",
      );
    }
  }
  async function submitAll() {
    if (busy) return;
    setBusy(true);
    setConfirmSubmit(false);
    try {
      await apiRequest(`/api/v1/sessions/${session.id}/submit`, {
        method: "POST",
        toast: {
          success:
            session.config.mode === "learn"
              ? "Calculating your results."
              : "Simulation submitted for grading.",
        },
      });
      await onRefresh();
    } catch (nextError) {
      toast.error(
        nextError instanceof Error ? nextError.message : "Could not submit.",
      );
      setBusy(false);
    }
  }
  const minutes = remaining == null ? null : Math.floor(remaining / 60);
  const seconds = remaining == null ? null : remaining % 60;
  const localFeedback =
    feedback?.questionIndex === question.index ? feedback.evaluation : null;
  const displayedFeedback =
    localFeedback ?? (session.config.mode === "learn" ? existing : null);
  const releasedFeedback = session.feedback[String(question.index)];
  const correctAnswer = releasedFeedback?.correct_answer
    ? question.options?.[releasedFeedback.correct_answer]
      ? `${releasedFeedback.correct_answer}. ${
          question.options[releasedFeedback.correct_answer]
        }`
      : releasedFeedback.correct_answer
    : releasedFeedback?.model_answer;
  const showFeedback =
    session.config.mode === "learn" &&
    Boolean(
      displayedFeedback?.result || displayedFeedback?.feedback || correctAnswer,
    );
  const previousLearnQuestion = session.questions
    .slice()
    .reverse()
    .find((item) => item.index < question.index && answered.has(item.index));
  const nextLearnQuestion = session.questions.find(
    (item) =>
      item.index > question.index &&
      (answered.has(item.index) || item.index === activeQuestion?.index),
  );
  return (
    <div ref={questionStartRef} className="mx-auto max-w-6xl scroll-mt-24">
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
        <section className="card min-w-0 p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#e85b00]">
                {question.topic}
              </p>
              <h2 className="mt-3 text-lg font-bold leading-8 text-[#032e4d] sm:text-xl">
                {question.question}
              </h2>
            </div>
            {session.config.mode === "simulate" && (
              <button
                onClick={flag}
                disabled={busy}
                aria-pressed={session.flagged_question_indices.includes(
                  question.index,
                )}
                className={`rounded-xl p-3 ${session.flagged_question_indices.includes(question.index) ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}
                aria-label="Flag for later"
                title="Flag for later"
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
                  className={`answer-option relative flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${answer === letter ? "border-[#e85b00] bg-[#fff0e5] text-[#a94100] ring-1 ring-[#e85b00]" : "border-[#dce5eb] hover:border-[#9eb5c3]"} ${busy || (session.config.mode === "learn" && Boolean(existing)) ? "cursor-default" : ""}`}
                >
                  <input
                    type="radio"
                    className="peer sr-only"
                    name={`question-${question.index}`}
                    value={letter}
                    checked={answer === letter}
                    onChange={() => setAnswer(letter)}
                    disabled={
                      busy ||
                      (session.config.mode === "learn" && Boolean(existing))
                    }
                  />
                  <span
                    aria-hidden="true"
                    className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${answer === letter ? "bg-[#e85b00] text-white" : "bg-[#edf3f6] text-[#526877]"}`}
                  >
                    {letter}
                  </span>
                  <span className="pt-1 text-sm font-medium leading-6 sm:text-base">
                    {text}
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
                placeholder="Write your answer…"
              />
            </label>
          )}
          {showFeedback && (
            <div
              ref={feedbackRef}
              className={`mt-6 scroll-mt-20 rounded-2xl p-5 sm:scroll-mt-24 ${displayedFeedback?.result === "correct" ? "bg-emerald-50 text-emerald-900" : "bg-orange-50 text-orange-900"}`}
            >
              <p className="font-black capitalize">
                {displayedFeedback?.result === "correct"
                  ? t("correct")
                  : displayedFeedback?.result || "Feedback"}
              </p>
              {displayedFeedback?.feedback && (
                <p className="mt-2 text-sm leading-6">
                  {displayedFeedback.feedback}
                </p>
              )}
              {correctAnswer && (
                <p className="mt-3 text-sm">
                  <strong>Correct answer:</strong> {correctAnswer}
                </p>
              )}
            </div>
          )}
          {pendingAnswer === question.index && (
            <p role="status" className="mt-5 text-sm font-bold text-[#607282]">
              {session.config.mode === "learn"
                ? "Checking your answer…"
                : "Saving your answer…"}
            </p>
          )}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
            {session.config.mode === "simulate" ? (
              <>
                <Button
                  className="w-full sm:w-auto"
                  variant="ghost"
                  disabled={busy || question.index === 1}
                  onClick={() => navigate(question.index - 1)}
                >
                  <ChevronLeft size={17} />
                  {t("previous")}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    if (answer.trim() && answer !== existing?.user_answer) {
                      const saved = await saveAnswer();
                      if (!saved) return;
                    }
                    if (isLastQuestion) setConfirmSubmit(true);
                    else await navigate(question.index + 1);
                  }}
                  disabled={busy}
                >
                  {busy
                    ? pendingQuestionIndex !== null
                      ? "Loading…"
                      : "Saving…"
                    : isLastQuestion
                      ? t("submitExam")
                      : t("saveNext")}
                  {isLastQuestion ? (
                    <Send size={17} />
                  ) : (
                    <ChevronRight size={17} />
                  )}
                </Button>
              </>
            ) : existing ? (
              <>
                {previousLearnQuestion && (
                  <Button
                    className="w-full sm:w-auto"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => navigate(previousLearnQuestion.index)}
                  >
                    <ChevronLeft size={17} />
                    {t("previous")}
                  </Button>
                )}
                {nextLearnQuestion && (
                  <Button
                    className="w-full sm:ml-auto sm:w-auto"
                    disabled={busy}
                    onClick={() => navigate(nextLearnQuestion.index)}
                  >
                    {t("next")}
                    <ChevronRight size={17} />
                  </Button>
                )}
                {learnComplete && !nextLearnQuestion && (
                  <Button
                    className="w-full sm:ml-auto sm:w-auto"
                    disabled={busy}
                    onClick={submitAll}
                  >
                    {busy ? t("grading") : t("seeResults")}
                    <ChevronRight size={17} />
                  </Button>
                )}
              </>
            ) : (
              <>
                {previousLearnQuestion && (
                  <Button
                    className="w-full sm:w-auto"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => navigate(previousLearnQuestion.index)}
                  >
                    <ChevronLeft size={17} />
                    {t("previous")}
                  </Button>
                )}
                <Button
                  className="w-full sm:ml-auto sm:w-auto"
                  onClick={() => saveAnswer()}
                  disabled={busy || !answer.trim()}
                >
                  {busy ? "…" : t("submitAnswer")}
                  <Send size={17} />
                </Button>
              </>
            )}
          </div>
        </section>
        <aside className="card h-fit p-5">
          <h2 className="font-black text-[#032e4d]">{t("questionMap")}</h2>
          <p role="status" className="sr-only">
            {pendingQuestionIndex !== null &&
              `Loading question ${pendingQuestionIndex}…`}
          </p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {session.questions.map((item) => {
              const loading = pendingQuestionIndex === item.index;
              return (
                <button
                  key={item.index}
                  disabled={
                    busy ||
                    (session.config.mode === "learn" &&
                      !answered.has(item.index) &&
                      item.index !== activeQuestion?.index)
                  }
                  onClick={() => navigate(item.index)}
                  aria-current={
                    item.index === question.index ? "step" : undefined
                  }
                  aria-busy={loading}
                  aria-label={`Question ${item.index}${answered.has(item.index) ? ", answered" : ""}${item.index === activeQuestion?.index ? ", current" : ""}`}
                  className={`grid min-h-11 aspect-square place-items-center rounded-xl text-sm font-bold transition disabled:cursor-not-allowed ${loading ? "" : "disabled:opacity-45"} ${loading ? "bg-[#fff0e5] text-[#b94700] ring-2 ring-[#ff9b52]" : item.index === question.index ? "bg-[#032e4d] text-white" : answered.has(item.index) ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : item.index === activeQuestion?.index && session.config.mode === "learn" ? "bg-[#fff0e5] text-[#b94700] ring-2 ring-[#ff9b52]" : session.flagged_question_indices.includes(item.index) ? "bg-amber-100 text-amber-800" : "bg-[#f1f5f7] text-[#526877]"}`}
                >
                  <span className="relative grid size-8 place-items-center">
                    {loading && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
                      />
                    )}
                    {item.index}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 space-y-2 text-xs font-bold text-[#607282]">
            <p>
              <span className="mr-2 inline-block size-2 rounded-full bg-emerald-400" />
              Answered
            </p>
            {session.config.mode === "learn" ? (
              <p>
                <span className="mr-2 inline-block size-2 rounded-full bg-orange-400" />
                Current question
              </p>
            ) : (
              <p>
                <span className="mr-2 inline-block size-2 rounded-full bg-amber-400" />
                Flagged
              </p>
            )}
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
