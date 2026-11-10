import Link from "next/link";
export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center bg-[#fffaf5] p-6 text-center"
    >
      <div className="card max-w-md p-8">
        <h1 className="text-3xl font-black text-[#032e4d]">You’re offline</h1>
        <p className="mt-4 leading-7 text-[#607282]">
          Reconnect to continue your session.
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
