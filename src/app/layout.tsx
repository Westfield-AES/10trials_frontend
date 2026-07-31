import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "10Trials — Practise smarter. Perform stronger.",
    template: "%s | 10Trials",
  },
  description:
    "AI-powered exam practice for any exam. Learn with instant feedback or simulate the real thing.",
  applicationName: "10Trials",
  icons: {
    icon: [
      {
        url: "/brand/10trials-logo.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/brand/10trials-logo.svg",
    apple: "/icon-192.png",
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "10Trials" },
  formatDetection: { telephone: false },
  openGraph: {
    title: "10Trials",
    description: "Turn any exam goal into focused practice.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#032e4d",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-lg bg-white px-4 py-2 font-bold text-[#032e4d] shadow-lg focus:translate-y-0"
        >
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
