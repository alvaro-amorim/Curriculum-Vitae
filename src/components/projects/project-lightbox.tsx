"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import type { LocalizedText } from "@/types/portfolio";

import { LocalizedProjectImage } from "./localized-project-image";
import styles from "./project-experience.module.css";

export type ProjectGalleryImage = {
  alt: LocalizedText;
  source: string;
};

const lightboxCopy = {
  pt: {
    close: "Fechar visualização ampliada",
    count: "Imagem",
    next: "Próxima imagem",
    previous: "Imagem anterior",
    open: "Abrir imagem ampliada",
  },
  en: {
    close: "Close expanded view",
    count: "Image",
    next: "Next image",
    previous: "Previous image",
    open: "Open expanded image",
  },
} as const;

function focusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])",
    ),
  ).filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);
}

export function ProjectGalleryLightbox({ images }: { images: ProjectGalleryImage[] }) {
  const { locale } = usePortfolioUi();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const copy = lightboxCopy[locale];
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const activeCount = activeIndex === null ? 0 : activeIndex + 1;

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
    window.setTimeout(() => lastFocusRef.current?.focus(), 0);
  }, []);

  const openLightbox = useCallback((index: number) => {
    lastFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveIndex(index);
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current + 1) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = focusableElements(dialogRef.current);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, closeLightbox, showNext, showPrevious]);

  if (!images.length) {
    return null;
  }

  return (
    <>
      <div className={styles.caseGalleryGrid}>
        {images.map((image, index) => (
          <button
            aria-label={`${copy.open}: ${image.alt[locale]}`}
            className={index === 0 ? styles.caseGalleryFeatured : styles.caseGalleryItem}
            key={`${image.source}-${index}`}
            onClick={() => openLightbox(index)}
            type="button"
          >
            <LocalizedProjectImage
              alt={image.alt}
              fill
              loading="lazy"
              optimizedWidth={index === 0 ? 1400 : 760}
              sizes={index === 0 ? "(max-width: 980px) 100vw, 62vw" : "(max-width: 980px) 50vw, 24vw"}
              source={image.source}
            />
            <span>{image.alt[locale]}</span>
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          className={styles.caseLightboxOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeLightbox();
            }
          }}
          role="presentation"
        >
          <div
            aria-label={activeImage.alt[locale]}
            aria-modal="true"
            className={styles.caseLightboxDialog}
            ref={dialogRef}
            role="dialog"
          >
            <button className={styles.caseLightboxClose} onClick={closeLightbox} ref={closeRef} type="button">
              <span aria-hidden="true">×</span>
              <span className={styles.srOnly}>{copy.close}</span>
            </button>

            <button className={styles.caseLightboxPrevious} onClick={showPrevious} type="button">
              <span aria-hidden="true">‹</span>
              <span className={styles.srOnly}>{copy.previous}</span>
            </button>

            <figure className={styles.caseLightboxFigure}>
              <LocalizedProjectImage
                alt={activeImage.alt}
                fill
                loading="eager"
                optimizedWidth={1800}
                sizes="100vw"
                source={activeImage.source}
              />
              <figcaption>
                <span>{`${copy.count} ${activeCount}/${images.length}`}</span>
                {activeImage.alt[locale]}
              </figcaption>
            </figure>

            <button className={styles.caseLightboxNext} onClick={showNext} type="button">
              <span aria-hidden="true">›</span>
              <span className={styles.srOnly}>{copy.next}</span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
