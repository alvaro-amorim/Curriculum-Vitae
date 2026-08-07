"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { career } from "@/content/career";
import { profile } from "@/content/profile";
import type { Locale } from "@/types/portfolio";

import styles from "./about-contact-section.module.css";

const copy = {
  pt: {
    eyebrow: "SOBRE & CONTATO",
    title: "Código, produto e intenção.",
    locationLabel: "Localização",
    focusLabel: "Foco atual",
    journeyEyebrow: "TRAJETÓRIA",
    journeyTitle: "Construindo uma base cada vez mais completa.",
    contactEyebrow: "CONTATO DIRETO",
    contactTitle: "Vamos conversar sem complicação.",
    contactText: "Escolha o canal mais conveniente. E-mail, LinkedIn, GitHub e telefone estão a um clique.",
    email: "E-mail",
    linkedin: "LinkedIn",
    github: "GitHub",
    phone: "Telefone",
    copyEmail: "Copiar e-mail",
    copied: "E-mail copiado",
    projects: "Ver projetos",
    resume: "Abrir currículo",
  },
  en: {
    eyebrow: "ABOUT & CONTACT",
    title: "Code, product, and intention.",
    locationLabel: "Location",
    focusLabel: "Current focus",
    journeyEyebrow: "JOURNEY",
    journeyTitle: "Building an increasingly complete foundation.",
    contactEyebrow: "DIRECT CONTACT",
    contactTitle: "Let’s talk without friction.",
    contactText: "Choose the most convenient channel. Email, LinkedIn, GitHub, and phone are one click away.",
    email: "Email",
    linkedin: "LinkedIn",
    github: "GitHub",
    phone: "Phone",
    copyEmail: "Copy email",
    copied: "Email copied",
    projects: "View projects",
    resume: "Open resume",
  },
} as const;

function ContactIcon({ name }: { name: "email" | "github" | "linkedin" | "phone" }) {
  const common = {
    "aria-hidden": true,
    fill: "none",
    focusable: false,
    viewBox: "0 0 24 24",
  } as const;

  if (name === "email") {
    return <svg {...common}><path d="M4 6h16v12H4V6Zm0 1 8 6 8-6" /></svg>;
  }

  if (name === "linkedin") {
    return <svg {...common}><path d="M6 9v9M6 6.2v.1M10 18v-5c0-2.2 4-2.4 4 0v5m0-6c.5-2.8 5-2.4 5 1.2V18" /></svg>;
  }

  if (name === "phone") {
    return <svg {...common}><path d="M7.2 3.8 10 8l-2.1 2.1a15 15 0 0 0 6 6L16 14l4.2 2.8-1 3c-.3.9-1.2 1.4-2.1 1.2C9.7 19.6 4.4 14.3 3 6.9c-.2-.9.3-1.8 1.2-2.1l3-1Z" /></svg>;
  }

  return <svg {...common}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.6a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.8 12.8 0 0 0-6.7 0C6.7.4 5.6.7 5.6.7a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.6c0 5.1 3.1 6.3 6.1 6.6a3 3 0 0 0-.8 1.9V22" /></svg>;
}

function displayHandle(url: string, prefix: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(prefix, "").replace(/\/$/, "");
}

export function AboutContactSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [copied, setCopied] = useState(false);
  const phoneHref = `tel:${profile.phone.replace(/\D/g, "")}`;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  }

  const contacts = [
    {
      href: `mailto:${profile.email}`,
      icon: "email" as const,
      label: t.email,
      value: profile.email,
    },
    {
      href: profile.linkedin,
      icon: "linkedin" as const,
      label: t.linkedin,
      value: displayHandle(profile.linkedin, "linkedin.com/in/"),
    },
    {
      href: profile.github,
      icon: "github" as const,
      label: t.github,
      value: displayHandle(profile.github, ""),
    },
    {
      href: phoneHref,
      icon: "phone" as const,
      label: t.phone,
      value: profile.phone,
    },
  ];

  return (
    <section id="sobre" className={styles.section} aria-labelledby="about-contact-title">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.shell}>
        <div className={styles.profileColumn}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <div className={styles.identity}>
            <div className={styles.photoFrame}>
              <Image
                alt={profile.fullName}
                className={styles.photo}
                fill
                sizes="(max-width: 720px) 150px, 190px"
                src={profile.avatar}
              />
              <span aria-hidden="true">Á</span>
            </div>
            <div>
              <span className={styles.available}><i />{career.availability[locale]}</span>
              <h2 id="about-contact-title">{t.title}</h2>
              <p>{career.aboutIntro[locale]}</p>
            </div>
          </div>

          <div className={styles.profileFacts}>
            <article>
              <span>{profile.role[locale]}</span>
              <strong>{profile.positioning[locale]}</strong>
            </article>
            <article>
              <span>{t.locationLabel}</span>
              <strong>{profile.location}, {profile.country[locale]}</strong>
            </article>
            <article>
              <span>{t.focusLabel}</span>
              <strong>{career.focus[locale]}</strong>
            </article>
          </div>

          <div className={styles.journey}>
            <span className={styles.eyebrow}>{t.journeyEyebrow}</span>
            <h3>{t.journeyTitle}</h3>
            <ol>
              {career.journey[locale].map(([year, label]) => (
                <li key={year}>
                  <strong>{year}</strong>
                  <span>{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className={styles.contactPanel} aria-labelledby="direct-contact-title">
          <span className={styles.eyebrow}>{t.contactEyebrow}</span>
          <h3 id="direct-contact-title">{t.contactTitle}</h3>
          <p>{t.contactText}</p>

          <div className={styles.contactList}>
            {contacts.map((contact) => {
              const external = contact.href.startsWith("http");
              const ariaLabel = external
                ? `${contact.label}: ${contact.value} (${locale === "pt" ? "abre em nova aba" : "opens in a new tab"})`
                : `${contact.label}: ${contact.value}`;

              return (
                <a
                  aria-label={ariaLabel}
                  href={contact.href}
                  key={contact.label}
                  rel={external ? "noopener noreferrer" : undefined}
                  target={external ? "_blank" : undefined}
                >
                  <span className={styles.contactIcon}><ContactIcon name={contact.icon} /></span>
                  <span>
                    <small>{contact.label}</small>
                    <strong>{contact.value}</strong>
                  </span>
                  <i aria-hidden="true">↗</i>
                </a>
              );
            })}
          </div>

          <button className={styles.copyButton} onClick={() => void copyEmail()} type="button">
            <ContactIcon name="email" />
            {copied ? t.copied : t.copyEmail}
          </button>

          <nav className={styles.actions} aria-label={locale === "pt" ? "Atalhos profissionais" : "Professional shortcuts"}>
            <Link href="/projetos">{t.projects}<span aria-hidden="true">→</span></Link>
            <Link href="/curriculo">{t.resume}<span aria-hidden="true">→</span></Link>
          </nav>
        </aside>
      </div>
    </section>
  );
}
