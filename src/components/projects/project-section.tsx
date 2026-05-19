import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type ProjectSectionProps = {
  title: string;
  children: ReactNode;
};

export function ProjectSection({ title, children }: ProjectSectionProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-[var(--muted)]">{children}</div>
    </Card>
  );
}
