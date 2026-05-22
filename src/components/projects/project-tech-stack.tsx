"use client";

import { usePortfolioUi } from "@/components/layout/app-shell";

import { formatProjectTech } from "./project-card";
import styles from "./project-experience.module.css";

type ProjectTechStackProps = {
  stack: string[];
};

export function ProjectTechStack({ stack }: ProjectTechStackProps) {
  const { locale } = usePortfolioUi();

  return (
    <div className={styles.stackConstellation}>
      {stack.map((tech) => (
        <span className={styles.techNode} key={tech}>
          {formatProjectTech(tech, locale)}
        </span>
      ))}
    </div>
  );
}
