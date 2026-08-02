"use client";

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event("10trials:open-cookie-preferences"))
      }
      className="rounded-xl border border-[#b9ceda] bg-white px-4 py-2.5 text-sm font-black text-[#07436c] transition hover:border-[#7da8bd] hover:bg-[#f4f8fa]"
    >
      Review cookie choices
    </button>
  );
}
