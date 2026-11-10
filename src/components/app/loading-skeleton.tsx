import { Logo } from "@/components/ui/logo";

type PageKind =
  | "dashboard"
  | "history"
  | "report"
  | "billing"
  | "session"
  | "new"
  | "settings";

export function pageKind(pathname: string): PageKind {
  if (pathname.startsWith("/app/history/")) return "report";
  if (pathname.startsWith("/app/history")) return "history";
  if (pathname.startsWith("/app/billing")) return "billing";
  if (pathname.startsWith("/app/session")) return "session";
  if (pathname.startsWith("/app/new")) return "new";
  if (pathname.startsWith("/app/settings")) return "settings";
  return "dashboard";
}

function Bar({ className }: { className: string }) {
  return <div className={`rounded-lg bg-[#dce8ee] ${className}`} />;
}

export function PageSkeleton({ kind }: { kind: PageKind }) {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto max-w-6xl motion-safe:animate-pulse"
    >
      <span className="sr-only">Loading page</span>
      <div aria-hidden="true">
        <Bar className="h-3 w-32" />
        <Bar className="mt-4 h-9 w-3/5 max-w-md" />
        <Bar className="mt-4 h-4 w-4/5 max-w-lg" />
        {kind === "dashboard" ? (
          <>
            <div className="card mt-7 p-6">
              <Bar className="h-5 w-2/5" />
              <Bar className="mt-4 h-4 w-4/5" />
              <Bar className="mt-5 h-10 w-40" />
            </div>
            <div className="card mt-8 p-6">
              <Bar className="h-6 w-40" />
              <Bar className="mt-5 h-14 w-full" />
            </div>
          </>
        ) : kind === "history" ? (
          <div className="card mt-8 divide-y divide-[#dce5eb]">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="p-5">
                <Bar className="h-5 w-2/5" />
                <Bar className="mt-3 h-3 w-1/4" />
              </div>
            ))}
          </div>
        ) : kind === "billing" ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[0, 1].map((item) => (
              <div key={item} className="card min-h-80 p-7">
                <Bar className="h-7 w-2/3" />
                <Bar className="mt-6 h-4 w-full" />
                <Bar className="mt-4 h-4 w-4/5" />
                <Bar className="mt-8 h-12 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="card mt-8 p-7">
            <Bar className="h-6 w-2/5" />
            <Bar className="mt-6 h-4 w-4/5" />
            <Bar className="mt-3 h-4 w-3/5" />
            <Bar className="mt-8 h-28 w-full" />
            <Bar className="mt-6 h-11 w-36" />
          </div>
        )}
      </div>
    </div>
  );
}

export function AppLoadingSkeleton({ pathname }: { pathname: string }) {
  return (
    <div className="min-h-screen bg-[#f7fafb]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#dce5eb] bg-white p-5 md:block">
        <Logo />
        <div
          aria-hidden="true"
          className="mt-10 space-y-5 motion-safe:animate-pulse"
        >
          {[0, 1, 2, 3, 4].map((item) => (
            <Bar key={item} className="h-9 w-full" />
          ))}
        </div>
      </aside>
      <div className="h-16 border-b border-[#dce5eb] bg-white md:ml-64" />
      <main id="main-content" className="p-4 md:ml-64 md:p-8">
        <PageSkeleton kind={pageKind(pathname)} />
      </main>
    </div>
  );
}
