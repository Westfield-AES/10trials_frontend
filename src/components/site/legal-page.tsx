import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function LegalPage({
  title,
  intro,
  updatedAt,
  children,
}: {
  title: string;
  intro: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-[#fffaf5] py-16 sm:py-20">
        <article className="container-shell max-w-4xl">
          <p className="eyebrow">Legal, in plain language</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#032e4d] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#526877]">
            {intro}
          </p>
          <p className="mt-4 text-sm font-bold text-[#607282]">
            Last updated: {updatedAt}
          </p>

          <div className="mt-10 space-y-10 rounded-[1.5rem] border border-[#dce5eb] bg-white p-6 shadow-sm sm:p-10">
            {children}
          </div>

          <div className="mt-8 rounded-2xl bg-[#edf3f6] p-5 text-sm leading-6 text-[#526877]">
            Questions or concerns? Email{" "}
            <Link
              className="font-black text-[#07436c] underline decoration-[#9fc4d9] underline-offset-4"
              href="mailto:hello@10trials.com"
            >
              hello@10trials.com
            </Link>
            . We will do our best to respond clearly and promptly.
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-black tracking-[-0.02em] text-[#032e4d] sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-4 leading-7 text-[#526877] [&_a]:font-bold [&_a]:text-[#07436c] [&_a]:underline [&_a]:decoration-[#9fc4d9] [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-black [&_strong]:text-[#29485e] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
