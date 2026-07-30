"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthProvider } from "./auth-provider";
import { CookieConsent } from "@/components/site/cookie-consent";
import { I18nProvider } from "./i18n-provider";
import { ApiError } from "@/lib/api";
import { ToastProvider } from "@/components/ui/toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20_000,
            retry: (failureCount, error) => {
              if (
                error instanceof ApiError &&
                error.status >= 400 &&
                error.status < 500
              )
                return error.status === 408 || error.status === 429
                  ? failureCount < 1
                  : false;
              return failureCount < 2;
            },
          },
        },
      }),
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <I18nProvider>
            {children}
            <CookieConsent />
          </I18nProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
