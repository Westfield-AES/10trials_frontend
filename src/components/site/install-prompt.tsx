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
  if (standalone || (!event && !ios)) return null;
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-dashed border-[#c8d5dd] bg-[#edf3f6]/50 p-4 sm:items-center sm:p-5">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#07436c]">
        <Download size={18} />
      </div>
      <div className="min-w-40 flex-1">
        <h3 className="font-black text-[#032e4d]">Add to your home screen</h3>
        <p className="mt-1 text-xs leading-5 text-[#607282]">
          Open 10Trials faster. Practice requires an internet connection.
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
