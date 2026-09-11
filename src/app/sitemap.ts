import type { MetadataRoute } from "next";

const routes = [
  "", "/dashboard", "/matches", "/messages", "/sessions",
  "/skills", "/videos", "/settings", "/profile", "/groups",
  "/paths", "/connections", "/calendar", "/browse", "/exchange",
  "/admin",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://synapselearn.vercel.app${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
