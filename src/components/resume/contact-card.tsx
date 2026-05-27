"use client";

import { useState } from "react";

import { profile } from "@/content/profile";
import { buttonClassName, Button } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

import styles from "./resume.module.css";

type ContactRowProps = {
  icon: string;
  label: string;
  value: string;
  href?: string;
  canCopy?: boolean;
};

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function ContactRow({ icon, label, value, href, canCopy = false }: ContactRowProps) {
  const { t } = usePortfolioUi();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyToClipboard(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className={styles.contactRow}>
      <div className={styles.contactMain}>
        <span aria-hidden="true" className={styles.contactIcon}>
          {icon}
        </span>
        <div className="min-w-0">
          <span className={styles.contactLabel}>{label}</span>
          {href ? (
            <a className={styles.contactValue} href={href} rel="noreferrer" target="_blank">
              {value}
            </a>
          ) : (
            <span className={styles.contactValue}>{value}</span>
          )}
        </div>
      </div>
      {canCopy ? (
        <Button onClick={handleCopy} size="sm" variant="secondary">
          {copied ? t.actions.copied : t.actions.copy}
        </Button>
      ) : null}
    </div>
  );
}

export function ContactCard() {
  const { locale, t } = usePortfolioUi();

  return (
    <Card className={`${styles.resumeCard} h-full`}>
      <h2 className={styles.sectionTitle}>{t.resume.contact}</h2>
      <div className={styles.contactGrid}>
        <ContactRow icon="LOC" label={t.resume.location} value={`${profile.location}, ${profile.country[locale]}`} />
        <ContactRow canCopy icon="TEL" label={t.resume.phone} value={profile.phone} />
        <ContactRow canCopy icon="@" label={t.resume.email} value={profile.email} />
        <div className={styles.contactActions}>
          <a className={buttonClassName("secondary", "sm")} href={profile.github} rel="noreferrer" target="_blank">
            {t.actions.viewGithub}
          </a>
          <a className={buttonClassName("ghost", "sm")} href={profile.portfolio} rel="noreferrer" target="_blank">
            {t.nav.resume}
          </a>
        </div>
      </div>
    </Card>
  );
}
