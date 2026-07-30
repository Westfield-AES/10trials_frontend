"use client";

import {
  CheckCircle2,
  CircleAlert,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  subscribeToToasts,
  type ToastPayload,
  type ToastVariant,
} from "@/lib/toast";
import { cn } from "@/lib/utils";
import styles from "./toast.module.css";

interface ToastItem extends ToastPayload {
  exiting: boolean;
}

const appearance: Record<
  ToastVariant,
  {
    icon: LucideIcon;
    iconClassName: string;
    borderClassName: string;
    role: "alert" | "status";
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClassName: "bg-emerald-100 text-emerald-700",
    borderClassName: "border-emerald-200",
    role: "status",
  },
  error: {
    icon: CircleAlert,
    iconClassName: "bg-red-100 text-red-700",
    borderClassName: "border-red-200",
    role: "alert",
  },
  info: {
    icon: Info,
    iconClassName: "bg-sky-100 text-[#07436c]",
    borderClassName: "border-sky-200",
    role: "status",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const signatures = useRef(new Map<string, string>());
  const itemSignatures = useRef(new Map<string, string>());
  const closingIds = useRef(new Set<string>());

  const dismiss = useCallback((id: string) => {
    if (closingIds.current.has(id)) return;
    closingIds.current.add(id);
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, exiting: true } : item,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    const signature = itemSignatures.current.get(id);
    if (signature) signatures.current.delete(signature);
    itemSignatures.current.delete(id);
    closingIds.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    return subscribeToToasts((payload) => {
      const signature = `${payload.variant}:${payload.message}`;
      if (signatures.current.has(signature)) return;

      signatures.current.set(signature, payload.id);
      itemSignatures.current.set(payload.id, signature);
      setItems((current) => [...current, { ...payload, exiting: false }]);
    });
  }, []);

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[120] flex flex-col items-end gap-3 sm:left-auto sm:w-full sm:max-w-sm"
        aria-label="Notifications"
      >
        {items.map((item) => (
          <ToastCard
            key={item.id}
            item={item}
            onDismiss={dismiss}
            onRemove={remove}
          />
        ))}
      </div>
    </>
  );
}

function ToastCard({
  item,
  onDismiss,
  onRemove,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const config = appearance[item.variant];
  const Icon = config.icon;

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), item.durationMs);
    return () => window.clearTimeout(timer);
  }, [item.durationMs, item.id, onDismiss]);

  return (
    <div
      role={config.role}
      aria-atomic="true"
      onAnimationEnd={() => {
        if (item.exiting) onRemove(item.id);
      }}
      className={cn(
        styles.toast,
        item.exiting && styles.exit,
        config.borderClassName,
        "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-[#102231] shadow-[0_18px_50px_rgba(3,46,77,0.2)]",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl",
          config.iconClassName,
        )}
      >
        <Icon aria-hidden="true" size={19} strokeWidth={2.5} />
      </span>
      <p className="min-w-0 flex-1 pt-1.5 text-sm font-bold leading-5">
        {item.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-[#607282] transition hover:bg-slate-100 hover:text-[#032e4d]"
        aria-label="Dismiss notification"
      >
        <X aria-hidden="true" size={17} />
      </button>
    </div>
  );
}
