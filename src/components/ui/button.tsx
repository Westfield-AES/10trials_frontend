import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-[#ff6b00] text-white hover:bg-[#e85b00] shadow-[0_8px_20px_rgba(232,91,0,.22)]",
    secondary: "bg-[#032e4d] text-white hover:bg-[#07436c]",
    ghost: "border border-[#c8d5dd] bg-white text-[#032e4d] hover:bg-[#f4f8fa]",
    danger: "bg-[#c63d3d] text-white hover:bg-[#a92f2f]",
  };
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
