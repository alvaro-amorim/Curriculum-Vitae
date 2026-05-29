"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent, UIEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { downloads } from "@/content/downloads";
import { certificationGroup, education } from "@/content/education";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { skillDomainLabels, skillDomains, skillLevelLabels, skills } from "@/content/skills";
import type { Locale, Project, SkillDomain } from "@/types/portfolio";

import styles from "./visual-final-candidate.module.css";

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const BOOT_DURATION = 2850;
const SHOWCASE_INTERVAL = 6400;
const ACTIVE_STACK_LIMIT = 5;
const SESSION_KEY = "portfolio-visual-final-candidate-v3";

const featuredSkillNames: Record<SkillDomain, string[]> = {
  front: ["React", "Next.js", "TypeScript", "CSS3"],
  back: ["Node.js", "Python", "REST APIs", "JWT"],
  database: ["PostgreSQL", "Supabase", "Prisma", "MongoDB"],
  devops: ["Git", "GitHub", "Vercel", "CI/CD"],
  ai: ["AI Tools", "LLMs", "Codex"],
  product: ["Scrum", "UI Libraries"],
};

const copy = {
  pt: {
    bootLabel: "Portfolio OS",
    bootSteps: ["iniciando núcleo", "varrendo grid visual", "montando vitrine", "conectando projetos", "abrindo sistema"],
    bootFooter: "vitrine visual em abertura",
    eyebrow: "ÁLVARO.DEV / VITRINE DE PRODUTOS",
    title: "Produtos web, SaaS e IA em movimento.",
    subtitle: "Full Stack criando produtos web, automações e IA com arquitetura, interface e entrega real.",
    primary: "Ver projetos",
    secondary: "Abrir currículo",
    tertiary: "Developer Lab",
    stageLabel: "núcleo de produto",
    stageHint: "mova o cursor",
    operator: "operador",
    imagePending: "Imagem do projeto em preparação",
    featuredProject: "produto em destaque",
    productStage: "palco de produto",
    liveShowcase: "vitrine viva",
    connectedStack: "tecnologias conectadas",
    activeProject: "projeto ativo",
    carouselLabel: "Carrossel de projetos da primeira dobra",
    previousProject: "Projeto anterior",
    nextProject: "Próximo projeto",
    pauseAutoplay: "Pausar rotação",
    resumeAutoplay: "Retomar rotação",
    autoplayPaused: "rotação pausada",
    autoplayRunning: "rotação automática",
    selectProject: "Selecionar projeto",
    projectProgress: "progresso do projeto ativo",
    caseButton: "Ver estudo",
    siteButton: "Abrir site",
    projectsEyebrow: "vitrine de produto",
    projectsTitle: "Projetos com espaço real para screenshots.",
    projectsIntro:
      "A experiência prioriza áreas visuais grandes para receber imagens, vídeos ou mockups reais. Enquanto isso, os frames mostram uma blueprint intencional, sem simular screenshots falsos.",
    projectScene: "cena de produto",
    projectFlow: "fluxo visual",
    stackEyebrow: "motor técnico",
    stackTitle: "Stack como sistema de capacidades conectadas.",
    stackIntro: "Os módulos mostram evidência prática por domínio, sem transformar skills em uma lista de barras.",
    stackConnection: "projetos relacionados",
    timelineEyebrow: "trilha técnica",
    timelineTitle: "Formação e certificações como evolução do sistema.",
    timelineIntro: "A linha mostra base acadêmica e certificações como camadas que sustentam produto, dados, segurança e IA.",
    labEyebrow: "developer arcade",
    labTitle: "Quatro jogos finais para testar.",
    labIntro: "Runtime Runner, Bug Maze, Code Snake e Stack Tetris mostram feedback, estado e score em uma vitrine mais direta.",
    finalTitle: "Vamos transformar produto em entrega real?",
    finalSubtitle: "Explore projetos, currículo e GitHub em uma experiência viva para entender como eu construo produtos web, SaaS e IA.",
    directNav: "navegação direta",
    directProjects: "Projetos",
    directLab: "Lab",
    directResume: "Currículo",
    directContact: "Contato",
    directDownload: "PDF",
  },
  en: {
    bootLabel: "Portfolio OS",
    bootSteps: ["starting core", "scanning visual grid", "assembling showcase", "linking projects", "opening system"],
    bootFooter: "visual showcase opening",
    eyebrow: "ÁLVARO.DEV / PRODUCT SHOWCASE",
    title: "Web, SaaS and AI products in motion.",
    subtitle: "Full Stack Developer building web products, automations and AI integrations with product-grade delivery.",
    primary: "View projects",
    secondary: "Open resume",
    tertiary: "Developer Lab",
    stageLabel: "product core",
    stageHint: "move cursor",
    operator: "operator",
    imagePending: "Project image in preparation",
    featuredProject: "featured product",
    productStage: "product stage",
    liveShowcase: "living showcase",
    connectedStack: "connected stack",
    activeProject: "active project",
    carouselLabel: "First fold project carousel",
    previousProject: "Previous project",
    nextProject: "Next project",
    pauseAutoplay: "Pause rotation",
    resumeAutoplay: "Resume rotation",
    autoplayPaused: "rotation paused",
    autoplayRunning: "auto rotation",
    selectProject: "Select project",
    projectProgress: "active project progress",
    caseButton: "View case",
    siteButton: "Open site",
    projectsEyebrow: "product showcase",
    projectsTitle: "Projects with real space for screenshots.",
    projectsIntro:
      "The experience prioritizes large visual areas ready for real images, videos or mockups. Until then, the frames show an intentional blueprint without simulating fake screenshots.",
    projectScene: "product scene",
    projectFlow: "visual flow",
    stackEyebrow: "technical engine",
    stackTitle: "Stack as a connected capability system.",
    stackIntro: "Modules show practical evidence by domain without turning skills into a bar list.",
    stackConnection: "project connection",
    timelineEyebrow: "technical track",
    timelineTitle: "Education and certifications as system evolution.",
    timelineIntro: "The line shows education and certifications as layers supporting product, data, security and AI.",
    labEyebrow: "developer arcade",
    labTitle: "Four final games to try.",
    labIntro: "Runtime Runner, Bug Maze, Code Snake and Stack Tetris show feedback, state and score in a more direct showcase.",
    finalTitle: "Ready to turn product ideas into real delivery?",
    finalSubtitle: "Explore projects, resume and GitHub in a living experience built around web products, SaaS and AI.",
    directNav: "direct navigation",
    directProjects: "Projects",
    directLab: "Lab",
    directResume: "Resume",
    directContact: "Contact",
    directDownload: "PDF",
  },
} as const;

const labModules = {
  pt: [
    ["Runtime Runner", "jogável", "Runner técnico com salto, colisão e score local."],
    ["Bug Maze", "jogável", "Labirinto de debug com patches, hazards e deploy seguro."],
    ["Code Snake", "jogável", "Snake de programação com tokens, bugs e crescimento."],
    ["Stack Tetris", "jogável", "Puzzle de stack com peças, linhas compiladas e level."],
  ],
  en: [
    ["Runtime Runner", "playable", "Technical runner with jump, collision and local score."],
    ["Bug Maze", "playable", "Debug maze with patches, hazards and safe deploy."],
    ["Code Snake", "playable", "Programming snake with tokens, bugs and growth."],
    ["Stack Tetris", "playable", "Stack puzzle with modules, compiled lines and level."],
  ],
} as const;

function formatCategory(value: string, locale: Locale) {
  if (locale === "en" && value === "IA") return "AI";
  if (locale === "en" && value === "Métricas") return "Metrics";
  if (locale === "en" && value === "Catálogo") return "Catalog";
  if (locale === "en" && value === "Institucional") return "Institutional";
  if (locale === "en" && value === "Dados") return "Data";
  if (locale === "en" && value === "Entretenimento") return "Entertainment";
  return value;
}

function handlePointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  event.currentTarget.style.setProperty("--px", `${(x * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--py", `${(y * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--mx", ((x - 0.5) * 2).toFixed(3));
  event.currentTarget.style.setProperty("--my", ((y - 0.5) * 2).toFixed(3));
}

function setLocalPointer(element: HTMLElement, x: number, y: number) {
  element.style.setProperty("--lx", `${(x * 100).toFixed(2)}%`);
  element.style.setProperty("--ly", `${(y * 100).toFixed(2)}%`);
  element.style.setProperty("--rx", ((x - 0.5) * 8).toFixed(2));
  element.style.setProperty("--ry", ((0.5 - y) * 8).toFixed(2));
}

function resetLocalPointer(element: HTMLElement) {
  setLocalPointer(element, 0.5, 0.5);
}

function handleLocalPointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  setLocalPointer(event.currentTarget, x, y);
}

function handleScroll(event: UIEvent<HTMLElement>) {
  const root = event.currentTarget;
  const range = Math.max(1, root.scrollHeight - root.clientHeight);
  root.style.setProperty("--scroll-progress", `${((root.scrollTop / range) * 100).toFixed(2)}%`);
}

function useBoot() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forceBoot = new URLSearchParams(window.location.search).get("boot") === "1";

    if (reduceMotion || (!forceBoot && window.sessionStorage.getItem(SESSION_KEY) === "1")) {
      const skipTimer = window.setTimeout(() => setBooting(false), 0);
      return () => window.clearTimeout(skipTimer);
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setBooting(false);
    }, BOOT_DURATION);

    return () => window.clearTimeout(timer);
  }, []);

  return booting;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncPreference(event: MediaQueryListEvent) {
      setReducedMotion(event.matches);
    }

    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  return reducedMotion;
}

function useReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-final-candidate]");
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-candidate-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        }
      },
      { root, rootMargin: "0px 0px -16% 0px", threshold: 0.14 },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, []);
}

function getProjectTone(project: Project, index: number): StyleVars {
  if (project.visuals?.accent) {
    return {
      "--project-accent": project.visuals.accent.primary,
      "--project-accent-2": project.visuals.accent.secondary,
      "--project-accent-3": project.visuals.accent.tertiary,
      "--project-seed": project.slug.length + index,
    };
  }

  const tones = [
    ["#7dd3fc", "#3b82f6", "#c084fc"],
    ["#67e8f9", "#22c55e", "#7dd3fc"],
    ["#c084fc", "#3b82f6", "#f0abfc"],
    ["#ffd166", "#f97316", "#7dd3fc"],
    ["#93c5fd", "#6366f1", "#67e8f9"],
    ["#f0abfc", "#a855f7", "#7dd3fc"],
  ];
  const selected = tones[index % tones.length];

  return {
    "--project-accent": selected[0],
    "--project-accent-2": selected[1],
    "--project-accent-3": selected[2],
    "--project-seed": project.slug.length + index,
  };
}

function ProjectVisualSurface({
  blueprintClassName,
  className,
  imageSizes,
  locale,
  pendingLabel,
  project,
}: {
  blueprintClassName: string;
  className: string;
  imageSizes: string;
  locale: Locale;
  pendingLabel: string;
  project: Project;
}) {
  const visuals = project.visuals;
  const imageSource = visuals?.heroImage ?? visuals?.thumbnail ?? null;
  const hasImage = visuals?.status === "available" && Boolean(imageSource);
  const visualStatus = visuals?.status ?? "pending";
  const visualLayout = visuals?.layout ?? "operational-saas";
  const visualAlt = visuals?.alt[locale] ?? project.title[locale];
  const gallerySlots = visuals?.gallery.length ? visuals.gallery.slice(0, 3) : [null, null, null];

  return (
    <div
      className={`${className} ${styles.visualSurface}`}
      data-visual-layout={visualLayout}
      data-visual-status={visualStatus}
      role="img"
      aria-label={hasImage ? visualAlt : `${pendingLabel}: ${visualAlt}`}
    >
      <div className={styles.screenTopline}>
        <span />
        <span />
        <span />
        <strong>{hasImage ? visualAlt : pendingLabel}</strong>
      </div>
      {hasImage && imageSource ? (
        <Image alt={visualAlt} className={styles.visualImage} fill sizes={imageSizes} src={imageSource} />
      ) : (
        <>
          <div className={styles.visualMockupShell} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={`${blueprintClassName} ${styles.visualBlueprint}`} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className={styles.visualGalleryStrip} aria-hidden="true">
            {gallerySlots.map((slot, index) => (
              <span data-filled={Boolean(slot)} key={`${project.slug}-gallery-${index}`} />
            ))}
          </div>
          <div className={styles.visualHint}>
            <strong>{visuals?.mockupHint[locale] ?? visualAlt}</strong>
            <small>{pendingLabel}</small>
          </div>
        </>
      )}
      <div className={styles.screenIdentity}>
        <small>{project.status[locale]}</small>
        <strong>{project.title[locale]}</strong>
        <em>{project.subtitle[locale]}</em>
      </div>
    </div>
  );
}

function LivingCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const canvasElement = canvas;
    const canvasContext = context;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.53, y: 0.46 };
    const particles = Array.from({ length: 68 }, (_, index) => ({
      angle: (index / 68) * Math.PI * 2,
      radius: 0.12 + ((index * 17) % 48) / 100,
      speed: 0.05 + ((index * 7) % 15) / 120,
      size: 0.8 + ((index * 11) % 6) / 2,
      lane: index % 5,
    }));
    let width = 1;
    let height = 1;
    let frame = 0;

    function resize() {
      const rect = canvasElement.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvasElement.width = Math.floor(width * ratio);
      canvasElement.height = Math.floor(height * ratio);
      canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function move(event: globalThis.PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();
      pointer.x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      pointer.y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    }

    function draw(timestamp: number) {
      const time = timestamp / 1000;
      const centerX = width * (0.5 + (pointer.x - 0.5) * 0.18);
      const centerY = height * (0.44 + (pointer.y - 0.5) * 0.12);
      const min = Math.min(width, height);
      canvasContext.clearRect(0, 0, width, height);

      const halo = canvasContext.createRadialGradient(centerX, centerY, min * 0.04, centerX, centerY, min * 0.7);
      halo.addColorStop(0, "rgba(125, 211, 252, 0.36)");
      halo.addColorStop(0.38, "rgba(59, 130, 246, 0.18)");
      halo.addColorStop(0.68, "rgba(192, 132, 252, 0.11)");
      halo.addColorStop(1, "rgba(0, 0, 0, 0)");
      canvasContext.fillStyle = halo;
      canvasContext.fillRect(0, 0, width, height);

      canvasContext.save();
      canvasContext.globalCompositeOperation = "screen";
      for (const particle of particles) {
        const drift = reduceMotion ? 0 : time * particle.speed;
        const orbit = min * particle.radius;
        const angle = particle.angle + drift;
        const x = centerX + Math.cos(angle) * orbit + (pointer.x - 0.5) * particle.lane * 18;
        const y = centerY + Math.sin(angle) * orbit * 0.58 + (pointer.y - 0.5) * particle.lane * 14;
        const alpha = 0.14 + (Math.sin(time * 1.7 + particle.angle) + 1) * 0.1;
        canvasContext.beginPath();
        canvasContext.fillStyle =
          particle.lane === 1
            ? `rgba(192, 132, 252, ${alpha})`
            : particle.lane === 2
              ? `rgba(103, 232, 249, ${alpha})`
              : `rgba(125, 211, 252, ${alpha})`;
        canvasContext.arc(x, y, particle.size, 0, Math.PI * 2);
        canvasContext.fill();

        if (particle.lane !== 4) {
          canvasContext.beginPath();
          canvasContext.strokeStyle = `rgba(125, 211, 252, ${alpha * 0.2})`;
          canvasContext.moveTo(centerX, centerY);
          canvasContext.lineTo(x, y);
          canvasContext.stroke();
        }
      }

      for (let index = 0; index < 4; index += 1) {
        canvasContext.beginPath();
        canvasContext.strokeStyle = `rgba(${index % 2 ? "192, 132, 252" : "125, 211, 252"}, ${0.14 - index * 0.018})`;
        canvasContext.lineWidth = 1;
        canvasContext.ellipse(centerX, centerY, min * (0.19 + index * 0.075), min * (0.09 + index * 0.034), 0.08, 0, Math.PI * 2);
        canvasContext.stroke();
      }
      canvasContext.restore();

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }

    resize();
    draw(0);
    window.addEventListener("resize", resize);
    canvasElement.addEventListener("pointermove", move);
    if (!reduceMotion) frame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      canvasElement.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas aria-hidden="true" className={styles.livingCanvas} ref={ref} />;
}

function BootScreen({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <div className={styles.boot} data-final-boot role="status" aria-live="polite">
      <div className={styles.bootAtmosphere} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className={styles.bootFrame} aria-hidden="true">
        <div className={styles.bootCore}>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={styles.bootNodes}>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={styles.bootRings}>
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={styles.bootConsole}>
        <p>{t.bootLabel}</p>
        <strong>{t.bootFooter}</strong>
        <div className={styles.bootSequence}>
          {t.bootSteps.map((step, index) => (
            <span key={step} style={{ "--step": index } as StyleVars}>
              {step}
            </span>
          ))}
        </div>
        <small className={styles.bootProgress}>
          <i />
        </small>
      </div>
      <div className={styles.bootLaunch} aria-hidden="true" />
    </div>
  );
}

function ProductFrame({ project, locale, featured = false }: { project: Project; locale: Locale; featured?: boolean }) {
  const t = copy[locale];
  const visibleCategories = project.category.slice(0, featured ? 2 : 3);
  const visibleStack = project.stack.slice(0, featured ? 3 : 4);

  return (
    <article
      className={`${styles.productFrame} ${featured ? styles.featuredFrame : ""}`}
      data-visual-layout={project.visuals?.layout}
      data-visual-status={project.visuals?.status ?? "pending"}
      onPointerMove={handleLocalPointer}
      onPointerLeave={(event) => resetLocalPointer(event.currentTarget)}
      style={getProjectTone(project, 0)}
    >
      <ProjectVisualSurface
        blueprintClassName={styles.screenBlueprint}
        className={styles.productScreen}
        imageSizes="(max-width: 680px) 92vw, 62vw"
        locale={locale}
        pendingLabel={t.imagePending}
        project={project}
      />
      <div className={styles.productMeta}>
        <p>{featured ? t.featuredProject : t.productStage}</p>
        <h3>{project.title[locale]}</h3>
        <span>{project.shortDescription[locale]}</span>
        <div className={styles.tagList}>
          {visibleCategories.map((category) => (
            <small key={category}>{formatCategory(category, locale)}</small>
          ))}
          {visibleStack.map((stack) => (
            <small key={stack}>{stack}</small>
          ))}
        </div>
        <div className={styles.frameActions}>
          <Link href={`/projetos/${project.slug}`}>{t.caseButton}</Link>
          <a href={project.links.website} rel="noreferrer" target="_blank">
            {t.siteButton}
          </a>
        </div>
      </div>
    </article>
  );
}

function ActiveStackOrbit({ locale, project }: { locale: Locale; project: Project }) {
  const t = copy[locale];
  const stackItems = project.stack.slice(0, ACTIVE_STACK_LIMIT);

  return (
    <div className={styles.activeStackOrbit} aria-label={`${t.connectedStack}: ${project.title[locale]}`}>
      <p>{t.connectedStack}</p>
      <div className={styles.stackConnector} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.stackNodes}>
        {stackItems.map((stack, index) => (
          <span data-stack-node key={`${project.slug}-${stack}`} style={{ "--node": index } as StyleVars} title={stack}>
            {stack}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectVisualFrame({ locale, project, projectIndex }: { locale: Locale; project: Project; projectIndex: number }) {
  const t = copy[locale];

  return (
    <article
      className={styles.activeProjectFrame}
      data-project-frame={project.slug}
      data-visual-layout={project.visuals?.layout}
      data-visual-status={project.visuals?.status ?? "pending"}
      key={project.slug}
      onPointerMove={handleLocalPointer}
      onPointerLeave={(event) => resetLocalPointer(event.currentTarget)}
      style={getProjectTone(project, projectIndex)}
    >
      <ProjectVisualSurface
        blueprintClassName={styles.heroBlueprint}
        className={styles.activeScreen}
        imageSizes="(max-width: 680px) 92vw, 52vw"
        locale={locale}
        pendingLabel={t.imagePending}
        project={project}
      />
      <div className={styles.activeProjectMeta} aria-live="polite">
        <p>{t.activeProject}</p>
        <h2>{project.title[locale]}</h2>
        <span>{project.shortDescription[locale]}</span>
        <div className={styles.frameActions}>
          <Link href={`/projetos/${project.slug}`}>{t.caseButton}</Link>
          <a href={project.links.website} rel="noreferrer" target="_blank">
            {t.siteButton}
          </a>
        </div>
      </div>
    </article>
  );
}

function ProjectStory({ index, locale, project, total }: { index: number; locale: Locale; project: Project; total: number }) {
  const t = copy[locale];
  const visibleStack = project.stack.slice(0, 4);
  const categories = project.category.slice(0, 2).map((category) => formatCategory(category, locale));

  return (
    <div
      className={styles.projectStory}
      data-candidate-reveal
      data-visual-layout={project.visuals?.layout}
      onPointerMove={handleLocalPointer}
      onPointerLeave={(event) => resetLocalPointer(event.currentTarget)}
      style={{ ...getProjectTone(project, index), "--item": index } as StyleVars}
    >
      <div className={styles.storyMarker} aria-hidden="true">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <i />
        <small>{String(total).padStart(2, "0")}</small>
      </div>
      <ProductFrame locale={locale} project={project} />
      <aside className={styles.storySignal} aria-label={`${t.projectScene}: ${project.title[locale]}`}>
        <p>{t.projectFlow}</p>
        <strong>{project.status[locale]}</strong>
        <div>
          {categories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
        <ul>
          {visibleStack.map((stack) => (
            <li key={stack}>{stack}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function ProductStories({ locale, projectsList }: { locale: Locale; projectsList: Project[] }) {
  return (
    <div className={styles.productStories}>
      {projectsList.map((project, index) => (
        <ProjectStory index={index} key={project.slug} locale={locale} project={project} total={projectsList.length} />
      ))}
    </div>
  );
}

function NarrativeRail({ locale }: { locale: Locale }) {
  const labels =
    locale === "pt"
      ? ["vitrine", "stack", "trilha", "lab", "contato"]
      : ["showcase", "stack", "track", "lab", "contact"];

  return (
    <div className={styles.narrativeRail} aria-hidden="true">
      {labels.map((label, index) => (
        <span key={label} style={{ "--item": index } as StyleVars}>
          {label}
        </span>
      ))}
    </div>
  );
}

function HomeQuickNav({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const activeDownload = downloads[locale].pdf;

  return (
    <nav className={styles.quickNav} aria-label={t.directNav} data-home-quick-nav="true">
      <span className={styles.quickNavLabel}>{t.directNav}</span>
      <Link href="/projetos">{t.directProjects}</Link>
      <Link href="/lab">{t.directLab}</Link>
      <Link href="/curriculo">{t.directResume}</Link>
      <a href="#home-contact">{t.directContact}</a>
      <a href={activeDownload.href} download={activeDownload.fileName}>
        {t.directDownload}
      </a>
    </nav>
  );
}

function ShowcaseControls({
  activeIndex,
  autoplayRunning,
  locale,
  onNext,
  onPrevious,
  onSelect,
  onToggleAutoplay,
  projectsList,
}: {
  activeIndex: number;
  autoplayRunning: boolean;
  locale: Locale;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (index: number) => void;
  onToggleAutoplay: () => void;
  projectsList: Project[];
}) {
  const t = copy[locale];

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onNext();
    }

    if (event.key === "Home") {
      event.preventDefault();
      onSelect(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      onSelect(projectsList.length - 1);
    }
  }

  return (
    <div className={styles.showcaseControls} aria-label={t.carouselLabel} onKeyDown={handleKeyDown}>
      <button aria-label={t.previousProject} className={styles.roundControl} data-carousel-previous type="button" onClick={onPrevious}>
        <span aria-hidden="true">←</span>
      </button>
      <div className={styles.projectDots} role="tablist" aria-label={t.carouselLabel}>
        {projectsList.map((project, index) => (
          <button
            aria-label={`${t.selectProject}: ${project.title[locale]}`}
            aria-selected={index === activeIndex}
            className={index === activeIndex ? styles.activeDot : undefined}
            data-carousel-project={project.slug}
            key={project.slug}
            role="tab"
            type="button"
            onClick={() => onSelect(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{project.title[locale]}</strong>
          </button>
        ))}
      </div>
      <button aria-label={t.nextProject} className={styles.roundControl} data-carousel-next type="button" onClick={onNext}>
        <span aria-hidden="true">→</span>
      </button>
      <button aria-pressed={!autoplayRunning} className={styles.autoplayControl} data-carousel-autoplay type="button" onClick={onToggleAutoplay}>
        {autoplayRunning ? t.pauseAutoplay : t.resumeAutoplay}
      </button>
    </div>
  );
}

function HeroStage({
  activeIndex,
  autoplayRunning,
  locale,
  onNext,
  onPauseChange,
  onPrevious,
  onSelectProject,
  onToggleAutoplay,
  projectsList,
}: {
  activeIndex: number;
  autoplayRunning: boolean;
  locale: Locale;
  onNext: () => void;
  onPauseChange: (paused: boolean) => void;
  onPrevious: () => void;
  onSelectProject: (index: number) => void;
  onToggleAutoplay: () => void;
  projectsList: Project[];
}) {
  const t = copy[locale];
  const activeProject = projectsList[activeIndex] ?? projectsList[0];

  function handleStagePointerLeave(event: PointerEvent<HTMLDivElement>) {
    resetLocalPointer(event.currentTarget);
    onPauseChange(false);
  }

  return (
    <div
      className={styles.heroStage}
      data-product-stage
      data-active-project={activeProject.slug}
      onBlurCapture={() => onPauseChange(false)}
      onFocusCapture={() => onPauseChange(true)}
      onPointerEnter={() => onPauseChange(true)}
      onPointerLeave={handleStagePointerLeave}
      onPointerMove={handleLocalPointer}
      style={getProjectTone(activeProject, activeIndex)}
      data-autoplay={autoplayRunning ? "running" : "paused"}
    >
      <LivingCanvas />
      <div className={styles.stageGrid} aria-hidden="true" />
      <div className={styles.stageHeader}>
        <span>{t.liveShowcase}</span>
        <small>
          {String(activeIndex + 1).padStart(2, "0")} / {String(projectsList.length).padStart(2, "0")}
        </small>
      </div>
      <div className={styles.systemCore} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <ProjectVisualFrame key={activeProject.slug} locale={locale} project={activeProject} projectIndex={activeIndex} />
      <ActiveStackOrbit locale={locale} project={activeProject} />
      <div className={styles.showcaseProgress} aria-label={t.projectProgress}>
        <span key={`${activeProject.slug}-${autoplayRunning}`} className={autoplayRunning ? styles.progressActive : styles.progressPaused} />
      </div>
      <ShowcaseControls
        activeIndex={activeIndex}
        autoplayRunning={autoplayRunning}
        locale={locale}
        projectsList={projectsList}
        onNext={onNext}
        onPrevious={onPrevious}
        onSelect={onSelectProject}
        onToggleAutoplay={onToggleAutoplay}
      />
    </div>
  );
}

function StackSystem({ locale, projectsList }: { locale: Locale; projectsList: Project[] }) {
  const [active, setActive] = useState<SkillDomain>("front");
  const selected = useMemo(() => {
    const allowed = new Set(featuredSkillNames[active]);
    return skills.filter((skill) => allowed.has(skill.name));
  }, [active]);
  const relatedProjects = useMemo(() => {
    const selectedNames = new Set(selected.map((skill) => skill.name));
    return projectsList
      .filter((project) => project.stack.some((stack) => selectedNames.has(stack) || (active === "ai" && /AI|IA|OpenAI|Gemini/i.test(stack))))
      .slice(0, 3);
  }, [active, projectsList, selected]);
  const t = copy[locale];

  return (
    <div
      className={styles.stackSystem}
      data-candidate-reveal
      onPointerMove={handleLocalPointer}
      onPointerLeave={(event) => resetLocalPointer(event.currentTarget)}
    >
      <div className={styles.stackOrbit} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.domainRail} aria-label={locale === "pt" ? "Domínios técnicos" : "Technical domains"}>
        {skillDomains.map((domain) => (
          <button className={domain === active ? styles.activeDomain : undefined} key={domain} type="button" onClick={() => setActive(domain)}>
            {skillDomainLabels[domain][locale]}
          </button>
        ))}
      </div>
      <div className={styles.capabilityMap}>
        {selected.map((skill, index) => {
          const level = skill.level ?? "foundation";
          return (
            <article key={skill.name} style={{ "--item": index } as StyleVars}>
              <span>{skillLevelLabels[level][locale]}</span>
              <strong>{skill.name}</strong>
              <p>{skill.evidence?.[locale]}</p>
            </article>
          );
        })}
      </div>
      <div className={styles.stackProjectTrace} aria-label={t.stackConnection}>
        <p>{t.stackConnection}</p>
        {relatedProjects.map((project, index) => (
          <a href={project.links.website} key={project.slug} rel="noreferrer" style={{ ...getProjectTone(project, index), "--item": index } as StyleVars} target="_blank">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{project.title[locale]}</strong>
            <small>{project.stack.slice(0, 3).join(" / ")}</small>
          </a>
        ))}
      </div>
    </div>
  );
}

function Timeline({ locale }: { locale: Locale }) {
  const items = [
    ...education.map((item) => ({
      badge: item.period,
      title: item.title[locale],
      meta: item.institution[locale],
    })),
    ...certificationGroup.items.slice(0, 4).map((item, index) => ({
      badge: `0${index + 1}`,
      title: item[locale],
      meta: certificationGroup.meta[locale],
    })),
  ];

  return (
    <div
      className={styles.timelineStage}
      data-candidate-reveal
      onPointerMove={handleLocalPointer}
      onPointerLeave={(event) => resetLocalPointer(event.currentTarget)}
    >
      <div className={styles.timelineConstellation} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.timeline}>
        {items.map((item, index) => (
          <article key={`${item.title}-${index}`} style={{ "--item": index } as StyleVars}>
            <span>{item.badge}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.meta}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function LabLayer({ locale }: { locale: Locale }) {
  return (
    <div
      className={styles.labLayer}
      data-candidate-reveal
      onPointerMove={handleLocalPointer}
      onPointerLeave={(event) => resetLocalPointer(event.currentTarget)}
    >
      <div className={styles.labPreview} aria-hidden="true">
        <span />
        <span />
        <span />
        <strong>Developer Lab</strong>
      </div>
      <div className={styles.labModules}>
        {labModules[locale].map(([title, status, description], index) => (
          <article key={title} style={{ "--item": index } as StyleVars}>
            <span>{status}</span>
            <strong>{title}</strong>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className={styles.sectionHeading} data-candidate-reveal>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      {intro ? <span>{intro}</span> : null}
    </div>
  );
}

export function VisualFinalCandidate() {
  const { locale } = usePortfolioUi();
  const t = copy[locale];
  const booting = useBoot();
  const reducedMotion = useReducedMotion();
  const showcaseProjects = projects;
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 4);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [stagePaused, setStagePaused] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const autoplayRunning = !booting && !reducedMotion && !stagePaused && !manualPause;
  useReveal();

  useEffect(() => {
    if (!autoplayRunning) return;

    const interval = window.setInterval(() => {
      setActiveProjectIndex((current) => (current + 1) % showcaseProjects.length);
    }, SHOWCASE_INTERVAL);

    return () => window.clearInterval(interval);
  }, [autoplayRunning, showcaseProjects.length]);

  function selectProject(index: number) {
    setActiveProjectIndex((index + showcaseProjects.length) % showcaseProjects.length);
    setManualPause(true);
  }

  function nextProject() {
    selectProject(activeProjectIndex + 1);
  }

  function previousProject() {
    selectProject(activeProjectIndex - 1);
  }

  return (
    <main
      className={`${styles.candidate} ${booting ? styles.booting : styles.ready}`}
      data-final-candidate
      onPointerMove={handlePointer}
      onScroll={handleScroll}
      style={{ "--px": "58%", "--py": "42%", "--mx": 0, "--my": 0, "--scroll-progress": "0%" } as StyleVars}
    >
      {booting ? <BootScreen locale={locale} /> : null}
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.progressRail} aria-hidden="true">
        <span />
      </div>
      <NarrativeRail locale={locale} />

      <section className={styles.hero} data-section="hero">
        <div className={styles.heroCopy}>
          <p>{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <span>{t.subtitle}</span>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/projetos">
              {t.primary}
            </Link>
            <Link className={styles.secondary} href="/curriculo">
              {t.secondary}
            </Link>
            <Link className={styles.ghost} href="/lab">
              {t.tertiary}
            </Link>
          </div>
          <HomeQuickNav locale={locale} />
        </div>
        <HeroStage
          activeIndex={activeProjectIndex}
          autoplayRunning={autoplayRunning}
          locale={locale}
          projectsList={showcaseProjects}
          onNext={nextProject}
          onPauseChange={setStagePaused}
          onPrevious={previousProject}
          onSelectProject={selectProject}
          onToggleAutoplay={() => setManualPause((paused) => !paused)}
        />
      </section>

      <section className={styles.narrative} data-section="projects" id="home-projects">
        <SectionHeading eyebrow={t.projectsEyebrow} intro={t.projectsIntro} title={t.projectsTitle} />
        <ProductStories locale={locale} projectsList={featuredProjects} />
      </section>

      <section className={styles.narrative} data-section="stack" id="home-stack">
        <SectionHeading eyebrow={t.stackEyebrow} intro={t.stackIntro} title={t.stackTitle} />
        <StackSystem locale={locale} projectsList={featuredProjects} />
      </section>

      <section className={styles.narrative} data-section="timeline" id="home-timeline">
        <SectionHeading eyebrow={t.timelineEyebrow} intro={t.timelineIntro} title={t.timelineTitle} />
        <Timeline locale={locale} />
      </section>

      <section className={styles.narrative} data-section="lab" id="home-lab">
        <SectionHeading eyebrow={t.labEyebrow} intro={t.labIntro} title={t.labTitle} />
        <LabLayer locale={locale} />
      </section>

      <section
        className={styles.finalCta}
        data-section="final"
        data-candidate-reveal
        id="home-contact"
        onPointerMove={handleLocalPointer}
        onPointerLeave={(event) => resetLocalPointer(event.currentTarget)}
      >
        <p>Portfolio OS</p>
        <h2>{t.finalTitle}</h2>
        <span>{t.finalSubtitle}</span>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/projetos">
            {t.primary}
          </Link>
          <Link className={styles.secondary} href="/curriculo">
            {t.secondary}
          </Link>
          <a className={styles.ghost} href={profile.github} rel="noreferrer" target="_blank">
            GitHub
          </a>
        </div>
      </section>
    </main>
  );
}
