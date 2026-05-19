import type { Metadata } from "next";

import { ContactCard } from "@/components/resume/contact-card";
import { EducationSection } from "@/components/resume/education-section";
import { ExperienceSection } from "@/components/resume/experience-section";
import { ProfileCard } from "@/components/resume/profile-card";
import { ProjectsPreview } from "@/components/resume/projects-preview";
import { ResumeSummary } from "@/components/resume/resume-summary";
import { SkillsSection } from "@/components/resume/skills-section";

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
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <ProfileCard />
        <ContactCard />
      </div>
      <ResumeSummary />
      <div className="grid gap-6 lg:grid-cols-2">
        <SkillsSection />
        <EducationSection />
      </div>
      <ExperienceSection />
      <ProjectsPreview />
    </main>
  );
}
