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
      <main id="main-content" className="bg-[#f7f9fb] py-12 sm:py-20">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-3">Invest in your next step</p>
            <h1 className="text-4xl font-bold tracking-[-0.05em] text-[#032e4d] sm:text-5xl">
              Choose your plan
            </h1>
            <p className="mt-4 text-lg text-[#607282]">
              Start free. Upgrade when you need more practice.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-2">
            <Plan
              title="Free"
              price="₦0"
              body="One-time allowance. No card required."
              features={[
                "5 sessions of 10 questions",
                "Learn and Simulate",
                "Reports and history",
              ]}
              href="/signup"
              action="Start free"
            />
            <Plan
              featured
              title="Pro"
              price="₦15,000/month"
              body="Practice allowance renews each calendar month."
              features={[
                "30 sessions of 10 questions per month",
                "Priority generation",
                "Advanced insights",
              ]}
              href="/signup"
              action="Get started"
            />
          </div>
          <p className="mx-auto mt-7 max-w-2xl text-center text-sm text-[#607282]">
            Pro is ₦150,000/year with annual billing, saving ₦30,000 compared
            with monthly billing. Also available at $12/month or $120/year.
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
      className={`rounded-3xl p-6 sm:p-8 ${featured ? "bg-[#032e4d] text-white shadow-xl" : "card"}`}
    >
      <p
        className={`font-black ${featured ? "text-[#ff9b52]" : "text-[#607282]"}`}
      >
        {title}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {price}
      </p>
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
