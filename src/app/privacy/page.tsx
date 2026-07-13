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
        "Analytics and monitoring|PostHog analytics requires consent. Sentry is configured to avoid intentional collection of learning answers and direct personal identifiers.",
        "Deletion|Soft deletion is reversible for 30 days. Hard deletion removes identifiable learning data while retaining anonymous aggregates and legally required payment records.",
        "Children and teenagers|10Trials requires users to be at least 13. Users under 18 confirm guardian consent.",
      ]}
    />
  );
}
