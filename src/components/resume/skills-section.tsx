"use client";

import { useMemo, useState } from "react";

import { skills } from "@/content/skills";
import { Button } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { SkillCategory } from "@/types/portfolio";

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
    <Card>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{t.resume.skills}</h2>
        <div className="flex flex-wrap gap-2" aria-label={t.resume.skills}>
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
        <div className="flex flex-wrap gap-2">
          {visibleSkills.map((skill) => (
            <span className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)]" key={skill.name}>
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
