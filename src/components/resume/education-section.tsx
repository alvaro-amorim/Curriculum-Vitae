"use client";

import { certificationGroup, education } from "@/content/education";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function EducationSection() {
  const { locale, t } = usePortfolioUi();

  return (
    <Card>
      <h2 className="text-lg font-semibold">{t.resume.education} & {t.resume.certifications}</h2>
      <div className="mt-4 grid gap-4">
        {education.map((item) => (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4" key={item.title.pt}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.title[locale]}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.institution[locale]}</p>
              </div>
              <Badge>{item.period}</Badge>
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{certificationGroup.title[locale]}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{certificationGroup.meta[locale]}</p>
            </div>
            <Badge>{certificationGroup.badge[locale]}</Badge>
          </div>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted)]">
            {certificationGroup.items.map((item) => (
              <li key={item.pt}>{item[locale]}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
