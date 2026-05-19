"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import type { Project } from "@/types/portfolio";

import { ProjectLinks } from "./project-links";
import { ProjectSection } from "./project-section";
import { ProjectTechStack } from "./project-tech-stack";

type ProjectCaseStudyProps = {
  project: Project;
};

export function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  const { locale, t } = usePortfolioUi();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:py-12">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] md:p-10">
        <Link className={buttonClassName("ghost", "sm")} href="/projetos">
          {t.caseStudy.backToProjects}
        </Link>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{project.subtitle[locale]}</p>
            <h1 className="mt-3 text-4xl font-semibold md:text-6xl">{project.title[locale]}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)]">{project.fullDescription[locale]}</p>
          </div>

          <aside className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">{t.caseStudy.status}</p>
              <p className="mt-1 text-sm font-medium">{project.status[locale]}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">{t.caseStudy.categories}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.category.map((category) => (
                  <Badge key={category}>{category}</Badge>
                ))}
              </div>
            </div>
            <ProjectLinks project={project} />
          </aside>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProjectSection title={t.caseStudy.problem}>
          <p>{project.problem[locale]}</p>
        </ProjectSection>
        <ProjectSection title={t.caseStudy.solution}>
          <p>{project.solution[locale]}</p>
        </ProjectSection>
      </section>

      <ProjectSection title={t.caseStudy.stack}>
        <ProjectTechStack stack={project.stack} />
      </ProjectSection>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProjectSection title={t.caseStudy.highlights}>
          <ul className="grid gap-2">
            {project.highlights[locale].map((item) => (
              <li className="pl-4 before:-ml-4 before:mr-2 before:text-[var(--accent)] before:content-['•']" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </ProjectSection>
        <ProjectSection title={t.caseStudy.technicalChallenges}>
          <ul className="grid gap-2">
            {project.technicalChallenges[locale].map((item) => (
              <li className="pl-4 before:-ml-4 before:mr-2 before:text-[var(--accent)] before:content-['•']" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </ProjectSection>
      </section>

      <ProjectSection title={t.caseStudy.whatItShows}>
        <p>{project.whatItShows[locale]}</p>
      </ProjectSection>
    </main>
  );
}
