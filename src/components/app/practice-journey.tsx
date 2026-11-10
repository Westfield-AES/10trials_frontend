import Link from "next/link";
import { ArrowRight, BookOpenCheck, Sparkles } from "lucide-react";
import type { AccountOverview } from "@/lib/types";
import { practiceAction } from "@/lib/practice-flow";

export function PracticeJourneyCard({
  account,
  showAction = true,
}: {
  account?: AccountOverview;
  showAction?: boolean;
}) {
  if (!account?.journey) return null;
  const { journey } = account;
  const free = journey.usage_period === "lifetime";
  const exhausted = !journey.can_generate;
  const action = practiceAction(journey);
  const title =
    free && exhausted
      ? "Free allowance used up"
      : free
        ? "Free practice"
        : exhausted
          ? "Monthly allowance used up"
          : "Pro practice";
  const description = free
    ? exhausted
      ? "Upgrade to Pro for more sessions."
      : "One-time allowance per account."
    : exhausted
      ? "More sessions available next calendar month."
      : "Allowance resets each calendar month.";
  return (
    <section
      className={`rounded-2xl border p-5 sm:p-6 ${free && exhausted ? "border-[#ffb680] bg-[#fff0e5]" : "border-[#d9e5ec] bg-white"}`}
      aria-label="Your practice access"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-[#032e4d]">
            {free ? (
              <Sparkles size={18} className="text-[#e85b00]" />
            ) : (
              <BookOpenCheck size={18} className="text-[#e85b00]" />
            )}
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#607282]">{description}</p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-5 border-t border-[#dce5eb]/70 pt-4 sm:min-w-52 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#b94700]">
              {journey.sessions_remaining}
            </p>
            <p className="mt-1 text-xs font-bold text-[#607282]">
              sessions left
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#032e4d]">
              {journey.questions_remaining}
            </p>
            <p className="mt-1 text-xs font-bold text-[#607282]">
              questions left
            </p>
          </div>
        </div>
      </div>
      {showAction && (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link
            href={action.href}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e85b00] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c94d00] sm:w-auto"
          >
            {action.label}
            <ArrowRight size={16} />
          </Link>
          {free && !exhausted && (
            <Link
              href="/app/billing"
              className="text-sm font-extrabold text-[#07436c]"
            >
              Explore Pro
            </Link>
          )}
          {exhausted && action.href !== "/app/history" && (
            <Link
              href="/app/history"
              className="text-sm font-extrabold text-[#07436c]"
            >
              View history
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
