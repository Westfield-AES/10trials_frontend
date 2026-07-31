import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        "What we collect|Account identity, verified contact information, learning-session answers, performance reports, consent records, and necessary subscription references.",
        "How we use it|To provide exam practice, keep accounts secure, calculate usage, improve generated feedback, process subscriptions, and support account requests.",
        "Analytics and monitoring|PostHog requires consent, with automatic interaction capture and session recording disabled. You can change cookie preferences at any time. Sentry removes request bodies, query strings, direct identifiers, and sensitive headers before sending events.",
        "Policy version|This privacy and consent policy was last updated on 31 July 2026.",
        "Deletion|Account deletion is recoverable through the account restoration flow.",
        "Children and teenagers|10Trials requires users to be at least 13. Users under 18 confirm guardian consent.",
      ]}
    />
  );
}
