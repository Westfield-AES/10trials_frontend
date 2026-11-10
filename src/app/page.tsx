import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  ChevronDown,
  Sparkles,
  Globe2,
  MessageSquareText,
  Target,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PracticePreview } from "@/components/site/practice-preview";

export const metadata: Metadata = {
  description:
    "Start with 5 free practice sessions of 10 questions each, once per account. No card needed. Upgrade to Pro when you want more exam practice.",
  openGraph: {
    title: "10Trials | Start free. Practise smarter.",
    description:
      "5 free sessions. 10 questions each. No card needed. Practise at your own pace and choose Pro when you’re ready for more.",
  },
};

const features = [
  {
    icon: MessageSquareText,
    title: "Learn as you answer",
    body: "Understand each answer with clear explanations.",
  },
  {
    icon: Clock3,
    title: "Simulate the real thing",
    body: "Practise with a timer, flag questions, and review before submitting.",
  },
  {
    icon: Target,
    title: "Target weak areas",
    body: "Find the gaps in your report, then retry those topics.",
  },
  {
    icon: Globe2,
    title: "Study in your language",
    body: "Choose English, French, Spanish, or Portuguese.",
  },
];

const examFamilies = [
  {
    category: "Cloud & IT",
    exams: "AWS Solutions Architect – Associate · CISSP · CompTIA Security+",
  },
  {
    category: "Business & finance",
    exams: "PMP · CFA Program · ACCA",
  },
  {
    category: "Healthcare & law",
    exams: "NCLEX-RN · USMLE · Bar examinations",
  },
  {
    category: "Admissions & language",
    exams: "GRE · GMAT · IELTS Academic",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="bg-[#f7f9fb] pb-14 pt-10 sm:py-20">
          <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f5d5bd] bg-[#fff0e5] px-3 py-2 text-xs font-semibold text-[#b94700]">
                <Sparkles size={14} /> Your next chapter starts with practice
              </p>
              <h1 className="text-balance max-w-3xl text-[clamp(2.5rem,10.5vw,3.5rem)] font-black leading-[1.08] tracking-[-0.055em] text-[#032e4d] sm:text-6xl">
                Practise smarter.
                <br />
                <span className="text-[#ff6b00]">Perform stronger.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 text-[#526877]">
                Prepare for your next exam with focused questions, clear
                feedback, and realistic simulations.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#e85b00] px-7 font-bold text-white shadow-[0_3px_0_#b94700] transition hover:bg-[#c94d00]"
                >
                  Start free <ArrowRight size={18} />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex min-h-13 items-center justify-center rounded-xl border border-[#b9cbd6] bg-white px-7 font-bold text-[#032e4d]"
                >
                  See how it works
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#607282]">
                <span className="flex items-center gap-2">
                  <Check size={17} className="text-[#17885b]" /> No card
                  required
                </span>
                <span className="flex items-center gap-2">
                  <Check size={17} className="text-[#17885b]" /> 5 free sessions
                </span>
              </div>
            </div>
            <PracticePreview />
          </div>
        </section>

        <section
          aria-labelledby="exam-coverage-title"
          className="border-y border-[#dce5eb] bg-white py-9"
        >
          <div className="container-shell">
            <div className="grid gap-6 lg:grid-cols-[.8fr_2.2fr] lg:items-center">
              <div>
                <h2
                  id="exam-coverage-title"
                  className="text-2xl font-black tracking-[-0.03em] text-[#032e4d]"
                >
                  Find your exam
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {examFamilies.map((family) => (
                  <div
                    key={family.category}
                    className="rounded-2xl bg-[#f7f9fb] p-4"
                  >
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#e85b00]">
                      {family.category}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[#526877]">
                      {family.exams}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-14 sm:py-20">
          <div className="container-shell">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#032e4d] sm:text-4xl">
                How it works
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                [
                  "01",
                  "Choose your exam",
                  "Enter your exam and select the topics you want to practise.",
                ],
                [
                  "02",
                  "Set up your session",
                  "Set the difficulty and choose Learn or Simulate mode.",
                ],
                [
                  "03",
                  "Review and improve",
                  "Use your results to focus your next session on weak areas.",
                ],
              ].map(([number, title, body]) => (
                <article key={number} className="card p-7">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#fff0e5] text-sm font-bold text-[#b94700]">
                    {number}
                  </span>
                  <h3 className="mt-5 text-xl font-black text-[#032e4d]">
                    {title}
                  </h3>
                  <p className="mt-3 leading-7 text-[#607282]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#032e4d] py-14 text-white sm:py-20">
          <div className="container-shell">
            <div className="grid gap-5 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/15 bg-white/7 p-7"
                >
                  <div className="grid size-10 place-items-center rounded-xl border border-white/20 bg-white/5 text-[#ff9b52]">
                    <Icon />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{title}</h3>
                  <p className="mt-2 leading-7 text-[#c7d8e4]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-14 sm:py-20">
          <div className="container-shell grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#032e4d] sm:text-4xl">
                Common questions
              </h2>
            </div>
            <div className="divide-y divide-[#dce5eb]">
              {[
                [
                  "What do I get for free?",
                  "5 sessions of 10 questions, once per account. The free allowance does not reset each month.",
                ],
                [
                  "Will I be charged when my free sessions run out?",
                  "No. You only pay if you choose a Pro plan.",
                ],
                [
                  "Can I still see my reports after using my free allowance?",
                  "Yes. You can review past reports and finish an existing session.",
                ],
                [
                  "What is the difference between Learn and Simulate?",
                  "Learn gives feedback after each answer. Simulate lets you review and flag questions, with results after submission.",
                ],
                [
                  "Does closing the browser stop a timer?",
                  "No. The timer keeps running and your answers are submitted when time expires.",
                ],
              ].map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[#032e4d]">
                    {q}
                    <ChevronDown
                      size={18}
                      className="shrink-0 text-[#607282] transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-3 max-w-2xl leading-7 text-[#607282]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-14 sm:pb-20">
          <div className="container-shell overflow-hidden rounded-3xl border border-[#dce5eb] bg-[#f4f7f9] px-6 py-14 text-center sm:px-12">
            <h2 className="text-balance mx-auto max-w-2xl text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
              Ready for your next exam?
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-[#607282]">
              Pro is ₦15,000/month or ₦150,000/year for 30 sessions of 10
              questions each month. Also available at $12/month or $120/year.
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-flex min-h-13 items-center rounded-xl bg-[#032e4d] px-7 font-bold text-white"
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="mt-4 block text-sm font-bold text-[#07436c]"
            >
              Compare plans
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
