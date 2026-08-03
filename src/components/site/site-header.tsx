"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[#dce5eb]/80 bg-white/95 backdrop-blur">
      <div className="container-shell flex h-18 items-center justify-between">
        <Logo />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          <Link
            className="text-sm font-bold text-[#435766] hover:text-[#ff6b00]"
            href="/#how-it-works"
          >
            How it works
          </Link>
          <Link
            className="text-sm font-bold text-[#435766] hover:text-[#ff6b00]"
            href="/pricing"
          >
            Pricing
          </Link>
          <Link
            className="text-sm font-bold text-[#435766] hover:text-[#ff6b00]"
            href="/#faq"
          >
            FAQ
          </Link>
          <Link className="text-sm font-bold text-[#032e4d]" href="/login">
            Log in
          </Link>
          <Link
            className="rounded-xl bg-[#e85b00] px-5 py-3 text-sm font-bold text-white hover:bg-[#c94d00]"
            href="/signup"
          >
            Start practising
          </Link>
        </nav>
        <button
          className="rounded-lg p-2 md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          className="container-shell flex flex-col gap-2 border-t border-[#dce5eb] py-4 md:hidden"
          aria-label="Mobile navigation"
        >
          {[
            ["How it works", "/#how-it-works"],
            ["Pricing", "/pricing"],
            ["FAQ", "/#faq"],
            ["Log in", "/login"],
            ["Start practising", "/signup"],
          ].map(([label, href]) => (
            <Link
              key={href}
              className="rounded-lg px-3 py-3 font-bold hover:bg-[#fff0e5]"
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
