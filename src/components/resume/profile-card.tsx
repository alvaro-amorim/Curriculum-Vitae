"use client";

import Image from "next/image";

import { profile } from "@/content/profile";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { DownloadButtons } from "./download-buttons";

export function ProfileCard() {
  const { locale, t } = usePortfolioUi();

  return (
    <Card className="h-full">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)]">
            <Image alt={t.resume.profilePhotoAlt} fill priority sizes="96px" src={profile.avatar} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-[var(--text)]">{profile.fullName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {profile.role[locale]} • {profile.positioning[locale]}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" aria-label={t.resume.highlights}>
          {profile.highlights.map((highlight) => (
            <Badge key={highlight}>{highlight}</Badge>
          ))}
        </div>

        <DownloadButtons />
      </div>
    </Card>
  );
}
