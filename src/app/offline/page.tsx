import Link from "next/link";
export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center bg-[#fffaf5] p-6 text-center"
    >
      <div className="card max-w-md p-8">
        <p className="eyebrow">You’re offline</p>
        <h1 className="mt-3 text-3xl font-black text-[#032e4d]">
          Reconnect to keep practising
        </h1>
        <p className="mt-4 leading-7 text-[#607282]">
          The 10Trials app shell is installed, but active sessions need a
          connection so answers and timers stay accurate.
        </p>
        <Link
          href="/app"
          className="mt-7 inline-flex rounded-xl bg-[#ff6b00] px-6 py-3 font-extrabold text-white"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
