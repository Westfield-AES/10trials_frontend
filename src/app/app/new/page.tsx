"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest, waitForJob } from "@/lib/api";
import { useAccount } from "@/lib/use-account";
import type { AccountOverview, Job, Language, WebSession } from "@/lib/types";
import { ActiveSessionCard } from "@/components/app/active-session-card";
import { PracticeJourneyCard } from "@/components/app/practice-journey";
import { PageSkeleton } from "@/components/app/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EstimatedProgress } from "@/components/ui/progress";
import { useI18n } from "@/components/providers/i18n-provider";
import { toast } from "@/lib/toast";

interface Discovery {
  status?: "exact" | "provisional" | "unrecognized";
  found: boolean;
  exam_name: string;
  governing_body: string;
  suggested_format: "objective" | "theory" | "essay" | "mixed" | null;
  format_reason?: string;
  common_topics: string[];
  curriculum_years?: string[];
  clarification_needed?: string;
  clarification_options?: string[] | null;
  confidence?: "high" | "medium" | "low";
  verified_facts?: string[];
  assumptions?: string[];
  missing_details?: string[];
}

const languages: Array<{ value: Language; label: string }> = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
];

export default function NewSessionPage() {
  const { t } = useI18n();
  const router = useRouter();
  const client = useQueryClient();
  const account = useAccount();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [clarification, setClarification] = useState<Discovery | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [showCustomClarification, setShowCustomClarification] = useState(false);
  const [resolutionInput, setResolutionInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [curriculumYear, setCurriculumYear] = useState("Current");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [format, setFormat] = useState("mixed");
  const [mode, setMode] = useState<"learn" | "simulate">("learn");
  const [timer, setTimer] = useState("30");
  const [timed, setTimed] = useState(true);
  const [target, setTarget] = useState(80);
  const [busy, setBusy] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);
  const active = account.data?.journey.has_active_session
    ? account.data.active_session
    : null;
  const sessionQuestionCount = 10;
  const timerMinutes = Number(timer);
  const invalidTimer =
    mode === "simulate" &&
    timed &&
    (!Number.isInteger(timerMinutes) || timerMinutes < 1 || timerMinutes > 480);
  const clarificationOptions = clarification?.clarification_options ?? [];

  async function endSession() {
    if (!active || ending) return;
    setEnding(true);
    try {
      await apiRequest(`/api/v1/sessions/${active.id}`, {
        method: "DELETE",
        toast: { success: "Session ended.", error: false },
      });
      await Promise.all([
        client.cancelQueries({ queryKey: ["active-session"] }),
        client.cancelQueries({ queryKey: ["account"] }),
      ]);
      client.removeQueries({ queryKey: ["active-session"] });
      client.setQueryData<AccountOverview>(["account"], (previous) => {
        if (!previous || previous.active_session?.id !== active.id)
          return previous;
        const { journey } = previous;
        return {
          ...previous,
          active_session: null,
          journey: {
            ...journey,
            has_active_session: false,
            next_step: journey.can_generate
              ? journey.phase === "start_free"
                ? "start_free"
                : "practice"
              : journey.usage_period === "lifetime"
                ? "upgrade"
                : "wait_for_reset",
          },
        };
      });
      await client.invalidateQueries({ queryKey: ["account"] });
      setConfirmEnd(false);
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not end the session. Please try again.",
      );
    } finally {
      setEnding(false);
    }
  }

  async function resolveExam(input: string) {
    if (input.length < 2 || busy) return;
    setResolutionInput(input);
    setBusy(true);
    setProgress(5);
    try {
      const created = await apiRequest<{ job_id: string }>(
        "/api/v1/exams/discover",
        {
          method: "POST",
          body: JSON.stringify({ description: input, language }),
        },
      );
      const job = await waitForJob<{ exam: Discovery }>(
        created.job_id,
        (next: Job) => {
          if (!["succeeded", "failed", "cancelled"].includes(next.status))
            setProgress((previous) => Math.max(previous, next.progress));
        },
      );
      if (job.status !== "succeeded" || !job.result?.exam)
        throw new Error(job.error_message || "Could not identify that exam.");
      setProgress(100);
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      const result = job.result.exam;
      const status = result.status ?? (result.found ? "exact" : "unrecognized");
      if (status !== "exact") {
        setClarification(result);
        setClarificationAnswer("");
        setShowCustomClarification(false);
        return;
      }
      const found = result;
      setDiscovery(found);
      setClarification(null);
      setSelectedTopics(found.common_topics || []);
      setFormat(found.suggested_format || "mixed");
      setCurriculumYear(found.curriculum_years?.[0] || "Current");
      setStep(2);
      toast.success("Exam identified.");
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not identify that exam.",
      );
    } finally {
      setBusy(false);
    }
  }

  function identify() {
    void resolveExam(description.trim());
  }

  function refineIdentification(value = clarificationAnswer) {
    const answer = value.trim();
    if (!answer || !clarification || busy) return;
    const refinedInput = [
      resolutionInput || description.trim(),
      `Clarification requested: ${clarification.clarification_needed}`,
      `Learner's additional detail: ${answer}`,
    ].join("\n");
    void resolveExam(refinedInput);
  }

  async function generate() {
    if (!discovery || invalidTimer) return;
    setBusy(true);
    try {
      const result = await apiRequest<{ session_id: string; job_id: string }>(
        "/api/v1/sessions",
        {
          method: "POST",
          body: JSON.stringify({
            exam: {
              raw_input: resolutionInput || description,
              confirmed_name: discovery.exam_name,
              governing_body: discovery.governing_body,
              suggested_format: discovery.suggested_format || "mixed",
              topics: discovery.common_topics,
            },
            language,
            format,
            num_questions: sessionQuestionCount,
            mode,
            timer_minutes: mode === "simulate" && timed ? timerMinutes : null,
            difficulty,
            selected_topics: selectedTopics,
            custom_topics: customTopic.trim()
              ? customTopic
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
              : [],
            curriculum_year: curriculumYear,
            target_score: target,
          }),
          toast: { success: "Session generation started." },
        },
      );
      const pendingSession: WebSession = {
        id: result.session_id,
        status: "generating",
        language,
        exam: {
          raw_input: resolutionInput || description,
          confirmed_name: discovery.exam_name,
          governing_body: discovery.governing_body,
          suggested_format: discovery.suggested_format || "mixed",
          topics: discovery.common_topics,
        },
        config: {
          format,
          num_questions: sessionQuestionCount,
          mode,
          timer_seconds:
            mode === "simulate" && timed ? timerMinutes * 60 : null,
        },
        difficulty,
        selected_topics: selectedTopics,
        custom_topics: customTopic
          .trim()
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        curriculum_year: curriculumYear,
        target_score: target,
        questions: [],
        answers: [],
        feedback: {},
        current_question_index: 0,
        flagged_question_indices: [],
        generation_job_id: result.job_id,
        is_retry: false,
      };
      await client.cancelQueries({ queryKey: ["active-session"] });
      client.setQueryData(["active-session"], pendingSession);
      void client.invalidateQueries({ queryKey: ["account"] });
      router.push(`/app/session?job=${result.job_id}`);
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not create the session.",
      );
      setBusy(false);
    }
  }

  const curriculumYears = discovery?.curriculum_years?.length
    ? discovery.curriculum_years
    : ["Current"];
  const showCurriculumYear = curriculumYears.some(
    (year) => year.trim().toLowerCase() !== "current",
  );
  if (account.isPending || (ending && !active))
    return <PageSkeleton kind="new" />;
  if (active) {
    const canGenerate = account.data?.journey.can_generate ?? false;
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-7">
          <h1 className="text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
            Finish your current session
          </h1>
        </div>
        <ActiveSessionCard
          session={active}
          onEnd={() => setConfirmEnd(true)}
          ending={ending}
          canGenerate={canGenerate}
        />
        <Modal
          open={confirmEnd}
          title="End this session?"
          onClose={() => {
            if (!ending) setConfirmEnd(false);
          }}
        >
          <p className="leading-7 text-[#607282]">
            You can’t resume an ended session. Generated questions still count
            toward your allowance.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setConfirmEnd(false)}
              disabled={ending}
            >
              Keep session
            </Button>
            <Button variant="danger" onClick={endSession} disabled={ending}>
              {ending
                ? "Ending session…"
                : canGenerate
                  ? "End & start new"
                  : "End session"}
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
  const allowanceExhausted = account.data && !account.data.journey.can_generate;
  if (allowanceExhausted) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-7 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
          {t("newSession")}
        </h1>
        <PracticeJourneyCard account={account.data} />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#607282]">
          Make it your own
        </p>
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
          {t("newSession")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#607282]">
          Your exam. Your focus. Your pace.
        </p>
      </div>
      <ol
        aria-label="Session setup progress"
        className="mb-6 grid grid-cols-3 gap-2"
      >
        {["Exam", "Topics", "Session"].map((label, index) => (
          <li
            key={label}
            aria-current={step === index + 1 ? "step" : undefined}
            className={`relative flex min-w-0 flex-col items-center gap-2 rounded-xl text-xs font-semibold sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-sm ${step === index + 1 ? "text-[#a94100] sm:bg-[#fff0e5]" : step > index + 1 ? "text-[#07436c]" : "text-[#607282]"}`}
          >
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full border ${step === index + 1 ? "border-[#e85b00] bg-[#e85b00] text-white" : step > index + 1 ? "border-[#032e4d] bg-[#032e4d] text-white" : "border-[#c8d5dd] bg-white"}`}
            >
              {step > index + 1 ? <Check size={14} /> : index + 1}
            </span>
            <span className="sm:hidden">{label}</span>
            <span className="hidden sm:inline">Your {label.toLowerCase()}</span>
            {index < 2 && (
              <ChevronRight
                aria-hidden="true"
                size={16}
                className="absolute -right-3 top-1.5 text-[#9eafbb] sm:hidden"
              />
            )}
          </li>
        ))}
      </ol>
      <section className="card p-5 sm:p-9">
        {step === 1 && (
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-[#fff0e5] text-[#e85b00]">
              <Search />
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#032e4d]">
              {t("examQuestion")}
            </h2>
            <p className="mt-2 text-[#607282]">
              Include the full name or exam code if you know it.
            </p>
            <label className="mt-6 block">
              <span className="field-label">Exam name or description</span>
              <textarea
                className="field min-h-28 resize-y"
                placeholder="e.g. IELTS Academic"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setClarification(null);
                  setResolutionInput("");
                }}
              />
            </label>
            {!clarification && (
              <div
                className="mt-3 flex flex-wrap gap-2"
                aria-label="Example exams"
              >
                {["AWS Solutions Architect", "IELTS Academic", "PMP"].map(
                  (exam) => (
                    <button
                      key={exam}
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setDescription(exam);
                        setClarification(null);
                        setResolutionInput("");
                      }}
                      className="min-h-11 rounded-full border border-[#dce5eb] bg-[#f7f9fb] px-3 text-xs font-medium text-[#526877] transition hover:border-[#e85b00] hover:bg-[#fff0e5] disabled:opacity-50"
                    >
                      {exam}
                    </button>
                  ),
                )}
              </div>
            )}
            <label className="mt-4 block">
              <span className="field-label">Language</span>
              <select
                className="field"
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value as Language);
                  setClarification(null);
                  setResolutionInput("");
                }}
              >
                {languages.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            {busy && (
              <div className="mt-6 rounded-xl bg-[#f4f8fa] p-4">
                <EstimatedProgress
                  value={progress}
                  label="Finding your exam…"
                />
              </div>
            )}
            {clarification && !busy && (
              <div
                className="mt-6 rounded-2xl border border-[#b8d5e5] bg-[#f4f8fa] p-5"
                aria-live="polite"
              >
                <p className="text-sm font-black text-[#032e4d]">
                  {clarification.status === "provisional"
                    ? "Confirm your exam"
                    : "One more detail"}
                </p>
                {clarification.exam_name && (
                  <p className="mt-1 text-sm text-[#607282]">
                    {clarification.exam_name}
                    {clarification.governing_body
                      ? ` · ${clarification.governing_body}`
                      : ""}
                  </p>
                )}
                <p className="mt-4 font-bold text-[#032e4d]">
                  {clarification.clarification_needed ||
                    "What country, provider, subject, or level is this exam for?"}
                </p>
                {clarificationOptions.length > 0 && (
                  <div className="mt-4">
                    <div
                      className="grid gap-3 sm:grid-cols-2"
                      role="group"
                      aria-label="Exam options"
                    >
                      {clarificationOptions.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant="ghost"
                          className="w-full justify-between text-left hover:border-[#e85b00] hover:bg-[#fff0e5]"
                          onClick={() => refineIdentification(option)}
                          disabled={busy}
                        >
                          <span className="min-w-0 break-words">{option}</span>
                          <ChevronRight
                            size={18}
                            className="shrink-0"
                            aria-hidden="true"
                          />
                        </Button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-2 min-h-11 rounded-lg text-sm font-semibold text-[#526877] underline underline-offset-4 hover:text-[#032e4d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e85b00]"
                      aria-expanded={showCustomClarification}
                      aria-controls="custom-exam-clarification"
                      onClick={() =>
                        setShowCustomClarification((previous) => !previous)
                      }
                    >
                      Something else
                    </button>
                  </div>
                )}
                {(clarificationOptions.length === 0 ||
                  showCustomClarification) && (
                  <form
                    id="custom-exam-clarification"
                    onSubmit={(event) => {
                      event.preventDefault();
                      refineIdentification();
                    }}
                  >
                    <label className="mt-3 block">
                      <span className="field-label">Your answer</span>
                      <input
                        className="field"
                        value={clarificationAnswer}
                        onChange={(event) =>
                          setClarificationAnswer(event.target.value)
                        }
                        placeholder="Add the missing detail"
                        autoFocus
                      />
                    </label>
                    <Button
                      type="submit"
                      className="mt-4 w-full sm:w-auto"
                      variant="secondary"
                      disabled={busy || !clarificationAnswer.trim()}
                    >
                      Continue
                      <ChevronRight size={17} aria-hidden="true" />
                    </Button>
                  </form>
                )}
              </div>
            )}
            {!clarification && (
              <Button
                className="mt-6 w-full sm:w-auto"
                onClick={identify}
                disabled={busy || description.trim().length < 2}
              >
                {busy ? t("identifying") : t("identify")}
                <Search size={17} />
              </Button>
            )}
          </div>
        )}
        {step === 2 && discovery && (
          <div>
            <p className="eyebrow">Here’s what we found</p>
            <h2 className="mt-2 text-2xl font-black text-[#032e4d]">
              {discovery.exam_name}
            </h2>
            <p className="mt-1 text-[#607282]">{discovery.governing_body}</p>
            <div className="mt-6 rounded-2xl bg-[#f4f8fa] p-5">
              <p className="text-sm font-black text-[#032e4d]">Select topics</p>
              <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                {discovery.common_topics.map((topic) => {
                  const selected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setSelectedTopics((items) =>
                          selected
                            ? items.filter((item) => item !== topic)
                            : [...items, topic],
                        )
                      }
                      className={`flex w-full items-start gap-2 rounded-xl border px-4 py-3 text-left text-sm font-bold sm:w-auto sm:rounded-full sm:px-3 sm:py-2 ${selected ? "border-[#ff6b00] bg-[#fff0e5] text-[#b94700]" : "border-[#c8d5dd] bg-white text-[#526877]"}`}
                    >
                      {selected && (
                        <Check className="mt-0.5 shrink-0" size={14} />
                      )}
                      <span>{topic}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="mt-5 block">
              <span className="field-label">Custom topics (optional)</span>
              <input
                className="field"
                value={customTopic}
                onChange={(event) => setCustomTopic(event.target.value)}
                placeholder="Separate topics with commas"
              />
            </label>
            {showCurriculumYear && (
              <label className="mt-5 block">
                <span className="field-label">Exam version or year</span>
                <select
                  className="field"
                  value={curriculumYear}
                  onChange={(event) => setCurriculumYear(event.target.value)}
                >
                  {curriculumYears.map((year) => (
                    <option key={year}>{year}</option>
                  ))}
                </select>
              </label>
            )}
            <div className="mt-7 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft size={17} />
                {t("back")}
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedTopics.length && !customTopic.trim()}
              >
                {t("configure")}
                <ChevronRight size={17} />
              </Button>
            </div>
          </div>
        )}
        {step === 3 && discovery && (
          <div>
            <h2 className="text-2xl font-black text-[#032e4d]">
              Session settings
            </h2>
            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <label>
                <span className="field-label">{t("difficulty")}</span>
                <select
                  className="field"
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="adaptive">Adaptive</option>
                </select>
              </label>
              <label>
                <span className="field-label">{t("questionFormat")}</span>
                <select
                  className="field"
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                >
                  <option value="objective">Objective</option>
                  <option value="theory">Theory</option>
                  <option value="essay">Essay</option>
                  <option value="mixed">Mixed</option>
                </select>
              </label>
            </div>
            <fieldset className="mt-6">
              <legend className="field-label">{t("mode")}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["learn", "Learn", "Feedback after every answer"],
                  ["simulate", "Simulate", "Feedback after submission"],
                ].map(([value, label, body]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-xl border p-4 ${mode === value ? "border-[#ff6b00] bg-[#fff0e5]" : "border-[#dce5eb]"}`}
                  >
                    <input
                      className="mr-3"
                      type="radio"
                      name="mode"
                      checked={mode === value}
                      onChange={() => setMode(value as "learn" | "simulate")}
                    />
                    <strong>{label}</strong>
                    <span className="mt-1 block pl-6 text-xs text-[#607282]">
                      {body}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {mode === "simulate" && (
              <div className="mt-6 rounded-2xl bg-[#f4f8fa] p-5">
                <label className="flex items-center gap-3 font-bold">
                  <input
                    type="checkbox"
                    checked={timed}
                    onChange={(event) => setTimed(event.target.checked)}
                  />
                  Use a timer
                </label>
                {timed && (
                  <label className="mt-4 block">
                    <span className="field-label">Minutes</span>
                    <input
                      className="field"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={480}
                      step={1}
                      value={timer}
                      aria-invalid={invalidTimer}
                      aria-describedby="timer-minutes-help"
                      onChange={(event) => setTimer(event.target.value)}
                      onBlur={() => {
                        if (!invalidTimer) setTimer(String(timerMinutes));
                      }}
                    />
                    <span
                      id="timer-minutes-help"
                      className="mt-2 block text-xs text-[#607282]"
                    >
                      Enter a whole number from 1 to 480.
                    </span>
                  </label>
                )}
              </div>
            )}
            <label className="mt-6 block">
              <span className="field-label">
                {t("targetScore")}: {target}%
              </span>
              <input
                className="w-full accent-[#ff6b00]"
                type="range"
                min={40}
                max={100}
                step={5}
                value={target}
                onChange={(event) => setTarget(Number(event.target.value))}
              />
            </label>
            <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
              <Button
                variant="ghost"
                onClick={() => setStep(2)}
                disabled={busy}
              >
                <ChevronLeft size={17} />
                {t("back")}
              </Button>
              <Button onClick={generate} disabled={busy || invalidTimer}>
                {busy ? "Preparing your session…" : t("generate")}
                <FilePlus2 size={17} />
              </Button>
            </div>
            {busy && (
              <div className="mt-6 rounded-xl bg-[#f4f8fa] p-4">
                <EstimatedProgress value={5} label="Preparing your session" />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
