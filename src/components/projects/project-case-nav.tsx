"use client";

import { useEffect, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import type { LocalizedText } from "@/types/portfolio";

import styles from "./project-experience.module.css";

export type ProjectCaseNavLink = {
  id: string;
  label: LocalizedText;
};

export function ProjectCaseNav({ links }: { links: ProjectCaseNavLink[] }) {
  const { locale } = usePortfolioUi();
  const [activeId, setActiveId] = useState(links[0]?.id ?? "");

  useEffect(() => {
    if (!links.length || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top))[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.08, 0.2, 0.4],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [links]);

  return (
    <nav className={styles.caseInternalNav} aria-label={locale === "pt" ? "Navegação interna do case" : "Case section navigation"}>
      {links.map((link) => (
        <a
          aria-current={activeId === link.id ? "true" : undefined}
          className={activeId === link.id ? styles.caseInternalNavActive : undefined}
          href={`#${link.id}`}
          key={link.id}
        >
          {link.label[locale]}
        </a>
      ))}
    </nav>
  );
}
