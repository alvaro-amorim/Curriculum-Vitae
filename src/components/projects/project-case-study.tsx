"use client";

import Link from "next/link";
import type { PointerEvent } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { projects } from "@/content/projects";
import type { Project } from "@/types/portfolio";

import { formatProjectCategory } from "./project-card";
import { ProjectLinks } from "./project-links";
import styles from "./project-experience.module.css";
import { ProjectTechStack } from "./project-tech-stack";
import { ProjectVisualFrame, projectAccentStyle } from "./project-visual-frame";

type ProjectCaseStudyProps = {
  project: Project;
};

const caseCopy = {
  pt: {
    eyebrow: "estudo de caso visual",
    heroLabel: "palco visual do projeto",
    contextTitle: "Contexto, solução e entrega.",
    contextIntro: "A narrativa abaixo mantém o foco em decisões reais do projeto, sem inventar métricas ou screenshots.",
    architectureTitle: "Arquitetura e decisões técnicas.",
    featuresTitle: "Módulos e pontos de atenção.",
    visualsTitle: "Sistema visual preparado para imagens reais.",
    visualsIntro: "Quando screenshots reais forem adicionados, esta área recebe imagem principal, galeria e variações de moldura sem refatorar o estudo.",
    honestTitle: "Resultado honesto.",
    honestIntro: "Sem números inventados: o valor demonstrado aqui é escopo entregue, domínio técnico e clareza de produto.",
    previous: "Projeto anterior",
    next: "Próximo projeto",
    back: "Voltar para projetos",
    visualAssets: "imagens do projeto",
    pendingStatus: "em preparação",
  },
  en: {
    eyebrow: "premium case study",
    heroLabel: "project visual stage",
    contextTitle: "Context, solution and delivery.",
    contextIntro: "The narrative below keeps the focus on real project decisions without inventing metrics or screenshots.",
    architectureTitle: "Architecture and technical decisions.",
    featuresTitle: "Modules and attention points.",
    visualsTitle: "Visual system prepared for real assets.",
    visualsIntro: "When real screenshots are added, this area can receive a hero image, gallery and mockup variations without refactoring the case.",
    honestTitle: "Honest outcome.",
    honestIntro: "No invented numbers: the demonstrated value is delivered scope, technical ownership and product clarity.",
    previous: "Previous project",
    next: "Next project",
    back: "Back to projects",
    visualAssets: "visual assets",
    pendingStatus: "pending",
  },
} as const;

function handlePointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  event.currentTarget.style.setProperty("--lx", `${(x * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--ly", `${(y * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--rx", ((x - 0.5) * 8).toFixed(2));
  event.currentTarget.style.setProperty("--ry", ((0.5 - y) * 8).toFixed(2));
}

function handleExperiencePointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  event.currentTarget.style.setProperty("--px", `${(x * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--py", `${(y * 100).toFixed(2)}%`);
}

export function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  const { locale, t } = usePortfolioUi();
  const copy = caseCopy[locale];
  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const previousProject = projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return (
    <main className={styles.experience} onPointerMove={handleExperiencePointer} style={projectAccentStyle(project)}>
      <div className={styles.shell}>
        <section className={styles.caseHero}>
          <div className={styles.reveal}>
            <nav className={styles.breadcrumb} aria-label={locale === "pt" ? "Caminho do projeto" : "Project breadcrumb"}>
              <Link href="/projetos">{locale === "pt" ? "Projetos" : "Projects"}</Link>
              <span aria-hidden="true">/</span>
              <strong>{project.title[locale]}</strong>
            </nav>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 className={styles.caseTitle}>{project.title[locale]}</h1>
            <p className={styles.caseLead}>{project.fullDescription[locale]}</p>
            <div className={styles.caseMeta}>
              <div className={styles.caseMetaGrid}>
                <span className={styles.statusPill}>{project.status[locale]}</span>
                {project.category.slice(0, 3).map((category) => (
                  <span className={styles.categoryPill} key={category}>
                    {formatProjectCategory(category, locale)}
                  </span>
                ))}
              </div>
              <ProjectLinks project={project} />
            </div>
          </div>

          <div className={`${styles.caseStage} ${styles.reveal}`} onPointerMove={handlePointer} style={{ animationDelay: "120ms" }}>
            <ProjectVisualFrame index={projectIndex} locale={locale} project={project} />
            <div className={styles.casePlate}>
              <p className={styles.frameKicker}>{copy.heroLabel}</p>
              <h2>{project.subtitle[locale]}</h2>
              <p>{project.shortDescription[locale]}</p>
              <ProjectTechStack stack={project.stack.slice(0, 5)} />
            </div>
          </div>
        </section>

        <div className={styles.sections}>
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>{t.caseStudy.problem} / {t.caseStudy.solution}</p>
                <h2 className={styles.sectionTitle}>{copy.contextTitle}</h2>
              </div>
              <p className={styles.sectionIntro}>{copy.contextIntro}</p>
            </div>

            <div className={styles.flowGrid}>
              <article className={styles.flowCard}>
                <p className={styles.flowLabel}>{t.caseStudy.problem}</p>
                <h2>{project.subtitle[locale]}</h2>
                <p className={styles.flowText}>{project.problem[locale]}</p>
              </article>
              <article className={styles.flowCard}>
                <p className={styles.flowLabel}>{t.caseStudy.solution}</p>
                <h2>{project.status[locale]}</h2>
                <p className={styles.flowText}>{project.solution[locale]}</p>
              </article>
              <article className={styles.flowCard}>
                <p className={styles.flowLabel}>{t.caseStudy.whatItShows}</p>
                <h2>{copy.honestTitle}</h2>
                <p className={styles.flowText}>{project.whatItShows[locale]}</p>
              </article>
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>{t.caseStudy.stack}</p>
                <h2 className={styles.sectionTitle}>{copy.architectureTitle}</h2>
              </div>
              <p className={styles.sectionIntro}>{project.solution[locale]}</p>
            </div>

            <div className={styles.assetGrid}>
              <article className={styles.assetPanel}>
                <p className={styles.assetLabel}>{t.caseStudy.stack}</p>
                <h2>{project.title[locale]}</h2>
                <ProjectTechStack stack={project.stack} />
              </article>
              <article className={styles.assetPanel}>
                <p className={styles.assetLabel}>{t.caseStudy.technicalChallenges}</p>
                <h2>{copy.featuresTitle}</h2>
                <ul>
                  {project.technicalChallenges[locale].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>{t.caseStudy.highlights}</p>
                <h2 className={styles.sectionTitle}>{copy.featuresTitle}</h2>
              </div>
              <p className={styles.sectionIntro}>{project.fullDescription[locale]}</p>
            </div>

            <div className={styles.moduleGrid}>
              {project.highlights[locale].map((item, index) => (
                <article className={styles.moduleCard} key={item}>
                  <p className={styles.flowLabel}>{String(index + 1).padStart(2, "0")}</p>
                  <h2>{formatProjectCategory(project.category[index % project.category.length], locale)}</h2>
                  <ul>
                    <li>{item}</li>
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>{copy.visualAssets}</p>
                <h2 className={styles.sectionTitle}>{copy.visualsTitle}</h2>
              </div>
              <p className={styles.sectionIntro}>{copy.visualsIntro}</p>
            </div>

            <div className={styles.assetGrid}>
              <ProjectVisualFrame locale={locale} project={project} />
              <article className={styles.assetPanel}>
                <p className={styles.assetLabel}>{project.visuals?.status === "available" ? project.status[locale] : copy.pendingStatus}</p>
                <h2>{project.visuals?.mockupHint[locale] ?? project.subtitle[locale]}</h2>
                <p>{locale === "pt" ? "Imagem do projeto em preparação" : "Project image in preparation"}</p>
                <div aria-hidden="true" className={styles.miniGallery}>
                  <span className={styles.miniAsset} />
                  <span className={styles.miniAsset} />
                  <span className={styles.miniAsset} />
                </div>
              </article>
            </div>
          </section>

          <section className={`${styles.sectionBlock} ${styles.honestResult}`}>
            <article className={styles.flowCard}>
              <p className={styles.flowLabel}>{copy.honestTitle}</p>
              <h2>{t.caseStudy.whatItShows}</h2>
              <p className={styles.flowText}>{copy.honestIntro}</p>
              <p className={styles.flowText}>{project.whatItShows[locale]}</p>
            </article>
            <article className={styles.flowCard}>
              <p className={styles.flowLabel}>{t.caseStudy.links}</p>
              <h2>{project.title[locale]}</h2>
              <ProjectLinks project={project} />
            </article>
          </section>

          <nav className={styles.navigationGrid} aria-label={locale === "pt" ? "Navegação entre projetos" : "Project navigation"}>
            <Link className={styles.nextCard} href={`/projetos/${previousProject.slug}`} style={projectAccentStyle(previousProject)}>
              <span className={styles.flowLabel}>{copy.previous}</span>
              <h2>{previousProject.title[locale]}</h2>
              <p>{previousProject.shortDescription[locale]}</p>
            </Link>
            <Link className={styles.nextCard} href={`/projetos/${nextProject.slug}`} style={projectAccentStyle(nextProject)}>
              <span className={styles.flowLabel}>{copy.next}</span>
              <h2>{nextProject.title[locale]}</h2>
              <p>{nextProject.shortDescription[locale]}</p>
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
