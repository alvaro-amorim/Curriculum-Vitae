"use client";

import Link from "next/link";

import { usePortfolioUi } from "@/components/layout/app-shell";
import styles from "@/components/recruiter/recruiter-journey.module.css";

export default function NotFound() {
  const { locale } = usePortfolioUi();
  const copy = locale === "pt"
    ? {
        eyebrow: "404 / ROTA NÃO ENCONTRADA",
        title: "Esta página não está disponível.",
        text: "O endereço pode ter mudado ou o projeto pode não estar publicado. Você pode voltar para os cases ou para a Home.",
        projects: "Ver projetos",
        home: "Voltar para Home",
        resume: "Abrir currículo",
      }
    : {
        eyebrow: "404 / ROUTE NOT FOUND",
        title: "This page is not available.",
        text: "The address may have changed or the project may not be published. You can return to the cases or the Home page.",
        projects: "View projects",
        home: "Back to Home",
        resume: "Open resume",
      };

  return (
    <main className={styles.caseRecruiterWrap} style={{ paddingTop: "clamp(8rem, 16vh, 12rem)" }}>
      <section className={styles.emptyState}>
        <small>{copy.eyebrow}</small>
        <h1>{copy.title}</h1>
        <p>{copy.text}</p>
        <nav className={styles.actions} aria-label={locale === "pt" ? "Navegação de recuperação" : "Recovery navigation"}>
          <Link className={styles.primaryAction} href="/projetos">{copy.projects}</Link>
          <Link className={styles.secondaryAction} href="/curriculo">{copy.resume}</Link>
          <Link className={styles.secondaryAction} href="/">{copy.home}</Link>
        </nav>
      </section>
    </main>
  );
}
