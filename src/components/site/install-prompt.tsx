"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
      setStandalone(window.matchMedia("(display-mode: standalone)").matches);
    }, 0);
    const handler = (next: Event) => {
      next.preventDefault();
      setEvent(next as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);
  if (standalone) return null;
  return (
    <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#fff0e5] text-[#e85b00]">
        <Download />
      </div>
      <div className="flex-1">
        <h3 className="font-black text-[#032e4d]">Take 10Trials with you</h3>
        <p className="mt-1 text-sm text-[#607282]">
          Install the PWA for quick, full-screen access. Active exams still
          require an internet connection.
        </p>
        {ios && !event && (
          <p className="mt-2 text-xs font-bold">
            On iPhone or iPad, use Share → Add to Home Screen.
          </p>
        )}
      </div>
      {event && (
        <Button
          onClick={async () => {
            await event.prompt();
            await event.userChoice;
            setEvent(null);
          }}
        >
          Install app
        </Button>
      )}
    </div>
  );
}
