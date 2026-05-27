"use client";

import { experiences } from "@/content/experience";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import styles from "./resume.module.css";

export function ExperienceSection() {
  const { locale, t } = usePortfolioUi();

  return (
    <Card className={styles.resumeCard}>
      <h2 className={styles.sectionTitle}>{t.resume.experience}</h2>
      <div className={styles.itemGrid}>
        {experiences.map((experience) => (
          <article className={styles.resumeItem} key={`${experience.title.pt}-${experience.period.pt}`}>
            <div className={styles.itemHeader}>
              <div>
                <h3 className={styles.itemTitle}>{experience.title[locale]}</h3>
                <p className={styles.itemMeta}>{experience.organization ?? experience.period[locale]}</p>
              </div>
              <Badge>{experience.badge[locale]}</Badge>
            </div>
            {experience.items ? (
              <ul className={styles.timelineList}>
                {experience.items[locale].map((item) => (
                  <li key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </Card>
  );
}
