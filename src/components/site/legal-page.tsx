import Link from "next/link";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: string[];
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="py-16">
        <article className="container-shell max-w-3xl">
          <p className="eyebrow">Placeholder for legal review</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
            {title}
          </h1>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            This draft communicates intended product behavior but is not legal
            advice. It must be reviewed by qualified counsel before public
            launch.
          </div>
          <div className="mt-8 space-y-8">
            {sections.map((section) => {
              const [heading, body] = section.split("|");
              return (
                <section key={heading}>
                  <h2 className="text-xl font-black text-[#032e4d]">
                    {heading}
                  </h2>
                  <p className="mt-2 leading-7 text-[#526877]">{body}</p>
                </section>
              );
            })}
          </div>
          <p className="mt-10 text-sm text-[#607282]">
            Questions? Contact{" "}
            <Link
              className="font-bold text-[#07436c]"
              href="mailto:hello@10trials.com"
            >
              hello@10trials.com
            </Link>
            .
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
