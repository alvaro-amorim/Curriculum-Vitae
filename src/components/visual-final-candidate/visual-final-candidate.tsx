"use client";

import type { CSSProperties, PointerEvent, UIEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { certificationGroup, education } from "@/content/education";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { skillDomainLabels, skillDomains, skillLevelLabels, skills } from "@/content/skills";
import type { Locale, Project, SkillDomain } from "@/types/portfolio";

import styles from "./visual-final-candidate.module.css";

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const BOOT_DURATION = 5200;
const SESSION_KEY = "portfolio-visual-final-candidate-v1";

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
    bootSteps: ["iniciando núcleo", "montando palco visual", "ativando projetos", "sincronizando sistema"],
    bootFooter: "abrindo vitrine interativa",
    eyebrow: "ÁLVARO.DEV / PRODUCT SHOWCASE",
    title: "Produtos web, SaaS e IA em uma vitrine viva.",
    subtitle:
      "Desenvolvedor Full Stack criando produtos web, SaaS, automações e integrações com IA com foco em interfaces, arquitetura e entrega real.",
    primary: "Ver projetos",
    secondary: "Abrir currículo",
    tertiary: "Developer Lab",
    stageLabel: "núcleo de produto",
    stageHint: "mova o cursor",
    operator: "operador",
    imagePending: "Imagem do projeto em preparação",
    featuredProject: "produto em destaque",
    productStage: "palco de produto",
    caseButton: "Ver estudo",
    siteButton: "Abrir site",
    projectsEyebrow: "showcase de produto",
    projectsTitle: "Projetos com espaço real para screenshots.",
    projectsIntro:
      "A candidata prioriza áreas visuais grandes para receber imagens, vídeos ou mockups reais. Enquanto isso, os frames mostram uma blueprint intencional, sem simular screenshots falsos.",
    stackEyebrow: "motor técnico",
    stackTitle: "Stack como sistema de capacidades conectadas.",
    stackIntro: "Os módulos mostram evidência prática por domínio, sem transformar skills em uma lista de barras.",
    timelineEyebrow: "trilha técnica",
    timelineTitle: "Formação e certificações como evolução do sistema.",
    labEyebrow: "camada futura",
    labTitle: "Developer Lab preparado para interação.",
    finalTitle: "Pronto para transformar essa direção na home oficial?",
    finalSubtitle: "Esta rota é uma candidata visual isolada. A home principal continua preservada até aprovação humana.",
  },
  en: {
    bootLabel: "Portfolio OS",
    bootSteps: ["initializing core", "mounting visual stage", "activating projects", "syncing system"],
    bootFooter: "opening interactive showcase",
    eyebrow: "ÁLVARO.DEV / PRODUCT SHOWCASE",
    title: "Web products, SaaS and AI inside a living showcase.",
    subtitle:
      "Full Stack Developer building web apps, SaaS products, automations and AI integrations with focus on interfaces, architecture and real delivery.",
    primary: "View projects",
    secondary: "Open resume",
    tertiary: "Developer Lab",
    stageLabel: "product core",
    stageHint: "move cursor",
    operator: "operator",
    imagePending: "Project image in preparation",
    featuredProject: "featured product",
    productStage: "product stage",
    caseButton: "View case",
    siteButton: "Open site",
    projectsEyebrow: "product showcase",
    projectsTitle: "Projects with real space for screenshots.",
    projectsIntro:
      "The candidate prioritizes large visual areas ready for real images, videos or mockups. Until then, the frames show an intentional blueprint without simulating fake screenshots.",
    stackEyebrow: "technical engine",
    stackTitle: "Stack as a connected capability system.",
    stackIntro: "Modules show practical evidence by domain without turning skills into a bar list.",
    timelineEyebrow: "technical track",
    timelineTitle: "Education and certifications as system evolution.",
    labEyebrow: "future layer",
    labTitle: "Developer Lab prepared for interaction.",
    finalTitle: "Ready to turn this direction into the official home?",
    finalSubtitle: "This route is an isolated visual candidate. The main home remains preserved until human approval.",
  },
} as const;

const labModules = {
  pt: [
    ["Runtime Runner", "protótipo visual", "Runner técnico com colisão, pontuação e feedback."],
    ["Bug Maze", "planejado", "Mapa de bugs, testes e tomada de decisão."],
    ["Debug Arena", "planejado", "Arena para investigar falhas antes da compilação."],
    ["Latency Lab", "fundação", "Simulação visual de API, cache e tempo de resposta."],
  ],
  en: [
    ["Runtime Runner", "visual prototype", "Technical runner with collision, score and feedback."],
    ["Bug Maze", "planned", "Map of bugs, tests and decision making."],
    ["Debug Arena", "planned", "Arena to investigate failures before the build."],
    ["Latency Lab", "foundation", "Visual simulation of API, cache and response time."],
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

function handleLocalPointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  event.currentTarget.style.setProperty("--lx", `${(x * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--ly", `${(y * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--rx", ((x - 0.5) * 8).toFixed(2));
  event.currentTarget.style.setProperty("--ry", ((0.5 - y) * 8).toFixed(2));
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
    if (reduceMotion || window.sessionStorage.getItem(SESSION_KEY) === "1") {
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
      </div>
      <div className={styles.bootCore} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className={styles.bootConsole}>
        <p>{t.bootLabel}</p>
        <strong>{t.bootFooter}</strong>
        <div>
          {t.bootSteps.map((step, index) => (
            <span key={step} style={{ "--step": index } as StyleVars}>
              {step}
            </span>
          ))}
        </div>
        <small>
          <i />
        </small>
      </div>
    </div>
  );
}

function ProductFrame({ project, locale, featured = false }: { project: Project; locale: Locale; featured?: boolean }) {
  const t = copy[locale];
  const visibleCategories = project.category.slice(0, featured ? 2 : 3);
  const visibleStack = project.stack.slice(0, featured ? 3 : 4);

  return (
    <article className={`${styles.productFrame} ${featured ? styles.featuredFrame : ""}`} onPointerMove={handleLocalPointer}>
      <div className={styles.productScreen} role="img" aria-label={`${t.imagePending}: ${project.title[locale]}`}>
        <div className={styles.screenTopline}>
          <span />
          <span />
          <span />
          <strong>{t.imagePending}</strong>
        </div>
        <div className={styles.screenBlueprint} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={styles.screenIdentity}>
          <small>{project.status[locale]}</small>
          <strong>{project.title[locale]}</strong>
          <em>{project.subtitle[locale]}</em>
        </div>
      </div>
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

function HeroStage({ locale, featuredProject }: { locale: Locale; featuredProject: Project }) {
  const t = copy[locale];
  const satellites = projects.filter((project) => project.featured && project.slug !== featuredProject.slug).slice(0, 3);

  return (
    <div className={styles.heroStage} data-product-stage onPointerMove={handleLocalPointer}>
      <LivingCanvas />
      <div className={styles.stageGrid} aria-hidden="true" />
      <div className={styles.stageHeader}>
        <span>{t.stageLabel}</span>
        <small>{t.stageHint}</small>
      </div>
      <div className={styles.operatorModule}>
        <Image alt={locale === "pt" ? "Foto de Álvaro Amorim." : "Photo of Álvaro Amorim."} height={68} sizes="68px" src={profile.avatar} width={68} />
        <div>
          <span>{t.operator}</span>
          <strong>Full Stack</strong>
        </div>
      </div>
      <div className={styles.systemCore} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <ProductFrame featured locale={locale} project={featuredProject} />
      <div className={styles.satelliteRail} aria-hidden="true">
        {satellites.map((project, index) => (
          <span key={project.slug} style={{ "--item": index } as StyleVars}>
            {project.title[locale]}
          </span>
        ))}
      </div>
      <div className={styles.stageSignals} aria-hidden="true">
        {["Next.js", "React", "TypeScript", "Node.js", locale === "pt" ? "IA + APIs" : "AI + APIs"].map((signal) => (
          <span key={signal}>{signal}</span>
        ))}
      </div>
    </div>
  );
}

function StackSystem({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<SkillDomain>("front");
  const selected = useMemo(() => {
    const allowed = new Set(featuredSkillNames[active]);
    return skills.filter((skill) => allowed.has(skill.name));
  }, [active]);

  return (
    <div className={styles.stackSystem} data-candidate-reveal>
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
    <div className={styles.timeline} data-candidate-reveal>
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
  );
}

function LabLayer({ locale }: { locale: Locale }) {
  return (
    <div className={styles.labLayer} data-candidate-reveal>
      {labModules[locale].map(([title, status, description], index) => (
        <article key={title} style={{ "--item": index } as StyleVars}>
          <span>{status}</span>
          <strong>{title}</strong>
          <p>{description}</p>
        </article>
      ))}
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
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 4);
  const heroProject = featuredProjects[1] ?? featuredProjects[0] ?? projects[0];
  useReveal();

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
        </div>
        <HeroStage featuredProject={heroProject} locale={locale} />
      </section>

      <section className={styles.narrative} data-section="projects">
        <SectionHeading eyebrow={t.projectsEyebrow} intro={t.projectsIntro} title={t.projectsTitle} />
        <div className={styles.projectShowcase}>
          {featuredProjects.map((project) => (
            <ProductFrame key={project.slug} locale={locale} project={project} />
          ))}
        </div>
      </section>

      <section className={styles.narrative} data-section="stack">
        <SectionHeading eyebrow={t.stackEyebrow} intro={t.stackIntro} title={t.stackTitle} />
        <StackSystem locale={locale} />
      </section>

      <section className={styles.narrative} data-section="timeline">
        <SectionHeading eyebrow={t.timelineEyebrow} title={t.timelineTitle} />
        <Timeline locale={locale} />
      </section>

      <section className={styles.narrative} data-section="lab">
        <SectionHeading eyebrow={t.labEyebrow} title={t.labTitle} />
        <LabLayer locale={locale} />
      </section>

      <section className={styles.finalCta} data-section="final" data-candidate-reveal>
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
