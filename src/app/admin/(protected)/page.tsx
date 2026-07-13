import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/components/admin/admin.module.css";
import { projects } from "@/content/projects";
import { getAdminDashboardMetrics } from "@/lib/admin/dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Painel administrativo privado do portfólio.",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

function formatMetric(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("pt-BR").format(value);
}

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <>
      <header className={styles.topRow}>
        <div>
          <span className={styles.eyebrow}>ADMIN DASHBOARD</span>
          <h1>Controle central do portfólio.</h1>
          <p>Acompanhe a base atual e acesse as operações editoriais protegidas.</p>
        </div>
        <span className={styles.environmentBadge}>
          <i className={styles.statusDot} />
          ACESSO PROTEGIDO
        </span>
      </header>

      <div className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <span>Projetos</span>
          <strong>{formatMetric(metrics.projects)}</strong>
          <small>Catálogo versionado atual</small>
        </article>
        <article className={styles.metricCard}>
          <span>Jogos Arcade</span>
          <strong>{formatMetric(metrics.arcadeGames)}</strong>
          <small>Arenas ativas</small>
        </article>
        <article className={styles.metricCard}>
          <span>Sessões</span>
          <strong>{formatMetric(metrics.sessions)}</strong>
          <small>Jogadores anônimos persistidos</small>
        </article>
        <article className={styles.metricCard}>
          <span>Scores</span>
          <strong>{formatMetric(metrics.scores)}</strong>
          <small>Resultados registrados</small>
        </article>
      </div>

      <div className={styles.contentGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>CATÁLOGO</span>
              <h2>Projetos publicados</h2>
              <p>Resumo da fonte versionada e acesso ao editor administrativo.</p>
            </div>
          </div>

          <div className={styles.projectList}>
            {projects.slice(0, 6).map((project) => (
              <div className={styles.projectItem} key={project.slug}>
                <div>
                  <strong>{project.title.pt}</strong>
                  <small>{project.subtitle.pt}</small>
                </div>
                <span>{project.status.pt}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>SISTEMA</span>
              <h2>Estado operacional</h2>
              <p>Verificações rápidas da fundação atual.</p>
            </div>
          </div>

          <div className={styles.systemList}>
            <div className={styles.systemItem} data-ok={metrics.databaseAvailable}>
              <i />
              <div>
                <strong>Supabase</strong>
                <small>{metrics.databaseAvailable ? "Conectado" : "Indisponível ou não configurado"}</small>
              </div>
            </div>
            <div className={styles.systemItem} data-ok="true">
              <i />
              <div>
                <strong>Conteúdo</strong>
                <small>Fallback estático preservado</small>
              </div>
            </div>
            <div className={styles.systemItem} data-ok="true">
              <i />
              <div>
                <strong>Admin Auth</strong>
                <small>Usuário validado no servidor</small>
              </div>
            </div>
          </div>

          <div className={styles.quickActions}>
            <Link className={styles.quickLink} href="/admin/projects">Gerenciar projetos</Link>
            <Link className={styles.secondaryLink} href="/lab">Abrir Lab</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
