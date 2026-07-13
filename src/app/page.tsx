import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  Clock3,
  Globe2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

const features = [
  {
    icon: Brain,
    title: "Learn as you answer",
    body: "Get precise feedback after every question, with the idea explained in plain language.",
  },
  {
    icon: Clock3,
    title: "Simulate the real thing",
    body: "Practise under timed exam conditions, flag questions, review, and submit with confidence.",
  },
  {
    icon: Target,
    title: "Attack weak areas",
    body: "Every report finds the topics holding you back and turns them into ten focused retry questions.",
  },
  {
    icon: Globe2,
    title: "Any exam, four languages",
    body: "Prepare in English, French, Spanish, or Portuguese for academic and professional exams worldwide.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="relative overflow-hidden bg-[#fffaf5] py-18 sm:py-24">
          <div className="grid-dots absolute inset-y-0 right-0 w-1/2 opacity-45" />
          <div className="container-shell relative grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <p className="eyebrow">Your next attempt can be your best one</p>
              <h1 className="text-balance mt-5 max-w-3xl text-5xl font-black leading-[1.04] tracking-[-0.055em] text-[#032e4d] sm:text-6xl">
                Practise smarter.
                <br />
                <span className="text-[#ff6b00]">Perform stronger.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#526877]">
                Describe any exam. Choose how you want to train. Get original
                questions, useful feedback, and a clear view of what to work on
                next.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-7 font-extrabold text-white shadow-[0_12px_25px_rgba(232,91,0,.25)] hover:bg-[#e85b00]"
                >
                  Start free <ArrowRight size={18} />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex min-h-13 items-center justify-center rounded-xl border border-[#b9cbd6] bg-white px-7 font-extrabold text-[#032e4d]"
                >
                  See how it works
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-[#607282]">
                <span className="flex items-center gap-2">
                  <Check size={17} className="text-[#17885b]" /> No card
                  required
                </span>
                <span className="flex items-center gap-2">
                  <Check size={17} className="text-[#17885b]" /> 5 free sessions
                  monthly
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -left-6 -top-5 grid size-16 place-items-center rounded-2xl bg-[#ff6b00] text-white shadow-xl">
                <Trophy />
              </div>
              <div className="card rotate-[1.2deg] p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#607282]">
                      WAEC Chemistry
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#032e4d]">
                      Question 7 of 10
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#dff5e9] px-3 py-1 text-xs font-extrabold text-[#13734d]">
                    Learn mode
                  </span>
                </div>
                <div className="my-6 h-2 overflow-hidden rounded-full bg-[#dcebf4]">
                  <div className="h-full w-[70%] rounded-full bg-[#ff6b00]" />
                </div>
                <p className="text-xs font-extrabold text-[#e85b00]">
                  STOICHIOMETRY
                </p>
                <p className="mt-2 text-lg font-bold leading-7">
                  What is the molar mass of H₂O?
                </p>
                <div className="mt-5 grid gap-3">
                  {[
                    "A  ·  16 g/mol",
                    "B  ·  18 g/mol",
                    "C  ·  20 g/mol",
                    "D  ·  22 g/mol",
                  ].map((option, index) => (
                    <div
                      key={option}
                      className={`rounded-xl border p-3.5 text-sm font-bold ${index === 1 ? "border-[#ff6b00] bg-[#fff0e5] text-[#b94700]" : "border-[#dce5eb]"}`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl bg-[#e9f8f0] p-4">
                  <p className="font-black text-[#13734d]">
                    Correct — nice work!
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#3f6554]">
                    Two hydrogen atoms plus one oxygen atom gives 18 g/mol.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-22">
          <div className="container-shell">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Built around your goal</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
                From “I have an exam” to a focused plan
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                [
                  "01",
                  "Name your exam",
                  "Describe it naturally. 10Trials identifies the exam, governing body, syllabus topics, and relevant years.",
                ],
                [
                  "02",
                  "Shape your session",
                  "Choose difficulty, topics, question format, Learn or Simulate mode, and a target score.",
                ],
                [
                  "03",
                  "Practise and improve",
                  "Answer, review your report, and retry the weak areas with ten fresh questions.",
                ],
              ].map(([number, title, body]) => (
                <article key={number} className="card p-7">
                  <span className="text-3xl font-black text-[#ff6b00]">
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

        <section className="bg-[#032e4d] py-22 text-white">
          <div className="container-shell">
            <div className="grid gap-5 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/15 bg-white/7 p-7"
                >
                  <div className="grid size-12 place-items-center rounded-xl bg-[#ff6b00]">
                    <Icon />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{title}</h3>
                  <p className="mt-2 leading-7 text-[#c7d8e4]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-22">
          <div className="container-shell grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="eyebrow">Questions, answered</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
                A clear start, no guesswork
              </h2>
            </div>
            <div className="divide-y divide-[#dce5eb]">
              {[
                [
                  "Can I prepare for any exam?",
                  "Yes. 10Trials can identify academic, professional, certification, and civil-service exams from a natural-language description.",
                ],
                [
                  "What is the difference between Learn and Simulate?",
                  "Learn gives feedback after each answer. Simulate behaves like an exam: navigate freely, flag questions, and receive results after submission.",
                ],
                [
                  "Can I use it without WhatsApp?",
                  "Absolutely. The website is a complete standalone experience. Optional WhatsApp connection will arrive as a Pro feature later.",
                ],
                [
                  "Does closing the browser stop a timer?",
                  "No. Timed simulations are enforced on the server and submit automatically when time expires.",
                ],
              ].map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="cursor-pointer list-none pr-8 text-lg font-black text-[#032e4d]">
                    {q}
                  </summary>
                  <p className="mt-3 max-w-2xl leading-7 text-[#607282]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-22">
          <div className="container-shell overflow-hidden rounded-[2rem] bg-[#fff0e5] px-6 py-14 text-center sm:px-12">
            <Sparkles className="mx-auto text-[#ff6b00]" />
            <h2 className="text-balance mx-auto mt-4 max-w-2xl text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
              One exam. Ten trials. A stronger you each time.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#607282]">
              Start with five free sessions every calendar month.
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-flex min-h-13 items-center rounded-xl bg-[#032e4d] px-7 font-extrabold text-white"
            >
              Create your free account
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
