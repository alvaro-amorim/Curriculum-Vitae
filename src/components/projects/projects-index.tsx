"use client";

import Link from "next/link";

import { projects } from "@/content/projects";
import { usePortfolioUi } from "@/components/layout/app-shell";

import { formatProjectTech } from "./project-card";
import { ProjectGrid } from "./project-grid";
import styles from "./project-experience.module.css";
import { ProjectVisualFrame, projectAccentStyle } from "./project-visual-frame";

export function ProjectsIndex() {
  const { locale, t } = usePortfolioUi();
  const featuredProject = projects.find((project) => project.featured) ?? projects[0];
  const title = locale === "pt" ? "Estudos visuais de projetos" : "Visual project case studies";
  const description =
    locale === "pt"
      ? "Projetos reais organizados como vitrines de produto: contexto, solução, stack, desafios técnicos e espaço preparado para screenshots reais."
      : "Real projects organized as product showcases: context, solution, stack, technical challenges, and space prepared for real screenshots.";
  const viewCase = locale === "pt" ? "Ver estudo" : "View case study";

  return (
    <main className={styles.experience} style={projectAccentStyle(featuredProject)}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.reveal}>
            <p className={styles.eyebrow}>{t.home.eyebrow}</p>
            <h1 className={styles.heroTitle}>{title}</h1>
            <p className={styles.heroText}>{description}</p>
            <div className={styles.heroActions}>
              <Link className={styles.actionPrimary} href={`/projetos/${featuredProject.slug}`}>
                {viewCase}
              </Link>
              <Link className={styles.actionSecondary} href="/">
                {t.projectsPage.backHome}
              </Link>
              <Link className={styles.actionGhost} href="/curriculo">
                {t.projectsPage.openResume}
              </Link>
            </div>
          </div>

          <div className={`${styles.heroStage} ${styles.reveal}`} style={{ animationDelay: "120ms" }}>
            <ProjectVisualFrame index={0} locale={locale} project={featuredProject} />
            <div className={styles.stagePlate}>
              <p className={styles.frameKicker}>{featuredProject.subtitle[locale]}</p>
              <h2>{featuredProject.title[locale]}</h2>
              <p>{featuredProject.shortDescription[locale]}</p>
              <div className={styles.techRail}>
                {featuredProject.stack.slice(0, 5).map((tech) => (
                  <span className={styles.techNode} key={tech}>
                    {formatProjectTech(tech, locale)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>{locale === "pt" ? "vitrine visual" : "premium showcase"}</p>
              <h2 className={styles.sectionTitle}>{locale === "pt" ? "Produtos em cenas visuais." : "Products in visual scenes."}</h2>
            </div>
            <p className={styles.sectionIntro}>
              {locale === "pt"
                ? "Cada projeto ganha um palco próprio, pronto para receber screenshots reais sem inventar imagens ou resultados."
                : "Each project gets its own stage, ready for real screenshots without inventing images or outcomes."}
            </p>
          </div>
          <ProjectGrid projects={projects} />
        </section>
      </div>
    </main>
  );
}
