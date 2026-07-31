import "client-only";

export type ToastVariant = "success" | "error" | "info";

export interface ToastPayload {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
}

interface ToastOptions {
  durationMs?: number;
}

type ToastListener = (payload: ToastPayload) => void;

const listeners = new Set<ToastListener>();
const pending: ToastPayload[] = [];
let toastSequence = 0;

function publish(
  variant: ToastVariant,
  message: string,
  options?: ToastOptions,
) {
  const normalizedMessage = message.trim();
  if (!normalizedMessage) return;

  const payload: ToastPayload = {
    id: `toast-${Date.now()}-${toastSequence++}`,
    message: normalizedMessage,
    variant,
    durationMs: Math.max(1_500, options?.durationMs ?? 3_000),
  };

  if (listeners.size === 0) {
    pending.push(payload);
    if (pending.length > 10) pending.shift();
    return;
  }

  listeners.forEach((listener) => listener(payload));
}

export const toast = {
  success(message: string, options?: ToastOptions) {
    publish("success", message, options);
  },
  error(message: string, options?: ToastOptions) {
    publish("error", message, options);
  },
  info(message: string, options?: ToastOptions) {
    publish("info", message, options);
  },
};

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);
  pending.splice(0).forEach(listener);
  return () => {
    listeners.delete(listener);
  };
}
