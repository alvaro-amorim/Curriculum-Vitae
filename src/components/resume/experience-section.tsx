"use client";

import { experiences } from "@/content/experience";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ExperienceSection() {
  const { locale, t } = usePortfolioUi();

  return (
    <Card>
      <h2 className="text-lg font-semibold">{t.resume.experience}</h2>
      <div className="mt-4 grid gap-4">
        {experiences.map((experience) => (
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4" key={`${experience.title.pt}-${experience.period.pt}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{experience.title[locale]}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{experience.organization ?? experience.period[locale]}</p>
              </div>
              <Badge>{experience.badge[locale]}</Badge>
            </div>
            {experience.items ? (
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted)]">
                {experience.items[locale].map((item) => (
                  <li className="pl-4 before:-ml-4 before:mr-2 before:text-[var(--accent)] before:content-['•']" key={item}>
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
