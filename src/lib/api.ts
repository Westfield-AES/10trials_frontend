import "client-only";
import { auth } from "@/lib/firebase";
import type { Job } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = "REQUEST_FAILED",
    public details?: unknown,
    public requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function token(forceRefresh = false) {
  if (!auth.currentUser) throw new ApiError("Please sign in to continue", 401);
  return auth.currentUser.getIdToken(forceRefresh);
}

interface ErrorResponse {
  detail?: string;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    request_id?: string;
  };
}

async function request<T>(
  path: string,
  init: RequestInit,
  refreshToken: boolean,
): Promise<T> {
  const idToken = await token(refreshToken);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        ...init.headers,
      },
    });
  } catch (cause) {
    throw new ApiError(
      "We couldn’t reach 10Trials. Check your connection and try again.",
      0,
      "NETWORK_ERROR",
      cause,
    );
  }
  if (response.status === 401 && !refreshToken && auth.currentUser) {
    return request<T>(path, init, true);
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ErrorResponse | null;
    const error = payload?.error;
    throw new ApiError(
      error?.message || payload?.detail || "Something went wrong. Please try again.",
      response.status,
      error?.code || `HTTP_${response.status}`,
      error?.details,
      error?.request_id || response.headers.get("x-request-id") || undefined,
    );
  }
  if (response.status === 204) return undefined as T;
  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new ApiError(
      "10Trials returned an unexpected response. Please try again.",
      502,
      "INVALID_RESPONSE",
      cause,
      response.headers.get("x-request-id") || undefined,
    );
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return request<T>(path, init, false);
}

function finishedJob<T>(job: Job<T>): Job<T> {
  if (job.status === "failed" || job.status === "cancelled") {
    throw new ApiError(
      job.error_message || "We could not complete that operation. Please try again.",
      503,
      job.error_code || (job.status === "cancelled" ? "JOB_CANCELLED" : "JOB_FAILED"),
    );
  }
  return job;
}

export async function waitForJob<T>(
  jobId: string,
  onUpdate?: (job: Job<T>) => void,
): Promise<Job<T>> {
  const idToken = await token();
  try {
    const response = await fetch(`${API_URL}/api/v1/jobs/${jobId}/events`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!response.ok || !response.body) throw new Error("Stream unavailable");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const data = frame
          .split("\n")
          .find((line) => line.startsWith("data: "))
          ?.slice(6);
        if (!data) continue;
        const job = JSON.parse(data) as Job<T>;
        onUpdate?.(job);
        if (["succeeded", "failed", "cancelled"].includes(job.status))
          return finishedJob(job);
      }
    }
  } catch {
    // Durable polling below recovers from proxies or interrupted SSE streams.
  }
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const job = await apiRequest<Job<T>>(`/api/v1/jobs/${jobId}`);
    onUpdate?.(job);
    if (["succeeded", "failed", "cancelled"].includes(job.status))
      return finishedJob(job);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new ApiError("This operation is taking longer than expected", 408);
}
