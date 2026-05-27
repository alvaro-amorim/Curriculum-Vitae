"use client";

import { certificationGroup, education } from "@/content/education";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import styles from "./resume.module.css";

export function EducationSection() {
  const { locale, t } = usePortfolioUi();

  return (
    <Card className={styles.resumeCard}>
      <h2 className={styles.sectionTitle}>{t.resume.education} & {t.resume.certifications}</h2>
      <div className={styles.itemGrid}>
        {education.map((item) => (
          <div className={styles.resumeItem} key={item.title.pt}>
            <div className={styles.itemHeader}>
              <div>
                <h3 className={styles.itemTitle}>{item.title[locale]}</h3>
                <p className={styles.itemMeta}>{item.institution[locale]}</p>
              </div>
              <Badge>{item.period}</Badge>
            </div>
          </div>
        ))}

        <div className={styles.resumeItem}>
          <div className={styles.itemHeader}>
            <div>
              <h3 className={styles.itemTitle}>{certificationGroup.title[locale]}</h3>
              <p className={styles.itemMeta}>{certificationGroup.meta[locale]}</p>
            </div>
            <Badge>{certificationGroup.badge[locale]}</Badge>
          </div>
          <ul className={styles.certificationList}>
            {certificationGroup.items.map((item) => (
              <li key={item.pt}>{item[locale]}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
