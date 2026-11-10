"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { AccountOverview } from "@/lib/types";

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: () => apiRequest<AccountOverview>("/api/v1/account/me"),
    refetchOnMount: "always",
  });
}
