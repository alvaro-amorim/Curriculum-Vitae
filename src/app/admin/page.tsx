import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import styles from "@/components/admin/admin.module.css";
import { projects } from "@/content/projects";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { getAdminDashboardMetrics } from "@/lib/admin/dashboard";

export const dynamic = "force-dynamic";

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
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  const metrics = await getAdminDashboardMetrics();

  return (
    <main className={styles.adminPage}>
      <div className={styles.adminShell}>
        <aside className={styles.sidebar}>
          <Link className={styles.brand} href="/admin" aria-label="Dashboard administrativo">
            <span className={styles.brandMark}>Á</span>
            <span className={styles.brandText}>
              <strong>Álvaro.dev</strong>
              <small>Admin OS</small>
            </span>
          </Link>

          <nav className={styles.sidebarNav} aria-label="Navegação administrativa">
            <Link data-active="true" href="/admin">Visão geral</Link>
            <span aria-disabled="true">Projetos · próxima etapa</span>
            <span aria-disabled="true">Conteúdo · próxima etapa</span>
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.adminUser}>
              <small>Administrador</small>
              <strong>{user.email}</strong>
            </div>
            <AdminLogoutButton />
          </div>
        </aside>

        <section className={styles.mainContent}>
          <header className={styles.topRow}>
            <div>
              <span className={styles.eyebrow}>ADMIN DASHBOARD</span>
              <h1>Controle central do portfólio.</h1>
              <p>Acompanhe a base atual antes de ativar edição e publicação de conteúdo.</p>
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
                  <p>Leitura do conteúdo versionado que alimenta os cases atuais.</p>
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
                    <small>Fonte versionada carregada</small>
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
                <Link className={styles.quickLink} href="/projetos">Ver projetos</Link>
                <Link className={styles.secondaryLink} href="/lab">Abrir Lab</Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
