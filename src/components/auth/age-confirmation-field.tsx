"use client";

import { useId } from "react";

export function AgeConfirmationField({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#f4f8fa] p-4 text-sm"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="mt-1 accent-[#e85b00]"
      />
      <span>I confirm that I am 18 or older.</span>
    </label>
  );
}
