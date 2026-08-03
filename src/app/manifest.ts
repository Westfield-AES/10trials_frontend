import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "10Trials | Professional Exam Practice",
    short_name: "10Trials",
    description:
      "AI-powered practice for professional certifications and high-stakes exams.",
    start_url: "/app",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#032e4d",
    orientation: "any",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
