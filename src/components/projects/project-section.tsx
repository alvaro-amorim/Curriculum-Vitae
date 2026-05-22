import type { ReactNode } from "react";

import styles from "./project-experience.module.css";

type ProjectSectionProps = {
  title: string;
  children: ReactNode;
};

export function ProjectSection({ title, children }: ProjectSectionProps) {
  return (
    <section className={styles.flowCard}>
      <h2>{title}</h2>
      <div className={styles.flowText}>{children}</div>
    </section>
  );
}
