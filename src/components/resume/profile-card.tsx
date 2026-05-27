"use client";

import Image from "next/image";

import { profile } from "@/content/profile";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { DownloadButtons } from "./download-buttons";
import styles from "./resume.module.css";

export function ProfileCard() {
  const { locale, t } = usePortfolioUi();

  return (
    <Card className={`${styles.resumeCard} ${styles.profileCard}`}>
      <div>
        <div className={styles.profileHeader}>
          <div className={styles.avatarShell}>
            <Image alt={t.resume.profilePhotoAlt} fill priority sizes="96px" src={profile.avatar} />
          </div>
          <div>
            <p className={styles.eyebrow}>{profile.role[locale]}</p>
            <h1 className={styles.profileTitle}>{profile.fullName}</h1>
            <p className={styles.profileSubtitle}>
              {profile.positioning[locale]}
            </p>
          </div>
        </div>

        <div className={styles.badgeRail} aria-label={t.resume.highlights}>
          {profile.highlights.map((highlight) => (
            <Badge key={highlight}>{highlight}</Badge>
          ))}
        </div>

        <DownloadButtons />
      </div>
    </Card>
  );
}
