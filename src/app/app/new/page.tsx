"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest, waitForJob } from "@/lib/api";
import type { AccountOverview, Job, Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/components/providers/i18n-provider";
import { toast } from "@/lib/toast";

interface Discovery {
  found: boolean;
  exam_name: string;
  governing_body: string;
  suggested_format: "objective" | "theory" | "essay" | "mixed";
  format_reason?: string;
  common_topics: string[];
  curriculum_years?: string[];
  clarification_needed?: string;
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
  const account = useQuery({
    queryKey: ["account"],
    queryFn: () => apiRequest<AccountOverview>("/api/v1/account/me"),
  });
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [curriculumYear, setCurriculumYear] = useState("Current");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [format, setFormat] = useState("mixed");
  const [count, setCount] = useState(5);
  const [mode, setMode] = useState<"learn" | "simulate">("learn");
  const [timer, setTimer] = useState(30);
  const [timed, setTimed] = useState(true);
  const [target, setTarget] = useState(80);
  const [busy, setBusy] = useState(false);

  async function identify() {
    if (description.trim().length < 2) return;
    setBusy(true);
    setProgress(5);
    try {
      const created = await apiRequest<{ job_id: string }>(
        "/api/v1/exams/discover",
        { method: "POST", body: JSON.stringify({ description, language }) },
      );
      const job = await waitForJob<{ exam: Discovery }>(
        created.job_id,
        (next: Job) => setProgress(next.progress),
      );
      if (job.status !== "succeeded" || !job.result?.exam)
        throw new Error(job.error_message || "Could not identify that exam.");
      if (!job.result.exam.found) {
        toast.error(
          job.result.exam.clarification_needed ||
            "Add the country or governing body and try again.",
        );
        return;
      }
      const found = job.result.exam;
      setDiscovery(found);
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

  async function generate() {
    if (!discovery) return;
    setBusy(true);
    try {
      const result = await apiRequest<{ session_id: string; job_id: string }>(
        "/api/v1/sessions",
        {
          method: "POST",
          body: JSON.stringify({
            exam: {
              raw_input: description,
              confirmed_name: discovery.exam_name,
              governing_body: discovery.governing_body,
              suggested_format: discovery.suggested_format,
              topics: discovery.common_topics,
            },
            language,
            format,
            num_questions: count,
            mode,
            timer_minutes: mode === "simulate" && timed ? timer : null,
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

  const questionOptions = account.data?.entitlements.question_options ?? [5];
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="eyebrow">New session</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
          {t("newHeading")}
        </h1>
        <p className="mt-2 text-[#607282]">{t("newBody")}</p>
      </div>
      <div className="mb-7">
        <Progress value={(step / 3) * 100} label={`Step ${step} of 3`} />
      </div>
      <section className="card p-6 sm:p-9">
        {step === 1 && (
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-[#fff0e5] text-[#e85b00]">
              <Search />
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#032e4d]">
              {t("examQuestion")}
            </h2>
            <p className="mt-2 text-[#607282]">
              Use the full name if you know it, or describe it naturally.
            </p>
            <label className="mt-6 block">
              <span className="field-label">Exam description</span>
              <textarea
                className="field min-h-32 resize-y"
                placeholder="e.g. The Nigerian bar final exam, or WAEC Chemistry"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <label className="mt-4 block">
              <span className="field-label">Language</span>
              <select
                className="field"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as Language)
                }
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
                <Progress
                  value={progress}
                  label="Researching the exam and syllabus"
                />
              </div>
            )}
            <Button
              className="mt-6"
              onClick={identify}
              disabled={busy || description.trim().length < 2}
            >
              {busy ? t("identifying") : t("identify")}
              <Sparkles size={17} />
            </Button>
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
              <p className="text-sm font-black text-[#032e4d]">
                Choose syllabus topics
              </p>
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
              <span className="field-label">
                Add custom topics (comma-separated)
              </span>
              <input
                className="field"
                value={customTopic}
                onChange={(event) => setCustomTopic(event.target.value)}
                placeholder="Optional"
              />
            </label>
            <label className="mt-5 block">
              <span className="field-label">Curriculum or exam year</span>
              <select
                className="field"
                value={curriculumYear}
                onChange={(event) => setCurriculumYear(event.target.value)}
              >
                {(discovery.curriculum_years?.length
                  ? discovery.curriculum_years
                  : ["Current"]
                ).map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </label>
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
            <p className="eyebrow">Shape your attempt</p>
            <h2 className="mt-2 text-2xl font-black text-[#032e4d]">
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
              <legend className="field-label">{t("numberQuestions")}</legend>
              <div className="grid grid-cols-2 gap-2">
                {[5, 10].map((number) => (
                  <button
                    key={number}
                    type="button"
                    disabled={!questionOptions.includes(number)}
                    onClick={() => setCount(number)}
                    className={`rounded-xl border p-3 font-black disabled:cursor-not-allowed disabled:opacity-35 ${count === number ? "border-[#ff6b00] bg-[#fff0e5] text-[#b94700]" : "border-[#dce5eb]"}`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              {questionOptions.length === 1 && (
                <p className="mt-2 text-xs text-[#607282]">
                  Free sessions contain 5 questions. Upgrade to Pro to choose 5
                  or 10.
                </p>
              )}
            </fieldset>
            <fieldset className="mt-6">
              <legend className="field-label">{t("mode")}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["learn", "Learn", "Feedback after every answer"],
                  [
                    "simulate",
                    "Simulate",
                    "Review freely, feedback at the end",
                  ],
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
                      min={1}
                      max={480}
                      value={timer}
                      onChange={(event) => setTimer(Number(event.target.value))}
                    />
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
              <span className="mt-1 block text-xs text-[#607282]">
                This goal shapes report encouragement, not question difficulty.
              </span>
            </label>
            <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ChevronLeft size={17} />
                {t("back")}
              </Button>
              <Button onClick={generate} disabled={busy}>
                {busy ? "…" : t("generate")}
                <Sparkles size={17} />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
