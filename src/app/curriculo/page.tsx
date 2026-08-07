import type { Metadata } from "next";

import { ContactCard } from "@/components/resume/contact-card";
import { EducationSection } from "@/components/resume/education-section";
import { ExperienceSection } from "@/components/resume/experience-section";
import { ProfileCard } from "@/components/resume/profile-card";
import { ProjectsPreview } from "@/components/resume/projects-preview";
import { ResumeSummary } from "@/components/resume/resume-summary";
import { SkillsSection } from "@/components/resume/skills-section";
import styles from "@/components/resume/resume.module.css";
import { career } from "@/content/career";
import { profile } from "@/content/profile";
import { getPublicProjects } from "@/lib/projects/repository";

const pageTitle = `Currículo — ${profile.shortName}`;
const pageDescription = career.seo.resumeDescription.pt;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: {
    canonical: "/curriculo",
  },
  openGraph: {
    title: pageTitle,
    description: career.seo.resumeOpenGraphDescription.pt,
    url: "/curriculo",
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: career.seo.resumeOpenGraphDescription.pt,
  },
};

export default async function ResumePage() {
  const projects = await getPublicProjects();

  return (
    <main className={styles.resumePage}>
      <div className={styles.resumeHeroGrid}>
        <ProfileCard />
        <ContactCard />
      </div>
      <div className={styles.resumeStack}>
        <ResumeSummary />
      </div>
      <div className={`${styles.resumeTwoColumn} ${styles.resumeStack}`}>
        <SkillsSection />
        <EducationSection />
      </div>
      <div className={styles.resumeStack}>
        <ExperienceSection />
        <ProjectsPreview projects={projects} />
      </div>
    </main>
  );
}
