"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { AccountOverview } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";

const statusLabels: Record<string, string> = {
  generating: "Preparing questions…",
  ready: "Ready to start",
  active: "In progress",
  grading: "Marking answers…",
};

export function ActiveSessionCard({
  session,
  onEnd,
  ending = false,
  canGenerate = true,
}: {
  session: NonNullable<AccountOverview["active_session"]>;
  onEnd?: () => void;
  ending?: boolean;
  canGenerate?: boolean;
}) {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#032e4d] p-6 text-white sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffb580]">
            <BookOpen size={16} /> Current session
          </p>
          <h2 className="mt-4 text-2xl font-bold leading-snug tracking-tight">
            {session.exam_name || "Practice session"}
          </h2>
          {statusLabels[session.status] && (
            <p className="mt-1 text-sm text-[#c7d8e4]">
              {statusLabels[session.status]}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          <Link
            href="/app/session"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#e85b00] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#c94d00]"
          >
            {t("continue")} <ArrowRight size={17} />
          </Link>
          {onEnd && (
            <Button
              variant="secondary"
              className="border border-white/40"
              onClick={onEnd}
              disabled={ending}
            >
              {ending
                ? "Ending session…"
                : canGenerate
                  ? "End & start new"
                  : "End session"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
