import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
export const metadata: Metadata = { title: "Terms" };
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      sections={[
        "Educational purpose|10Trials is a study tool. Generated questions and feedback are not official examination materials and do not guarantee any exam result.",
        "Accounts|Keep your account secure and provide accurate age and consent information. One person should use each learner account.",
        "Usage and plans|A session counts after questions are successfully generated, including abandoned sessions. Limits reset by calendar month. Paid access depends on successful subscription status.",
        "Acceptable use|Do not attack the service, automate abusive requests, resell generated content, or use the platform for live examination misconduct.",
        "Availability|AI and third-party services can occasionally fail. Durable jobs preserve state where practical, but uninterrupted availability is not guaranteed.",
      ]}
    />
  );
}
