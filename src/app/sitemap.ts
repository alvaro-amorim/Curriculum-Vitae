import type { MetadataRoute } from "next";

import { projects } from "@/content/projects";
import { SITE_URL } from "@/lib/constants";

function absoluteUrl(path: string) {
  return new URL(path, `${SITE_URL}/`).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/curriculo"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/projetos"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const projectRoutes = projects.map((project) => ({
    url: absoluteUrl(`/projetos/${project.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...projectRoutes,
    {
      url: absoluteUrl("/lab"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
