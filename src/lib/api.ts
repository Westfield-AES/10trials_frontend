import "client-only";
import { auth } from "@/lib/firebase";
import type { Job } from "@/lib/types";
import { toast } from "@/lib/toast";

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
  try {
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch (cause) {
    throw new ApiError(
      "We couldn’t verify your session. Please sign in again.",
      401,
      "AUTH_TOKEN_ERROR",
      cause,
    );
  }
}

interface ErrorResponse {
  detail?: unknown;
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
    request_id?: unknown;
  };
}

export interface ApiRequestInit extends RequestInit {
  toast?: {
    error?: boolean | ((error: unknown) => boolean);
    success?: string;
  };
}

const reportedErrors = new WeakSet<object>();

function reportApiError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    if (reportedErrors.has(error)) return;
    reportedErrors.add(error);
  }
  toast.error(
    error instanceof Error && error.message
      ? error.message
      : "Something went wrong. Please try again.",
  );
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function responseErrorMessage(payload: ErrorResponse | null, status: number) {
  const nestedMessage = stringValue(payload?.error?.message);
  if (nestedMessage) return nestedMessage;

  const detail = payload?.detail;
  const detailMessage = stringValue(detail);
  if (detailMessage) return detailMessage;

  if (Array.isArray(detail)) {
    const validationMessages = detail
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (!entry || typeof entry !== "object") return null;
        const item = entry as { loc?: unknown; msg?: unknown };
        const message = stringValue(item.msg);
        if (!message) return null;
        const location = Array.isArray(item.loc)
          ? item.loc.filter((part) => typeof part === "string").at(-1)
          : undefined;
        return location ? `${location}: ${message}` : message;
      })
      .filter((message): message is string => Boolean(message));
    if (validationMessages.length)
      return validationMessages.slice(0, 3).join(" · ");
  }

  if (detail && typeof detail === "object") {
    const objectMessage = stringValue(
      (detail as { message?: unknown }).message,
    );
    if (objectMessage) return objectMessage;
  }

  if (status === 401) return "Please sign in again to continue.";
  if (status === 403) return "You don’t have permission to do that.";
  if (status === 404) return "We couldn’t find what you requested.";
  if (status === 409)
    return "That change conflicts with the latest data. Please try again.";
  if (status === 422)
    return "Some information was not accepted. Please review it and try again.";
  if (status === 429) return "Too many requests. Wait a moment and try again.";
  if (status >= 500) return "10Trials hit a problem. Please try again.";
  return "Something went wrong. Please try again.";
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
    const payload = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;
    const error = payload?.error;
    throw new ApiError(
      responseErrorMessage(payload, response.status),
      response.status,
      stringValue(error?.code) || `HTTP_${response.status}`,
      error?.details,
      stringValue(error?.request_id) ||
        response.headers.get("x-request-id") ||
        undefined,
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
  init: ApiRequestInit = {},
): Promise<T> {
  const { toast: toastOptions, ...requestInit } = init;
  try {
    const result = await request<T>(path, requestInit, false);
    if (toastOptions?.success) toast.success(toastOptions.success);
    return result;
  } catch (error) {
    const shouldReport =
      typeof toastOptions?.error === "function"
        ? toastOptions.error(error)
        : toastOptions?.error !== false;
    if (shouldReport) reportApiError(error);
    throw error;
  }
}

function finishedJob<T>(job: Job<T>): Job<T> {
  if (job.status === "failed" || job.status === "cancelled") {
    throw new ApiError(
      job.error_message ||
        "We could not complete that operation. Please try again.",
      503,
      job.error_code ||
        (job.status === "cancelled" ? "JOB_CANCELLED" : "JOB_FAILED"),
    );
  }
  return job;
}

async function waitForJobRequest<T>(
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

export async function waitForJob<T>(
  jobId: string,
  onUpdate?: (job: Job<T>) => void,
): Promise<Job<T>> {
  try {
    return await waitForJobRequest(jobId, onUpdate);
  } catch (error) {
    reportApiError(error);
    throw error;
  }
}
