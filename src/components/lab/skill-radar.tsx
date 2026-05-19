"use client";

import { useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { skillDomainLabels, skillDomains, skillLevelLabels, skillLevels, skills } from "@/content/skills";
import { cn } from "@/lib/cn";
import type { Skill, SkillDomain, SkillLevel } from "@/types/portfolio";

type DomainFilter = SkillDomain | "all";

const levelIntensity: Record<SkillLevel, string> = {
  practical: "82%",
  project: "66%",
  learning: "48%",
  foundation: "34%",
};

function getSkillDomain(skill: Skill): SkillDomain {
  if (skill.domain) {
    return skill.domain;
  }

  if (skill.category === "front" || skill.category === "back" || skill.category === "devops") {
    return skill.category;
  }

  return "product";
}

export function SkillRadar() {
  const { locale, t } = usePortfolioUi();
  const [activeDomain, setActiveDomain] = useState<DomainFilter>("front");

  const visibleSkills = useMemo(
    () => skills.filter((skill) => activeDomain === "all" || getSkillDomain(skill) === activeDomain),
    [activeDomain],
  );

  const levelSummary = useMemo(
    () =>
      skillLevels.map((level) => ({
        level,
        count: skills.filter((skill) => skill.level === level).length,
      })),
    [],
  );

  const filters: Array<{ key: DomainFilter; label: string }> = [
    { key: "all", label: t.lab.skillRadar.allDomains },
    ...skillDomains.map((domain) => ({ key: domain, label: skillDomainLabels[domain][locale] })),
  ];

  return (
    <Card className="interactive-surface">
      <div className="flex flex-col gap-5">
        <div>
          <Badge>{t.lab.skillRadar.levelSummary}</Badge>
          <h2 className="mt-3 text-lg font-semibold text-[var(--text)]">{t.lab.skillRadar.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.lab.skillRadar.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {levelSummary.map(({ count, level }) => (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3" key={level}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text)]">{skillLevelLabels[level][locale]}</span>
                <span className="text-xs text-[var(--muted)]">{count}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]" aria-hidden="true">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: levelIntensity[level] }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" aria-label={t.lab.skillRadar.filtersLabel}>
          {filters.map((filter) => (
            <Button
              className={cn(activeDomain === filter.key && "border-[var(--accent)]")}
              key={filter.key}
              onClick={() => setActiveDomain(filter.key)}
              size="sm"
              variant={activeDomain === filter.key ? "primary" : "secondary"}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-3">
          {visibleSkills.map((skill) => {
            const domain = getSkillDomain(skill);
            const level = skill.level ?? "foundation";

            return (
              <article
                className="interactive-surface rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                key={skill.name}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text)]">{skill.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{skill.evidence?.[locale]}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Badge>{skillDomainLabels[domain][locale]}</Badge>
                    <Badge>{skillLevelLabels[level][locale]}</Badge>
                  </div>
                </div>
                <div
                  aria-label={`${skill.name}: ${skillLevelLabels[level][locale]}`}
                  className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]"
                  role="img"
                >
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: levelIntensity[level] }} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
