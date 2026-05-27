"use client";

import { resumeSummary } from "@/content/resume";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

import styles from "./resume.module.css";

export function ResumeSummary() {
  const { locale, t } = usePortfolioUi();

  return (
    <Card className={styles.resumeCard}>
      <h2 className={styles.sectionTitle}>{t.resume.about}</h2>
      <ul className={styles.summaryList}>
        {resumeSummary[locale].map((item) => (
          <li key={item}>
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
