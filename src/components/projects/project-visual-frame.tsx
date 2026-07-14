import Image from "next/image";
import type { CSSProperties } from "react";

import { cloudinaryOptimizedImageUrl } from "@/lib/media/media-rules";
import type { Locale, Project } from "@/types/portfolio";

import styles from "./project-experience.module.css";

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

type ProjectVisualFrameProps = {
  project: Project;
  locale: Locale;
  mode?: "large" | "compact";
  index?: number;
};

const pendingCopy = {
  pt: "Imagem do projeto em preparação",
  en: "Project image in preparation",
} as const;

export function projectAccentStyle(project: Project): StyleVars {
  const accent = project.visuals?.accent;

  return {
    "--accent-a": accent?.primary ?? "#7dd3fc",
    "--accent-b": accent?.secondary ?? "#3b82f6",
    "--accent-c": accent?.tertiary ?? "#c084fc",
  };
}

export function ProjectVisualFrame({ project, locale, mode = "large", index }: ProjectVisualFrameProps) {
  const visuals = project.visuals;
  const image = mode === "compact" ? (visuals?.thumbnail ?? visuals?.heroImage) : (visuals?.heroImage ?? visuals?.thumbnail);
  const status = visuals?.status ?? "pending";
  const isPending = status !== "available" || !image;
  const label = isPending ? pendingCopy[locale] : visuals?.alt[locale];
  const imageWidth = mode === "compact" ? 720 : 1440;
  const imageSizes = mode === "compact" ? "(max-width: 768px) 100vw, 42vw" : "(max-width: 980px) 100vw, 60vw";

  return (
    <div className={`${styles.visualFrame} ${mode === "compact" ? styles.compact : styles.large}`} style={projectAccentStyle(project)}>
      {image ? (
        <Image
          alt={visuals?.alt[locale] ?? project.title[locale]}
          fill
          priority={mode === "large" && index === 0}
          sizes={imageSizes}
          src={cloudinaryOptimizedImageUrl(image, imageWidth)}
        />
      ) : null}
      <div aria-hidden="true" className={styles.blueprint}>
        <span className={styles.blueprintPanel} />
        <span className={styles.blueprintPanelAlt} />
        <span className={styles.blueprintLine} />
        <span className={styles.blueprintLineAlt} />
        <span className={styles.blueprintSignal} />
        <span className={styles.blueprintOrbit} />
      </div>
      <div aria-hidden="true" className={styles.frameChrome} />
      <p className={styles.framePending}>{label}</p>
      <div className={styles.frameContent}>
        <span className={styles.statusPill}>{project.status[locale]}</span>
        <h2 className={styles.frameTitle}>{project.title[locale]}</h2>
        <p className={styles.frameHint}>{visuals?.mockupHint[locale] ?? project.subtitle[locale]}</p>
        {typeof index === "number" ? <span className={styles.sceneNumber}>{String(index + 1).padStart(2, "0")}</span> : null}
      </div>
    </div>
  );
}
