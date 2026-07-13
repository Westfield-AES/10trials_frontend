import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf5] p-6">
      <section className="card max-w-lg p-8 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-3xl font-black text-[#032e4d]">
          This page isn’t part of the trial
        </h1>
        <p className="mt-3 text-[#607282]">
          The link may be outdated, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-[#ff6b00] px-6 py-3 font-extrabold text-white"
        >
          Back to 10Trials
        </Link>
      </section>
    </main>
  );
}
