import type { Metadata } from "next";

import { ContactCard } from "@/components/resume/contact-card";
import { EducationSection } from "@/components/resume/education-section";
import { ExperienceSection } from "@/components/resume/experience-section";
import { ProfileCard } from "@/components/resume/profile-card";
import { ProjectsPreview } from "@/components/resume/projects-preview";
import { ResumeSummary } from "@/components/resume/resume-summary";
import { SkillsSection } from "@/components/resume/skills-section";
import styles from "@/components/resume/resume.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "Currículo — Álvaro Amorim",
  },
  description: "Currículo objetivo de Álvaro Amorim com perfil, contato, formação, experiência, habilidades, projetos e downloads em PDF/DOCX.",
  alternates: {
    canonical: "/curriculo",
  },
  openGraph: {
    title: "Currículo — Álvaro Amorim",
    description: "Resumo profissional, experiência, formação, habilidades e projetos de Álvaro Amorim.",
    url: "/curriculo",
  },
};

export default function ResumePage() {
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
        <ProjectsPreview />
      </div>
    </main>
  );
}
