"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

import styles from "./admin.module.css";

export function AdminShell({ children, email }: { children: ReactNode; email: string }) {
  const pathname = usePathname();
  const projectRoute = pathname.startsWith("/admin/projects");

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
            <Link data-active={pathname === "/admin"} href="/admin">Visão geral</Link>
            <Link data-active={projectRoute} href="/admin/projects">Projetos</Link>
            <span aria-disabled="true">Conteúdo · próxima etapa</span>
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.adminUser}>
              <small>Administrador</small>
              <strong>{email}</strong>
            </div>
            <AdminLogoutButton />
          </div>
        </aside>

        <section className={styles.mainContent}>{children}</section>
      </div>
    </main>
  );
}
