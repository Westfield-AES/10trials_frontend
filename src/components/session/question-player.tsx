"use client";

import { useEffect, useMemo, useState } from "react";
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

export function QuestionPlayer({
  session,
  onRefresh,
}: {
  session: WebSession;
  onRefresh: () => Promise<unknown>;
}) {
  const { t } = useI18n();
  const activeQuestion = session.questions[session.current_question_index];
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
    const submittedQuestionIndex = question.index;
    setBusy(true);
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
        const job = await waitForJob<{ evaluation?: AnswerEvaluation }>(
          result.job_id,
        );
        if (job.status === "failed")
          throw new Error(job.error_message || "Could not grade the answer.");
        if (job.result?.evaluation) {
          setFeedback({
            questionIndex: submittedQuestionIndex,
            evaluation: job.result.evaluation,
          });
        }
        if (session.config.mode === "learn") {
          setReviewedQuestionIndex(submittedQuestionIndex);
        }
      }
      await onRefresh();
      toast.success(
        session.config.mode === "learn" ? "Answer graded." : "Answer saved.",
      );
      return true;
    } catch (nextError) {
      toast.error(
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
    if (session.config.mode === "learn") {
      const canReview = answered.has(index) || activeQuestion?.index === index;
      if (!canReview) return;
      const targetAnswer = session.answers.find(
        (item) => item.question_index === index,
      );
      setAnswer(targetAnswer?.user_answer ?? "");
      setFeedback(null);
      setReviewedQuestionIndex(index === activeQuestion?.index ? null : index);
      return;
    }
    try {
      await apiRequest(`/api/v1/sessions/${session.id}/navigate`, {
        method: "POST",
        body: JSON.stringify({ question_index: index }),
      });
      await onRefresh();
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not change questions.",
      );
    }
  }
  async function flag() {
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
    setBusy(true);
    setConfirmSubmit(false);
    try {
      await apiRequest(`/api/v1/sessions/${session.id}/submit`, {
        method: "POST",
        toast: { success: "Simulation submitted for grading." },
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
          {showFeedback && (
            <div
              className={`mt-6 rounded-2xl p-5 ${displayedFeedback?.result === "correct" ? "bg-emerald-50 text-emerald-900" : "bg-orange-50 text-orange-900"}`}
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
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
            {session.config.mode === "simulate" ? (
              <>
                <Button
                  className="w-full sm:w-auto"
                  variant="ghost"
                  disabled={question.index === 1}
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
          <div className="mt-4 grid grid-cols-5 gap-2">
            {session.questions.map((item) => (
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
                aria-label={`Question ${item.index}${answered.has(item.index) ? ", answered" : ""}${item.index === activeQuestion?.index ? ", current" : ""}`}
                className={`grid aspect-square place-items-center rounded-lg text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${item.index === question.index ? "bg-[#032e4d] text-white" : answered.has(item.index) ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : item.index === activeQuestion?.index && session.config.mode === "learn" ? "bg-[#fff0e5] text-[#b94700] ring-2 ring-[#ff9b52]" : session.flagged_question_indices.includes(item.index) ? "bg-amber-100 text-amber-800" : "bg-[#f1f5f7] text-[#526877]"}`}
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
