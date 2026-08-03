import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  Globe2,
  MessageSquareText,
  Target,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

const features = [
  {
    icon: MessageSquareText,
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
    title: "Target weak areas",
    body: "Every report finds the topics holding you back and turns them into a focused retry session.",
  },
  {
    icon: Globe2,
    title: "Built for high-stakes goals",
    body: "Prepare for professional certifications, licensure, admissions, and advanced academic exams in four languages.",
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
        <section className="bg-[#f7f9fb] py-18 sm:py-24">
          <div className="container-shell grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <p className="eyebrow">
                Focused preparation for high-stakes exams
              </p>
              <h1 className="text-balance mt-5 max-w-3xl text-5xl font-black leading-[1.04] tracking-[-0.055em] text-[#032e4d] sm:text-6xl">
                Practise smarter.
                <br />
                <span className="text-[#ff6b00]">Perform stronger.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#526877]">
                Prepare for a professional certification, licence, admissions
                test, or advanced exam with original questions, precise
                feedback, and a clear view of what to work on next.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#e85b00] px-7 font-bold text-white hover:bg-[#c94d00]"
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
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-[#607282]">
                <span className="flex items-center gap-2">
                  <Check size={17} className="text-[#17885b]" /> No card
                  required
                </span>
                <span className="flex items-center gap-2">
                  <Check size={17} className="text-[#17885b]" /> 10 free
                  sessions monthly
                </span>
              </div>
            </div>
            <div className="mx-auto w-full max-w-lg">
              <div className="card p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#607282]">
                      AWS Solutions Architect – Associate
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
                  DESIGN RESILIENT ARCHITECTURES
                </p>
                <p className="mt-2 text-lg font-bold leading-7">
                  A stateless web application must remain available if one
                  Availability Zone fails. Which architecture best meets this
                  requirement?
                </p>
                <div className="mt-5 grid gap-3">
                  {[
                    "A  ·  One larger EC2 instance in a single Availability Zone",
                    "B  ·  An Auto Scaling group across multiple Availability Zones behind an Application Load Balancer",
                    "C  ·  Multiple EC2 instances in one Availability Zone with nightly snapshots",
                    "D  ·  One EC2 instance with two attached EBS volumes",
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
                    Correct. This is the most resilient design.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#3f6554]">
                    Distributing instances across Availability Zones removes a
                    single-zone failure point, while the load balancer routes
                    traffic to healthy instances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="exam-coverage-title"
          className="border-y border-[#dce5eb] bg-white py-9"
        >
          <div className="container-shell">
            <div className="grid gap-6 lg:grid-cols-[.8fr_2.2fr] lg:items-center">
              <div>
                <p className="eyebrow">Broad exam coverage</p>
                <h2
                  id="exam-coverage-title"
                  className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#032e4d]"
                >
                  Built for serious credentials
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {examFamilies.map((family) => (
                  <div key={family.category}>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#e85b00]">
                      {family.category}
                    </p>
                    <p className="mt-1 text-sm font-bold leading-6 text-[#526877]">
                      {family.exams}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-22">
          <div className="container-shell">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Built around your goal</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
                From exam goal to focused plan
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                [
                  "01",
                  "Identify the exact exam",
                  "Enter the credential, provider, level, country, or exam code. 10Trials maps the official name, governing body, domains, and relevant version.",
                ],
                [
                  "02",
                  "Shape your session",
                  "Choose difficulty, topics, question format, Learn or Simulate mode, and a target score.",
                ],
                [
                  "03",
                  "Practise and improve",
                  "Answer, review your report, and retry the weak areas with a fresh focused session.",
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
                  "10Trials supports professional certifications, licensing exams, postgraduate admissions tests, language proficiency, civil-service, and advanced academic exams. Enter the exact credential or describe it naturally.",
                ],
                [
                  "What is the difference between Learn and Simulate?",
                  "Learn gives feedback after each answer. Simulate behaves like an exam: navigate freely, flag questions, and receive results after submission.",
                ],
                [
                  "Do I need to install an app?",
                  "No. 10Trials runs entirely in your browser on desktop or mobile.",
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
          <div className="container-shell overflow-hidden rounded-xl border border-[#dce5eb] bg-[#f4f7f9] px-6 py-14 text-center sm:px-12">
            <h2 className="text-balance mx-auto max-w-2xl text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
              One exam. Ten focused trials. Measurable progress.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#607282]">
              Start with ten free sessions every calendar month.
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-flex min-h-13 items-center rounded-xl bg-[#032e4d] px-7 font-bold text-white"
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
