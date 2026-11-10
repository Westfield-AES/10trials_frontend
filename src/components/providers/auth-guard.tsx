"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import { Spinner } from "@/components/ui/spinner";
import { AppLoadingSkeleton } from "@/components/app/loading-skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    if (pathname === "/app" || pathname.startsWith("/app/"))
      return <AppLoadingSkeleton pathname={pathname} />;
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffaf5]">
        <Spinner label="Opening your dashboard" />
      </div>
    );
  }
  return children;
}
