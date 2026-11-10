import type { PracticeJourney } from "./types";

export function practiceAction(journey?: PracticeJourney) {
  switch (journey?.next_step) {
    case "resume":
      return { href: "/app/session", label: "Continue session" };
    case "upgrade":
      return { href: "/app/billing", label: "Upgrade to Pro" };
    case "wait_for_reset":
      return { href: "/app/history", label: "View history" };
    case "start_free":
      return { href: "/app/new", label: "Start free session" };
    default:
      return { href: "/app/new", label: "New session" };
  }
}
