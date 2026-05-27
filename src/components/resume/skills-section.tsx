"use client";

import { useMemo, useState } from "react";

import { skills } from "@/content/skills";
import { Button } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { SkillCategory } from "@/types/portfolio";

import styles from "./resume.module.css";

type FilterKey = SkillCategory | "all";

export function SkillsSection() {
  const { t } = usePortfolioUi();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: "all", label: t.resume.all },
    { key: "front", label: t.resume.front },
    { key: "back", label: t.resume.back },
    { key: "devops", label: t.resume.devops },
    { key: "other", label: t.resume.other },
  ];

  const visibleSkills = useMemo(
    () => skills.filter((skill) => activeFilter === "all" || skill.category === activeFilter),
    [activeFilter],
  );

  return (
    <Card className={styles.resumeCard}>
      <div>
        <h2 className={styles.sectionTitle}>{t.resume.skills}</h2>
        <div className={styles.skillFilters} aria-label={t.resume.skills}>
          {filters.map((filter) => (
            <Button
              className={cn(activeFilter === filter.key && "border-[var(--accent)] text-[var(--text)]")}
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              size="sm"
              variant={activeFilter === filter.key ? "primary" : "secondary"}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <div className={styles.skillCloud}>
          {visibleSkills.map((skill) => (
            <span className={styles.skillPill} key={skill.name}>
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
