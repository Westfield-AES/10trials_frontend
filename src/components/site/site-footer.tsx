import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dce5eb] bg-[#f7fafb] py-12">
      <div className="container-shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#607282]">
            Focused practice, useful feedback, and realistic simulations for
            whatever exam comes next.
          </p>
        </div>
        <div>
          <p className="mb-3 font-black text-[#032e4d]">Product</p>
          <div className="flex flex-col gap-2 text-sm text-[#607282]">
            <Link href="/pricing">Pricing</Link>
            <Link href="/signup">Create account</Link>
            <Link href="/login">Log in</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 font-black text-[#032e4d]">Legal</p>
          <div className="flex flex-col gap-2 text-sm text-[#607282]">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
      <div className="container-shell mt-10 border-t border-[#dce5eb] pt-6 text-xs text-[#607282]">
        © {new Date().getFullYear()} 10Trials. Built for better attempts.
      </div>
    </footer>
  );
}
