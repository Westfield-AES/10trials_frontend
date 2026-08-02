import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/site/legal-page";
import { CookiePreferencesButton } from "@/components/site/cookie-preferences-button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How 10Trials collects, uses, protects, and shares personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="We built 10Trials to help you practise, not to trade in your personal information. This policy explains what we collect, why we need it, and the choices you have."
      updatedAt="2 August 2026"
    >
      <LegalSection title="The short version">
        <ul>
          <li>We do not sell or rent your personal information.</li>
          <li>
            We use your account and study data to provide the learning service,
            keep it secure, and improve how it works.
          </li>
          <li>
            Optional analytics only run when you allow them, and we do not use
            your study answers to target advertising.
          </li>
          <li>
            We do not receive or store your full payment-card number or card
            security code.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Who is responsible for your information">
        <p>
          10Trials is an online exam-practice service operated from Nigeria. For
          data-protection purposes, 10Trials decides why and how the personal
          information described in this policy is used.
        </p>
        <p>
          This policy applies to our website, web application, account
          communications, and support interactions. You can contact us at{" "}
          <Link href="mailto:hello@10trials.com">hello@10trials.com</Link> for
          any privacy question or request.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>We collect only what we reasonably need to run 10Trials:</p>
        <ul>
          <li>
            <strong>Account details:</strong> your name, email address, login
            identifier, email-verification status, preferred language, and
            account settings.
          </li>
          <li>
            <strong>Age and consent records:</strong> confirmation that you are
            at least 13 and, where relevant, confirmation of permission from a
            parent or guardian. We do not ask for your full date of birth.
          </li>
          <li>
            <strong>Study information:</strong> exam descriptions, chosen topics
            and settings, generated questions, answers, scores, feedback,
            reports, and session history.
          </li>
          <li>
            <strong>Plan and transaction records:</strong> your plan, billing
            period, currency, payment status, amount, and limited transaction or
            subscription references. Payment-card details are handled by a
            payment processor and are not stored by 10Trials.
          </li>
          <li>
            <strong>Technical and security information:</strong> IP address,
            basic browser or device information, request timestamps, usage
            counts, security events, and error diagnostics.
          </li>
          <li>
            <strong>Choices and communications:</strong> cookie preferences,
            reminder preferences, consent records, support messages, and emails
            we send about your account.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Why we use it">
        <p>We use personal information to:</p>
        <ul>
          <li>create and secure your account;</li>
          <li>
            generate practice sessions, grade answers, and prepare reports;
          </li>
          <li>save progress and apply monthly plan allowances;</li>
          <li>process subscriptions and maintain transaction records;</li>
          <li>send verification, security, billing, and service messages;</li>
          <li>
            prevent abuse, investigate errors, and protect the service; and
          </li>
          <li>
            understand and improve 10Trials when you have allowed optional
            analytics.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Our legal reasons for using it">
        <p>
          Depending on the activity, we rely on one or more of these grounds:
        </p>
        <ul>
          <li>
            <strong>Contract:</strong> to create your account and provide the
            service you ask for.
          </li>
          <li>
            <strong>Consent:</strong> for optional analytics, optional
            reminders, and the processing of a learner&apos;s information where
            parent or guardian permission is required. You may withdraw consent
            at any time for future processing.
          </li>
          <li>
            <strong>Legitimate interests:</strong> to keep 10Trials safe,
            prevent fraud and misuse, diagnose failures, and improve the
            service, where those interests do not override your rights.
          </li>
          <li>
            <strong>Legal obligations:</strong> to keep required financial or
            consent records, respond to lawful requests, and protect legal
            rights.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="AI-generated learning content">
        <p>
          To create questions and feedback, relevant study prompts, exam
          settings, questions, and answers may be processed by specialised AI
          systems working for us. Please do not include private, confidential,
          or sensitive information in a study prompt or answer unless it is
          genuinely needed.
        </p>
        <p>
          AI-generated grading only affects your practice feedback. It does not
          make decisions about admission, employment, credit, or any other
          matter with a legal or similarly significant effect. You can contact
          us if you believe automated feedback has handled your information
          unfairly.
        </p>
      </LegalSection>

      <LegalSection title="When information is shared">
        <p>
          We share only what is necessary with carefully selected organisations
          that help us operate the service. These categories include:
        </p>
        <ul>
          <li>cloud hosting, database, storage, and security providers;</li>
          <li>account authentication and identity services;</li>
          <li>AI processing services used for questions and feedback;</li>
          <li>payment and subscription processors;</li>
          <li>transactional email delivery services;</li>
          <li>
            analytics and error-monitoring services, subject to your choices
            where consent is required; and
          </li>
          <li>
            professional advisers, regulators, courts, or law-enforcement bodies
            when reasonably necessary or legally required.
          </li>
        </ul>
        <p>
          These organisations may only use the information for the agreed
          service or as the law permits. We do not share personal information
          with data brokers or advertisers.
        </p>
      </LegalSection>

      <LegalSection title="International processing">
        <p>
          Some service providers may process information outside Nigeria. When
          this happens, we use providers and safeguards intended to give the
          information an appropriate level of protection, such as recognised
          adequacy arrangements or contractual protections, and we limit what is
          transferred to what is necessary.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep information">
        <ul>
          <li>
            Account settings and study history are generally kept while your
            account remains active so you can resume learning and review past
            reports.
          </li>
          <li>
            A deletion request disables your account and starts a 30-day
            recovery window. During that window, you may restore the account.
            The account is marked for permanent deletion after the window.
          </li>
          <li>
            Limited billing, tax, consent, security, dispute, and audit records
            may be kept for up to six years, or longer where a specific law or
            active legal claim requires it.
          </li>
          <li>
            Temporary session, diagnostic, and backup data is removed or
            overwritten on shorter operational cycles where practical.
          </li>
        </ul>
        <p>
          When information is no longer needed, we delete it or remove the
          details that identify you.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and similar storage">
        <p>
          Essential browser storage keeps you signed in, remembers language and
          privacy choices, and supports core app features. It is necessary for
          the service to work. Optional analytics storage helps us understand
          broad product usage and is used only after you choose “Allow
          analytics.” We do not use advertising cookies or session replay.
        </p>
        <p>You can review or change your choice at any time.</p>
        <CookiePreferencesButton />
      </LegalSection>

      <LegalSection title="Your privacy rights">
        <p>
          Depending on the law that applies, you may ask us to access, correct,
          delete, restrict, or provide a portable copy of your personal
          information. You may also object to certain processing, withdraw
          consent, and ask for human review of qualifying automated decisions.
        </p>
        <p>
          Email <Link href="mailto:hello@10trials.com">hello@10trials.com</Link>{" "}
          with “Privacy request” in the subject. We may need to verify your
          identity before acting. Some rights have lawful exceptions. For
          example, records may need to be kept for tax, fraud-prevention, or
          legal-claim purposes.
        </p>
        <p>
          If you are unhappy with our response, you may complain to the{" "}
          <Link href="https://ndpc.gov.ng">
            Nigeria Data Protection Commission
          </Link>{" "}
          or another regulator with authority where you live.
        </p>
      </LegalSection>

      <LegalSection title="Children and teenagers">
        <p>
          10Trials is not for children under 13. Learners under 18 must have
          permission from a parent or legal guardian. A parent or guardian may
          contact us to review or request deletion of a young learner&apos;s
          information. If we learn that an under-13 account was created, we will
          disable it and take appropriate steps to remove the information.
        </p>
      </LegalSection>

      <LegalSection title="How we protect information">
        <p>
          We use access controls, encrypted connections, restricted
          administrative access, data minimisation, monitoring, and other
          organisational and technical safeguards. No online service can promise
          perfect security, but if a breach creates a meaningful risk, we will
          investigate and notify affected people or regulators as the law
          requires.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this policy when the product, law, or our practices
          change. We will update the date above and provide a clearer notice for
          material changes. Where fresh consent is legally required, we will ask
          before the new processing begins.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
