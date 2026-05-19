"use client";

import { useState } from "react";

import { profile } from "@/content/profile";
import { buttonClassName, Button } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

type ContactRowProps = {
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

function ContactRow({ label, value, href, canCopy = false }: ContactRowProps) {
  const { t } = usePortfolioUi();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyToClipboard(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <div className="min-w-0">
        <span className="block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-soft)]">{label}</span>
        {href ? (
          <a className="mt-1 block truncate text-sm text-[var(--text)] underline-offset-4 hover:underline" href={href} rel="noreferrer" target="_blank">
            {value}
          </a>
        ) : (
          <span className="mt-1 block text-sm text-[var(--text)]">{value}</span>
        )}
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
    <Card className="h-full">
      <h2 className="text-lg font-semibold">{t.resume.contact}</h2>
      <div className="mt-4 grid gap-3">
        <ContactRow label={t.resume.location} value={`${profile.location}, ${profile.country[locale]}`} />
        <ContactRow canCopy label={t.resume.phone} value={profile.phone} />
        <ContactRow canCopy label={t.resume.email} value={profile.email} />
        <div className="flex flex-wrap gap-2 pt-1">
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
