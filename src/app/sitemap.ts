import type { MetadataRoute } from "next";

const routes = [
  "", "/dashboard", "/matches", "/messages", "/sessions",
  "/skills", "/videos", "/settings", "/profile", "/groups",
  "/paths", "/connections", "/calendar", "/browse", "/exchange",
  "/admin",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
