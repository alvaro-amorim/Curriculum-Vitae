import type { Metadata } from "next";

import { VisualFinalCandidate } from "@/components/visual-final-candidate/visual-final-candidate";
import { career } from "@/content/career";
import { createHomeProjects } from "@/content/home-projects";
import { profile } from "@/content/profile";
import { getHomeProjectCollections } from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

const homeTitle = `${profile.shortName} — ${career.role.pt}`;
const homeDescription = career.seo.siteDescription.pt;

export const metadata: Metadata = {
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: homeTitle,
    description: homeDescription,
  },
};

export default async function HomePage() {
  const { carouselProjects, homeProjects } = await getHomeProjectCollections();

  return (
    <VisualFinalCandidate
      carouselProjects={createHomeProjects(carouselProjects)}
      featuredProjects={createHomeProjects(homeProjects)}
    />
  );
}
