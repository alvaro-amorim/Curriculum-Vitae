"use client";

import { resumeSummary } from "@/content/resume";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export function ResumeSummary() {
  const { locale, t } = usePortfolioUi();

  return (
    <Card>
      <h2 className="text-lg font-semibold">{t.resume.about}</h2>
      <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
        {resumeSummary[locale].map((item) => (
          <li key={item} className="pl-4 before:-ml-4 before:mr-2 before:text-[var(--accent)] before:content-['•']">
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
