import Link from "next/link";
import type { ReactNode } from "react";

import type { LocalizedText, Project } from "@/types/portfolio";

import { ProjectCaseNav, type ProjectCaseNavLink } from "./project-case-nav";
import { ProjectGalleryLightbox, type ProjectGalleryImage } from "./project-lightbox";
import { LocalizedProjectImage } from "./localized-project-image";
import styles from "./project-experience.module.css";
import { projectAccentStyle } from "./project-visual-frame";

type ProjectCaseStudyProps = {
  project: Project;
  projects: Project[];
};

const copy = {
  backToProjects: {
    pt: "Voltar para projetos",
    en: "Back to projects",
  },
  caseLabel: {
    pt: "case study de produto e engenharia",
    en: "product and engineering case study",
  },
  status: {
    pt: "Status",
    en: "Status",
  },
  categories: {
    pt: "Categorias",
    en: "Categories",
  },
  technologies: {
    pt: "Tecnologias",
    en: "Technologies",
  },
  stack: {
    pt: "Stack principal",
    en: "Core stack",
  },
  openProject: {
    pt: "Abrir projeto",
    en: "Open project",
  },
  openRepository: {
    pt: "Ver repositório",
    en: "View repository",
  },
  visualFallback: {
    pt: "Composição visual preparada para receber a mídia principal do projeto.",
    en: "Visual composition prepared to receive the project's main media.",
  },
  overview: {
    pt: "Visão geral",
    en: "Overview",
  },
  overviewTitle: {
    pt: "O contexto do projeto antes da interface.",
    en: "Project context before the interface.",
  },
  overviewPull: {
    pt: "Resumo do case",
    en: "Case summary",
  },
  provenFacts: {
    pt: "Dados comprovados",
    en: "Verified facts",
  },
  featured: {
    pt: "Projeto em destaque",
    en: "Featured project",
  },
  problemSolution: {
    pt: "Problema e solução",
    en: "Problem and solution",
  },
  problemTitle: {
    pt: "O ponto de partida.",
    en: "The starting point.",
  },
  solutionTitle: {
    pt: "A resposta construída.",
    en: "The built response.",
  },
  highlights: {
    pt: "Destaques",
    en: "Highlights",
  },
  highlightsTitle: {
    pt: "O que aparece na experiência entregue.",
    en: "What appears in the delivered experience.",
  },
  challenges: {
    pt: "Desafios",
    en: "Challenges",
  },
  challengesTitle: {
    pt: "Decisões técnicas sem enfeite.",
    en: "Technical decisions without decoration.",
  },
  stackContext: {
    pt: "Stack relacionada ao case",
    en: "Stack related to the case",
  },
  gallery: {
    pt: "Galeria",
    en: "Gallery",
  },
  galleryTitle: {
    pt: "Evidência visual do produto.",
    en: "Visual evidence of the product.",
  },
  galleryIntro: {
    pt: "Imagens reais do projeto, exibidas em destaque e disponíveis para visualização ampliada.",
    en: "Real project images, highlighted and available in an expanded view.",
  },
  relevance: {
    pt: "Relevância",
    en: "Relevance",
  },
  relevanceTitle: {
    pt: "Por que este projeto importa no portfólio.",
    en: "Why this project matters in the portfolio.",
  },
  previous: {
    pt: "Projeto anterior",
    en: "Previous project",
  },
  next: {
    pt: "Próximo projeto",
    en: "Next project",
  },
  unavailablePrevious: {
    pt: "Não há projeto anterior publicado.",
    en: "No previous published project.",
  },
  unavailableNext: {
    pt: "Não há próximo projeto publicado.",
    en: "No next published project.",
  },
} as const satisfies Record<string, LocalizedText>;

const categoryLabels: Record<string, string> = {
  Catálogo: "Catalog",
  Dados: "Data",
  Entretenimento: "Entertainment",
  IA: "AI",
  Institucional: "Institutional",
  Métricas: "Metrics",
};

const techLabels: Record<string, string> = {
  "APIs de IA": "AI APIs",
};

function localize(value: LocalizedText) {
  return (
    <>
      <span className={styles.localePt}>{value.pt}</span>
      <span className={styles.localeEn}>{value.en}</span>
    </>
  );
}

function localizedLabel(value: string, labels: Record<string, string>): LocalizedText {
  return {
    pt: value,
    en: labels[value] ?? value,
  };
}

function categoryLabel(category: string) {
  return localizedLabel(category, categoryLabels);
}

function techLabel(tech: string) {
  return localizedLabel(tech, techLabels);
}

function projectInitials(project: Project) {
  const words = project.title.pt.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/u);
  const initials = words.slice(0, 2).map((word) => word[0]).join("");
  return initials || project.title.pt.slice(0, 2).toUpperCase();
}

function removeTrailingPunctuation(value: string) {
  return value.replace(/[.;:,\s]+$/u, "");
}

function deriveTitle(value: string) {
  const words = removeTrailingPunctuation(value).split(/\s+/u);
  return words.length <= 7 ? removeTrailingPunctuation(value) : `${words.slice(0, 7).join(" ")}...`;
}

function localizedList(items: Record<"pt" | "en", string[]>) {
  const length = Math.max(items.pt.length, items.en.length);

  return Array.from({ length }, (_, index) => ({
    text: {
      pt: items.pt[index] ?? items.en[index] ?? "",
      en: items.en[index] ?? items.pt[index] ?? "",
    },
    title: {
      pt: deriveTitle(items.pt[index] ?? items.en[index] ?? ""),
      en: deriveTitle(items.en[index] ?? items.pt[index] ?? ""),
    },
  })).filter((item) => item.text.pt || item.text.en);
}

function visualAlt(project: Project): LocalizedText {
  return project.visuals?.alt ?? project.title;
}

function logoAlt(project: Project): LocalizedText {
  return project.visuals?.logoAlt ?? project.title;
}

function ProjectLogoMark({
  compact = false,
  eager = false,
  project,
}: {
  compact?: boolean;
  eager?: boolean;
  project: Project;
}) {
  const className = compact ? styles.caseLogoCompact : styles.caseLogo;

  if (project.visuals?.logo) {
    return (
      <span className={className}>
        <LocalizedProjectImage
          alt={logoAlt(project)}
          height={compact ? 52 : 76}
          loading={eager ? "eager" : "lazy"}
          optimizedWidth={compact ? 160 : 220}
          source={project.visuals.logo}
          width={compact ? 52 : 76}
        />
      </span>
    );
  }

  return (
    <span className={`${className} ${styles.caseLogoFallback}`} aria-hidden="true">
      {projectInitials(project)}
    </span>
  );
}

function TagList({ items, limit }: { items: LocalizedText[]; limit?: number }) {
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <div className={styles.caseTags}>
      {visibleItems.map((item) => (
        <span className={styles.caseTag} key={`${item.pt}-${item.en}`}>
          {localize(item)}
        </span>
      ))}
    </div>
  );
}

function ProjectCtas({ project, compact = false }: { project: Project; compact?: boolean }) {
  if (!project.links.website && !project.links.repository) {
    return null;
  }

  return (
    <div className={compact ? styles.caseCtasCompact : styles.caseCtas}>
      {project.links.website ? (
        <a className={styles.caseButtonPrimary} href={project.links.website} rel="noopener noreferrer" target="_blank">
          {localize(copy.openProject)}
          <span aria-hidden="true">↗</span>
        </a>
      ) : null}
      {project.links.repository ? (
        <a className={styles.caseButtonSecondary} href={project.links.repository} rel="noopener noreferrer" target="_blank">
          {localize(copy.openRepository)}
          <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  );
}

function CaseHeroVisual({ project }: { project: Project }) {
  const heroImage = project.visuals?.heroImage ?? project.visuals?.thumbnail;
  const hint = project.visuals?.mockupHint ?? project.subtitle;

  if (heroImage) {
    return (
      <figure className={styles.caseHeroFigure}>
        <LocalizedProjectImage
          alt={visualAlt(project)}
          fill
          optimizedWidth={1600}
          priority
          sizes="(max-width: 980px) 100vw, 52vw"
          source={heroImage}
        />
        <figcaption>{localize(hint)}</figcaption>
      </figure>
    );
  }

  return (
    <div className={styles.caseHeroFallback}>
      <div className={styles.caseFallbackChrome} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.caseFallbackIdentity}>
        <ProjectLogoMark compact eager project={project} />
        <div>
          <strong>{localize(project.title)}</strong>
          <span>{localize(project.subtitle)}</span>
        </div>
      </div>
      <p>{localize(hint)}</p>
      <div className={styles.caseFallbackGrid} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <small>{localize(copy.visualFallback)}</small>
    </div>
  );
}

function FactRow({ label, children }: { children: ReactNode; label: LocalizedText }) {
  return (
    <div className={styles.caseFactRow}>
      <dt>{localize(label)}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function PagerCard({
  direction,
  project,
}: {
  direction: "previous" | "next";
  project: Project | null;
}) {
  const label = direction === "previous" ? copy.previous : copy.next;
  const unavailable = direction === "previous" ? copy.unavailablePrevious : copy.unavailableNext;

  if (!project) {
    return (
      <div className={`${styles.projectPagerCard} ${styles.projectPagerCardDisabled}`} aria-disabled="true">
        <span className={styles.projectPagerDirection}>{localize(label)}</span>
        <p>{localize(unavailable)}</p>
      </div>
    );
  }

  return (
    <Link className={styles.projectPagerCard} href={`/projetos/${project.slug}`} style={projectAccentStyle(project)}>
      <span className={styles.projectPagerDirection}>
        <span aria-hidden="true">{direction === "previous" ? "←" : "→"}</span>
        {localize(label)}
      </span>
      <div className={styles.projectPagerIdentity}>
        <ProjectLogoMark project={project} compact />
        <div>
          <strong>{localize(project.title)}</strong>
          <p>{localize(project.subtitle)}</p>
        </div>
      </div>
    </Link>
  );
}

export function ProjectCaseStudy({ project, projects = [project] }: ProjectCaseStudyProps) {
  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const previousProject = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const nextProject = projectIndex >= 0 && projectIndex < projects.length - 1 ? projects[projectIndex + 1] : null;
  const categories = project.category.map(categoryLabel);
  const technologies = project.stack.map(techLabel);
  const heroStack = technologies.slice(0, 6);
  const highlights = localizedList(project.highlights);
  const challenges = localizedList(project.technicalChallenges);
  const galleryItems: ProjectGalleryImage[] = (project.visuals?.gallery ?? []).map((source, index) => ({
    alt: {
      pt: `${visualAlt(project).pt} ${index + 1}`,
      en: `${visualAlt(project).en} ${index + 1}`,
    },
    source,
  }));
  const sectionLinks: ProjectCaseNavLink[] = [
    { id: "overview", label: copy.overview },
    { id: "problem-solution", label: copy.problemSolution },
    { id: "highlights", label: copy.highlights },
    { id: "challenges", label: copy.challenges },
    ...(galleryItems.length > 0 ? [{ id: "gallery", label: copy.gallery }] : []),
    { id: "relevance", label: copy.relevance },
  ];

  return (
    <main className={`${styles.experience} ${styles.caseStudyPage}`} style={projectAccentStyle(project)}>
      <div className={styles.caseStudyShell}>
        <section className={styles.caseStudyHero} aria-labelledby="project-case-title">
          <div className={styles.caseHeroContent}>
            <Link className={styles.caseBackLink} href="/projetos">
              <span aria-hidden="true">←</span>
              {localize(copy.backToProjects)}
            </Link>

            <div className={styles.caseIdentityLine}>
              <ProjectLogoMark eager project={project} />
              <div>
                <p className={styles.caseEyebrow}>{localize(copy.caseLabel)}</p>
                <span className={styles.caseStatus}>{localize(project.status)}</span>
              </div>
            </div>

            <h1 className={styles.caseHeroTitle} id="project-case-title">
              {localize(project.title)}
            </h1>
            <p className={styles.caseHeroSubtitle}>{localize(project.subtitle)}</p>
            <p className={styles.caseHeroLead}>{localize(project.shortDescription)}</p>

            <div className={styles.caseHeroMeta}>
              <TagList items={categories} />
              <TagList items={heroStack} />
            </div>

            <ProjectCtas project={project} />
          </div>

          <div className={styles.caseHeroVisual}>
            <CaseHeroVisual project={project} />
          </div>
        </section>

        <ProjectCaseNav links={sectionLinks} />

        <div className={styles.caseNarrative}>
          <section className={`${styles.caseSection} ${styles.caseOverview}`} id="overview">
            <div className={styles.caseSectionHeader}>
              <p className={styles.caseEyebrow}>{localize(copy.overview)}</p>
              <h2>{localize(copy.overviewTitle)}</h2>
            </div>

            <div className={styles.caseOverviewLayout}>
              <div className={styles.caseEditorialText}>
                <p>{localize(project.fullDescription)}</p>
                <blockquote>
                  <span>{localize(copy.overviewPull)}</span>
                  <p>{localize(project.shortDescription)}</p>
                </blockquote>
              </div>

              <aside className={styles.caseFacts} aria-labelledby="case-facts-title">
                <h3 id="case-facts-title">{localize(copy.provenFacts)}</h3>
                <dl>
                  <FactRow label={copy.status}>
                    <span>{localize(project.status)}</span>
                  </FactRow>
                  <FactRow label={copy.categories}>
                    <TagList items={categories} />
                  </FactRow>
                  <FactRow label={copy.technologies}>
                    <TagList items={technologies} limit={8} />
                  </FactRow>
                  {project.featured ? (
                    <FactRow label={copy.featured}>
                      <span>{localize(copy.featured)}</span>
                    </FactRow>
                  ) : null}
                </dl>
              </aside>
            </div>
          </section>

          <section className={`${styles.caseSection} ${styles.problemSolution}`} id="problem-solution">
            <div className={styles.caseSectionHeader}>
              <p className={styles.caseEyebrow}>{localize(copy.problemSolution)}</p>
              <h2>{localize(copy.problemSolution)}</h2>
            </div>

            <div className={styles.problemSolutionGrid}>
              <article className={styles.problemPanel}>
                <span className={styles.caseStep}>01</span>
                <h3>{localize(copy.problemTitle)}</h3>
                <p>{localize(project.problem)}</p>
              </article>
              <article className={styles.solutionPanel}>
                <span className={styles.caseStep}>02</span>
                <h3>{localize(copy.solutionTitle)}</h3>
                <p>{localize(project.solution)}</p>
              </article>
            </div>
          </section>

          <section className={styles.caseSection} id="highlights">
            <div className={styles.caseSectionHeader}>
              <p className={styles.caseEyebrow}>{localize(copy.highlights)}</p>
              <h2>{localize(copy.highlightsTitle)}</h2>
            </div>

            <div className={styles.caseHighlightsGrid}>
              {highlights.map((item, index) => (
                <article className={styles.caseHighlightItem} key={`${item.text.pt}-${index}`}>
                  <span className={styles.caseStep}>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{localize(item.title)}</h3>
                  <p>{localize(item.text)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.caseSection} ${styles.caseChallenges}`} id="challenges">
            <div className={styles.caseSectionHeader}>
              <p className={styles.caseEyebrow}>{localize(copy.challenges)}</p>
              <h2>{localize(copy.challengesTitle)}</h2>
            </div>

            <div className={styles.caseChallengesLayout}>
              <ol className={styles.caseChallengeTrack}>
                {challenges.map((item, index) => (
                  <li key={`${item.text.pt}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{localize(item.title)}</h3>
                      <p>{localize(item.text)}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <aside className={styles.caseStackPanel}>
                <h3>{localize(copy.stackContext)}</h3>
                <TagList items={technologies} />
              </aside>
            </div>
          </section>

          {galleryItems.length > 0 ? (
            <section className={styles.caseSection} id="gallery">
              <div className={styles.caseSectionHeader}>
                <p className={styles.caseEyebrow}>{localize(copy.gallery)}</p>
                <h2>{localize(copy.galleryTitle)}</h2>
                <p>{localize(copy.galleryIntro)}</p>
              </div>
              <ProjectGalleryLightbox images={galleryItems} />
            </section>
          ) : null}

          <section className={`${styles.caseSection} ${styles.caseClosing}`} id="relevance">
            <div className={styles.caseClosingText}>
              <p className={styles.caseEyebrow}>{localize(copy.relevance)}</p>
              <h2>{localize(copy.relevanceTitle)}</h2>
              <p>{localize(project.whatItShows)}</p>
              <TagList items={technologies} limit={7} />
            </div>

            <div className={styles.caseClosingAction}>
              <ProjectLogoMark project={project} />
              <div>
                <strong>{localize(project.title)}</strong>
                <p>{localize(project.subtitle)}</p>
              </div>
              <ProjectCtas compact project={project} />
            </div>
          </section>

          <nav className={styles.projectPager} aria-label="Project navigation">
            <Link className={styles.projectPagerBack} href="/projetos">
              <span aria-hidden="true">←</span>
              {localize(copy.backToProjects)}
            </Link>
            <div className={styles.projectPagerGrid}>
              <PagerCard direction="previous" project={previousProject} />
              <PagerCard direction="next" project={nextProject} />
            </div>
          </nav>
        </div>
      </div>
    </main>
  );
}
