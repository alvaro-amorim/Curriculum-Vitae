"use client";

import { buttonClassName } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import type { Project } from "@/types/portfolio";

type ProjectLinksProps = {
  project: Project;
};

export function ProjectLinks({ project }: ProjectLinksProps) {
  const { t } = usePortfolioUi();

  return (
    <div className="flex flex-wrap gap-2">
      <a className={buttonClassName("primary", "sm")} href={project.links.website} rel="noreferrer" target="_blank">
        {t.caseStudy.visitProject}
      </a>
      {project.links.repository ? (
        <a className={buttonClassName("secondary", "sm")} href={project.links.repository} rel="noreferrer" target="_blank">
          {t.caseStudy.viewRepository}
        </a>
      ) : null}
    </div>
  );
}
