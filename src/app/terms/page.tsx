import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The rules for using 10Trials and its exam-practice services.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="These terms set the ground rules for using 10Trials. We have kept them as direct as possible so you can understand what to expect from us and what we expect from you."
      updatedAt="2 August 2026"
    >
      <LegalSection title="Agreeing to these terms">
        <p>
          By creating an account, buying a plan, or using 10Trials, you agree to
          these Terms and acknowledge our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you do not agree,
          please do not use the service.
        </p>
        <p>
          If you are under 18, your parent or legal guardian must give
          permission for you to use 10Trials and should review these Terms with
          you. You must be at least 13 to create an account.
        </p>
      </LegalSection>

      <LegalSection title="What 10Trials provides">
        <p>
          10Trials is a self-study service that creates exam-practice questions,
          simulations, feedback, scores, and progress reports. It is designed to
          support preparation. It does not replace a teacher, official syllabus,
          examination body, or professional advice.
        </p>
        <p>
          Generated content may occasionally be incomplete, outdated, or wrong.
          You should check important information against official study
          materials. Using 10Trials does not guarantee admission, certification,
          a particular score, or any other result.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <ul>
          <li>Give accurate account, age, and consent information.</li>
          <li>Keep your password and sign-in methods private and secure.</li>
          <li>Use one learner account per person unless we agree otherwise.</li>
          <li>
            Tell us promptly if you believe somebody has accessed your account
            without permission.
          </li>
        </ul>
        <p>
          You are responsible for activity carried out through your account
          unless it resulted from a security failure that was our
          responsibility.
        </p>
      </LegalSection>

      <LegalSection title="Plans, prices, and renewal">
        <p>
          10Trials offers a Free plan and paid Pro plans. The price, currency,
          billing period, and included allowances are shown before you confirm
          payment. Paid subscriptions renew automatically for the selected
          billing period until cancelled.
        </p>
        <p>
          You can cancel future renewal through the billing area. Unless the law
          requires otherwise, cancellation takes effect at the end of the paid
          billing period and you keep Pro access until then. If a renewal fails,
          we may provide a short grace period before moving the account to the
          Free plan.
        </p>
        <p>
          If you are charged incorrectly or a paid service is not provided as
          promised, contact us so we can investigate. We provide refunds and
          other remedies where required by applicable consumer law. Approved
          refunds are normally returned through the original payment method.
        </p>
      </LegalSection>

      <LegalSection title="Session allowances">
        <p>
          Each plan has session and question allowances shown on the pricing and
          billing pages. A session counts once its questions have been
          successfully generated, even if you later abandon it. Monthly
          allowances reset on a calendar-month basis and unused allowances do
          not roll over unless we clearly say otherwise.
        </p>
        <p>
          We may correct an allowance or plan status when a technical or billing
          error has applied it incorrectly. We will not charge a hidden
          pay-per-use fee for exceeding an allowance; the app will instead ask
          you to wait for the reset or choose an available plan.
        </p>
      </LegalSection>

      <LegalSection title="Your study content">
        <p>
          You keep any rights you already have in the original material you
          enter. You give 10Trials a limited permission to host, copy, process,
          and transform that material only as needed to provide and secure the
          service in line with our Privacy Policy.
        </p>
        <p>
          Do not upload confidential information, personal information about
          somebody else without permission, or material you do not have the
          right to use. Generated content may not be unique, and another user
          may receive similar questions or feedback.
        </p>
      </LegalSection>

      <LegalSection title="A fair-use licence">
        <p>
          We give you a personal, limited, non-exclusive, non-transferable right
          to use 10Trials and its generated learning content for your own study.
          The 10Trials name, software, design, and original platform materials
          remain ours or belong to their respective owners.
        </p>
        <p>
          You may not scrape or bulk-download the service, resell access or
          generated content, copy the platform to build a competing service, or
          remove ownership notices without permission.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>Do not use 10Trials to:</p>
        <ul>
          <li>cheat during a live examination or help somebody else cheat;</li>
          <li>break a law or infringe another person&apos;s rights;</li>
          <li>
            probe, attack, overload, bypass limits, or interfere with the
            service or another account;
          </li>
          <li>
            use bots, scripts, or misleading identities to obtain access or
            allowances unfairly;
          </li>
          <li>upload malicious code or deliberately harmful content; or</li>
          <li>harass others or generate unlawful abusive material.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Service availability and changes">
        <p>
          We work to keep 10Trials reliable, but maintenance, internet problems,
          security events, and external systems can cause delays or
          interruptions. We do not promise uninterrupted or error-free access.
        </p>
        <p>
          We may add, remove, or change features and plan limits as the service
          develops. We will give reasonable notice before a material change that
          negatively affects an active paid subscription, unless an urgent legal
          or security reason prevents advance notice.
        </p>
      </LegalSection>

      <LegalSection title="Suspension and account closure">
        <p>
          You may request account deletion in Settings. Your account is disabled
          first and can be restored during the stated 30-day recovery window.
        </p>
        <p>
          We may restrict or suspend access when reasonably necessary to stop a
          security threat, investigate misuse, protect other users, or comply
          with law. We may close an account for a serious or repeated breach of
          these Terms. Where practical and safe, we will explain the reason and
          offer a way to contact us.
        </p>
      </LegalSection>

      <LegalSection title="Responsibility when things go wrong">
        <p>
          Nothing in these Terms removes rights or remedies that cannot legally
          be excluded. This includes applicable consumer rights and liability
          arising from fraud, deliberate misconduct, or gross negligence.
        </p>
        <p>
          To the extent the law allows, 10Trials is not responsible for losses
          that were not reasonably foreseeable when you agreed to these Terms,
          for exam outcomes, or for events outside our reasonable control. You
          remain responsible for how you rely on study content and for checking
          important information against official sources.
        </p>
      </LegalSection>

      <LegalSection title="Resolving concerns">
        <p>
          If something is wrong, email{" "}
          <Link href="mailto:hello@10trials.com">hello@10trials.com</Link>{" "}
          first. We will try to understand the issue and reach a fair
          resolution. These Terms are governed by the laws of the Federal
          Republic of Nigeria, and disputes may be brought before a court with
          competent jurisdiction in Nigeria.
        </p>
        <p>
          Nothing here prevents you from using a complaint process or mandatory
          consumer right available under applicable law in Nigeria or where you
          live.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these Terms when the service or law changes. We will
          update the date above and give reasonable notice of material changes.
          Changes apply from the stated effective date; continuing to use the
          service after that date means you accept the updated Terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
