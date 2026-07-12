"use client";

import type { CSSProperties, ElementType, MouseEvent, ReactNode, TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { profile } from "@/content/profile";
import { homeCopy as copy } from "@/content/home-copy";
import { homeProjects as projects } from "@/content/home-projects";
import type { HomeProjectAccent as Accent, HomeProjectIconKey as ProjectIconKey } from "@/content/home-projects";
import type { Locale } from "@/types/portfolio";

import { Icon, ProjectIcon, StackLogo } from "./home-icons";
import type { HomeIconName as IconName } from "./home-icons";
import styles from "./visual-final-candidate.module.css";

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;


const AUTO_MS = 7000;
const FIRST_AUTO_MS = 30000;

function useReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: { children: ReactNode; as?: ElementType; className?: string; delay?: number }) {
  return (
    <Tag className={className} data-reveal style={{ "--delay": `${delay}ms` } as StyleVars}>
      {children}
    </Tag>
  );
}

function ProjectCarousel({ locale }: { locale: Locale }) {
  const [idx, setIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = projects.length;
  const touchX = useRef<number | null>(null);
  const t = copy[locale];
  const activeProject = projects[idx];
  const progressMs = idx === 0 && key === 0 ? FIRST_AUTO_MS : AUTO_MS;

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      setIdx((current) => (current + 1) % total);
      setKey((current) => current + 1);
    }, progressMs);

    return () => window.clearTimeout(timer);
  }, [idx, paused, progressMs, total]);

  function go(direction: 1 | -1) {
    setIdx((current) => (current + direction + total) % total);
    setKey((current) => current + 1);
  }

  function onTouchEnd(event: TouchEvent) {
    if (touchX.current === null) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  }

  return (
    <div
      className={styles.carousel}
      data-reveal
      onBlurCapture={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchX.current = event.touches[0].clientX;
      }}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.carouselGlow} aria-hidden="true" />
      <div className={styles.carouselHeader}>
        <span>{t.featured}</span>
        <small>
          <strong>{String(idx + 1).padStart(2, "0")}</strong> / {String(total).padStart(2, "0")}
        </small>
      </div>

      <div className={styles.carouselBody}>
        {projects.map((project, index) => (
          <article
            aria-hidden={index !== idx}
            className={styles.carouselSlide}
            data-active={index === idx ? "true" : "false"}
            key={project.title}
          >
            <div className={styles.projectSummary}>
              <ProjectIcon iconKey={project.projectIconKey} accent={project.brandAccent} />
              <h3>{project.title}</h3>
              <p>{project.description[locale]}</p>
            </div>

            <div className={styles.stackVisual}>
              <svg viewBox="0 0 400 300" aria-hidden="true">
                <circle cx="200" cy="150" r="60" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                <circle cx="200" cy="150" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                <circle cx="200" cy="150" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
              </svg>
              <div className={styles.stackGrid}>
                {project.carouselStack.slice(0, 6).map((tech, techIndex) => (
                  <div
                    className={styles.stackCard}
                    key={tech}
                    style={{ "--item": techIndex } as StyleVars}
                  >
                    <StackLogo name={tech} />
                    <span>{tech}</span>
                  </div>
                ))}
                {project.carouselStack.length > 6 ? (
                  <div className={styles.stackMore} aria-hidden="true">
                    +{project.carouselStack.length - 6}
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <button className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`} type="button" aria-label={t.previous} onClick={() => go(-1)}>
        ‹
      </button>
      <button className={`${styles.carouselArrow} ${styles.carouselArrowNext}`} type="button" aria-label={t.next} onClick={() => go(1)}>
        ›
      </button>

      <div className={styles.carouselFooter}>
        <div className={styles.progressBar}>
          {projects.map((_, index) => (
            <button
              aria-label={`${t.featured} ${index + 1}`}
              data-active={index === idx ? "true" : "false"}
              key={index}
              onClick={() => {
                setIdx(index);
                setKey((current) => current + 1);
              }}
              type="button"
            >
              {index === idx && !paused ? <span key={key} style={{ animationDuration: `${progressMs}ms` }} /> : null}
              {index === idx && paused ? <i /> : null}
              {index < idx ? <b /> : null}
            </button>
          ))}
        </div>

        <div className={styles.carouselActions}>
          <Link href={activeProject.caseHref}>{t.viewCase}</Link>
          {activeProject.liveHref ? (
            <a href={activeProject.liveHref} rel="noreferrer" target="_blank">
              {t.openSite}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FirstFold({ locale }: { locale: Locale }) {
  return (
    <div id="home" className={styles.firstFold}>
      <HeroSection locale={locale} />
      <CapabilityBar locale={locale} />
      <ScrollIndicator locale={locale} />
    </div>
  );
}

function HeroSection({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-reveal data-visible="true">
            <div className={styles.availability}>
              <span>
                <i />
                <b />
              </span>
              {t.available}
            </div>

            <h1 aria-label={`${t.titleA} ${t.titleBPrefix} ${t.titleBHighlight}`}>
              {t.titleA}{" "}
              <br />
              <span className={styles.titleLine}>
                {t.titleBPrefix} <span className={styles.titleGradient}>{t.titleBHighlight}</span>
              </span>
            </h1>

            <p>{t.subtitle}</p>

            <div className={styles.heroActions}>
              <Link href="/projetos" className={styles.primaryButton} data-cursor="primary" data-cursor-label={locale === "pt" ? "Projetos" : "Projects"}>
                <span>{t.primary}</span>
                <Icon name="arrow" />
              </Link>
              <Link href="/curriculo" className={styles.ghostButton}>
                <Icon name="user" />
                <span>{t.secondary}</span>
              </Link>
            </div>

            <Link href="/lab" className={styles.labLink}>
              <Icon name="sparkles" />
              <span>{t.lab}</span>
              <Icon name="arrow" />
            </Link>
          </div>

          <div className={styles.carouselWrap} data-reveal data-visible="true">
            <ProjectCarousel locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilityBar({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className={styles.capabilitySection}>
      <Reveal className={styles.capabilityShell}>
        <ul>
          {t.capability.map(([title, description, icon], index) => {
            const [mobileTitle, mobileDescription] = t.capabilityMobile[index];

            return (
            <li key={title} className={index !== copy[locale].capability.length - 1 ? styles.withDivider : undefined}>
              <div>
                <Icon name={icon as IconName} />
              </div>
              <span>
                <strong>
                  <span className={styles.capabilityFull}>{title}</span>
                  <span className={styles.capabilityCompact}>{mobileTitle}</span>
                </strong>
                <small>
                  <span className={styles.capabilityFull}>{description}</span>
                  <span className={styles.capabilityCompact}>{mobileDescription}</span>
                </small>
              </span>
            </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

function ScrollIndicator({ locale }: { locale: Locale }) {
  return (
    <div className={styles.scrollIndicator}>
      <div>
        <span />
      </div>
      <p>{copy[locale].scroll}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <Reveal className={styles.sectionHeading}>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      {intro ? <span>{intro}</span> : null}
    </Reveal>
  );
}

function FeaturedProjects({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section id="projetos" className={styles.section}>
      <SectionHeading eyebrow={t.projectsEyebrow} intro={t.projectsIntro} title={t.projectsTitle} />
      <div className={styles.featuredGrid}>
        {projects.map((project, index) => (
          <Reveal className={styles.featuredCard} key={project.title} delay={(index % 3) * 90}>
            <Link href={project.caseHref}>
              <div>
                <ProjectIcon iconKey={project.projectIconKey} accent={project.brandAccent} size="sm" />
                <span>
                  <Icon name="external" />
                </span>
              </div>
              <h3>{project.title}</h3>
              <small>{project.category[locale]}</small>
              <p>{project.description[locale]}</p>
              <div>
                {project.carouselStack.slice(0, 5).map((stack) => (
                  <em key={stack}>
                    <StackLogo name={stack} />
                    {stack}
                  </em>
                ))}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function StackSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const stackDetails = t.stackDetails;
  const stacks = [
    ["Next.js", stackDetails.next],
    ["React", stackDetails.react],
    ["TypeScript", stackDetails.typescript],
    ["Tailwind CSS", stackDetails.tailwind],
    ["Supabase", stackDetails.supabase],
    ["Prisma", stackDetails.prisma],
    ["PostgreSQL", stackDetails.postgres],
    ["Node.js", stackDetails.node],
    ["Python", stackDetails.python],
    ["Go", stackDetails.go],
    ["RabbitMQ", stackDetails.rabbitmq],
    ["Vite", stackDetails.vite],
  ];
  const marquee = [...stacks, ...stacks];

  return (
    <section id="stack" className={styles.section}>
      <SectionHeading eyebrow={t.stackEyebrow} intro={t.stackIntro} title={t.stackTitle} />
      <Reveal className={styles.marquee}>
        <span />
        <span />
        <div>
          {marquee.map(([stack], index) => (
            <article key={`${stack}-${index}`}>
              <StackLogo name={stack} />
              <strong>{stack}</strong>
            </article>
          ))}
        </div>
      </Reveal>

      <div className={styles.stackGridSection}>
        {stacks.map(([stack, desc], index) => (
          <Reveal className={styles.stackTile} key={stack} delay={(index % 4) * 60}>
            <div>
              <StackLogo name={stack} />
            </div>
            <span>
              <strong>{stack}</strong>
              <small>{desc}</small>
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProcessSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const steps = t.processSteps;

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow={t.processEyebrow} title={t.processTitle} />
      <ol className={styles.processGrid}>
        {steps.map(([title, desc, icon], index) => (
          <Reveal as="li" delay={index * 90} key={`process-step-${index}-${icon}`}>
            <div>
              <span>
                <Icon name={icon as IconName} />
              </span>
              <strong>0{index + 1}</strong>
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <i />
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function ArcadeSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const rows = [
    ["lena.codes", 9820],
    ["marcos.dev", 8740],
    [t.arcadeYou, 7920],
    ["aria.ts", 7110],
    ["bruno.io", 6480],
  ];
  const max = rows[0][1] as number;

  return (
    <section id="arcade" className={styles.arcadeSection}>
      <Reveal className={styles.arcadeShell}>
        <div className={styles.arcadeGlowA} aria-hidden="true" />
        <div className={styles.arcadeGlowB} aria-hidden="true" />
        <div className={styles.arcadeGrid}>
          <div>
            <span className={styles.badge}>
              <Icon name="gamepad" />
              {t.arcadeEyebrow}
            </span>
            <h2>{t.arcadeTitle}</h2>
            <p>{t.arcadeIntro}</p>
            <Link href="/lab" className={styles.primaryButton}>
              {t.openLab}
              <Icon name="arrow" />
            </Link>
          </div>

          <aside>
            <div>
              <strong>
                <Icon name="trophy" />
                {t.arcadeLeaderboard}
              </strong>
              <span>{t.arcadeLive}</span>
            </div>
            <ul>
              {rows.map(([name, score], index) => {
                const isCurrentUser = name === t.arcadeYou;

                return (
                  <li
                    className={isCurrentUser ? styles.leaderboardUserRow : undefined}
                    data-you={isCurrentUser ? "true" : "false"}
                    key={name}
                    style={{ "--score": `${((score as number) / max) * 100}%` } as StyleVars}
                  >
                    <span>{index + 1}</span>
                    <strong>{name}</strong>
                    <small>{String(score).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</small>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}

function AboutSection({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section id="sobre" className={styles.aboutSection}>
      <div className={styles.aboutGrid}>
        <Reveal>
          <div className={styles.aboutVisual}>
            <span>Á</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p>{t.aboutEyebrow}</p>
          <h2>{t.aboutTitle}</h2>
          <span>{t.aboutText}</span>
          <div className={styles.aboutStats}>
            {t.aboutStats.map(([value, label]) => (
              <article key={label}>
                <strong>{value}</strong>
                <small>{label}</small>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className={styles.finalSection}>
      <Reveal className={styles.finalShell}>
        <div />
        <h2>{t.finalTitle}</h2>
        <p>{t.finalSubtitle}</p>
        <nav>
          <Link href="/projetos" className={styles.primaryButton}>
            {t.primary}
            <Icon name="arrow" />
          </Link>
          <a href={`mailto:${profile.email}`} className={styles.ghostButton}>
            <Icon name="mail" />
            {t.contact}
          </a>
        </nav>
      </Reveal>
    </section>
  );
}

export function VisualFinalCandidate() {
  const ref = useRef<HTMLElement>(null);
  const { locale } = usePortfolioUi();
  useReveal();

  function onMove(event: MouseEvent<HTMLElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--hx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    element.style.setProperty("--hy", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <main className={styles.home} data-lovable-home onMouseMove={onMove} ref={ref} style={{ "--hx": "50%", "--hy": "0%" } as StyleVars}>
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={styles.radialBg} aria-hidden="true" />
      <div className={styles.spotlight} aria-hidden="true" />
      <div className={styles.orbA} aria-hidden="true" />
      <div className={styles.orbB} aria-hidden="true" />

      <FirstFold locale={locale} />
      <FeaturedProjects locale={locale} />
      <StackSection locale={locale} />
      <ProcessSection locale={locale} />
      <ArcadeSection locale={locale} />
      <AboutSection locale={locale} />
      <FinalCta locale={locale} />
    </main>
  );
}
