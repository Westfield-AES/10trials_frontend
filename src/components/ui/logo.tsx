import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="10Trials home"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src="/brand/10trials-logo.svg"
        alt="10Trials"
        width={48}
        height={48}
        priority
        className="size-11 object-contain"
      />
      <span className="-ml-1 text-xl font-black tracking-[-0.04em] text-[#032e4d]">
        10Trials
      </span>
    </Link>
  );
}
