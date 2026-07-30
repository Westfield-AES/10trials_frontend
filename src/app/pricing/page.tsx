import type { Metadata } from "next";
import { Check } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple Free and Pro plans for AI-powered exam practice.",
};
export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-[#fffaf5] py-20">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Simple pricing</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.05em] text-[#032e4d]">
              More practice when you need it
            </h1>
            <p className="mt-4 text-lg text-[#607282]">
              Start without a card. Upgrade when your goals need more attempts.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-2">
            <Plan
              title="Free"
              price="₦0"
              body="A meaningful monthly allowance."
              features={[
                "10 sessions per month",
                "50 questions",
                "10 questions per session",
                "Learn and Simulate",
                "Reports and history",
              ]}
              href="/signup"
              action="Start free"
            />
            <Plan
              featured
              title="Pro"
              price="₦5,000/month"
              body="For consistent, ambitious practice."
              features={[
                "30 sessions per month",
                "300 questions",
                "30 questions per session",
                "Priority generation",
                "Advanced insights",
                "Future WhatsApp connection",
              ]}
              href="/signup"
              action="Try Pro for 7 days"
            />
          </div>
          <p className="mx-auto mt-7 max-w-2xl text-center text-sm text-[#607282]">
            Also available at $5/month and annual billing in NGN or USD. Failed
            renewals receive a three-day grace period.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
function Plan({
  title,
  price,
  body,
  features,
  href,
  action,
  featured = false,
}: {
  title: string;
  price: string;
  body: string;
  features: string[];
  href: string;
  action: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`rounded-[1.5rem] p-8 ${featured ? "bg-[#032e4d] text-white shadow-xl" : "card"}`}
    >
      <p
        className={`font-black ${featured ? "text-[#ff9b52]" : "text-[#607282]"}`}
      >
        {title}
      </p>
      <p className="mt-3 text-4xl font-black">{price}</p>
      <p className={`mt-2 ${featured ? "text-[#c7d8e4]" : "text-[#607282]"}`}>
        {body}
      </p>
      <ul className="mt-7 space-y-3">
        {features.map((item) => (
          <li key={item} className="flex gap-3 text-sm">
            <Check
              size={18}
              className={featured ? "text-[#ff8a38]" : "text-[#17885b]"}
            />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 flex min-h-12 items-center justify-center rounded-xl font-extrabold ${featured ? "bg-[#ff6b00] text-white" : "bg-[#032e4d] text-white"}`}
      >
        {action}
      </Link>
    </article>
  );
}
