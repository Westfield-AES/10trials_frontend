import Link from "next/link";
export default function BillingCallbackPage() {
  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center bg-[#fffaf5] p-5"
    >
      <section className="card max-w-md p-8 text-center">
        <h1 className="text-3xl font-black text-[#032e4d]">Payment received</h1>
        <p className="mt-3 leading-7 text-[#607282]">
          Paystack is confirming your subscription. Your plan will update as
          soon as the secure webhook arrives.
        </p>
        <Link
          href="/app/billing"
          className="mt-6 inline-flex rounded-xl bg-[#ff6b00] px-6 py-3 font-extrabold text-white"
        >
          Return to billing
        </Link>
      </section>
    </main>
  );
}
