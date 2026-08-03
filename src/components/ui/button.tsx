import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    primary: "bg-[#e85b00] text-white hover:bg-[#c94d00]",
    secondary: "bg-[#032e4d] text-white hover:bg-[#07436c]",
    ghost: "border border-[#c8d5dd] bg-white text-[#032e4d] hover:bg-[#f4f8fa]",
    danger: "bg-[#c63d3d] text-white hover:bg-[#a92f2f]",
  };
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
