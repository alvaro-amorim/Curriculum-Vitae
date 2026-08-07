"use client";

import Link from "next/link";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { profile } from "@/content/profile";
import type { Project } from "@/types/portfolio";

import styles from "./recruiter-journey.module.css";

export function ProjectRecruiterCta({ project }: { project: Project }) {
  const { locale } = usePortfolioUi();
  const copy = locale === "pt"
    ? {
        eyebrow: "PRÓXIMO PASSO",
        title: "Quer conversar sobre este projeto ou sobre uma oportunidade?",
        text: `O case de ${project.title.pt} mostra uma parte do meu trabalho. O currículo reúne minha formação, experiência e demais projetos.`,
        resume: "Ver currículo",
        contact: "Enviar e-mail",
      }
    : {
        eyebrow: "NEXT STEP",
        title: "Want to discuss this project or an opportunity?",
        text: `The ${project.title.en} case shows one part of my work. My resume brings together my education, experience, and other projects.`,
        resume: "View resume",
        contact: "Send email",
      };

  return (
    <div className={styles.caseRecruiterWrap}>
      <aside className={styles.caseRecruiterCta} aria-labelledby="project-recruiter-cta-title">
        <div>
          <small>{copy.eyebrow}</small>
          <h2 id="project-recruiter-cta-title">{copy.title}</h2>
          <p>{copy.text}</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/curriculo">
            {copy.resume}
            <span aria-hidden="true">→</span>
          </Link>
          <a className={styles.secondaryAction} href={`mailto:${profile.email}`}>
            {copy.contact}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </aside>
    </div>
  );
}
