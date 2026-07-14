import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import styles from "@/components/admin/admin.module.css";
import { getCurrentAdminUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Acesso restrito ao painel administrativo do portfólio.",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

export default async function AdminLoginPage() {
  const currentUser = await getCurrentAdminUser();

  if (currentUser) {
    redirect("/admin");
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginShell} aria-labelledby="admin-login-title">
        <div className={styles.loginIntro}>
          <Link className={styles.brand} href="/" aria-label="Voltar para Álvaro.dev">
            <span className={styles.brandMark}>Á</span>
            <span className={styles.brandText}>
              <strong>Álvaro.dev</strong>
              <small>Portfolio OS</small>
            </span>
          </Link>

          <div>
            <h1>Painel de controle do portfólio.</h1>
            <p>Área privada para acompanhar conteúdo, Arcade, saúde do sistema e futuras operações editoriais.</p>
          </div>

          <div className={styles.securityNote}>
            <i />
            <span>Autenticação processada no servidor com sessão privada em cookie HttpOnly.</span>
          </div>
        </div>

        <div className={styles.loginCard}>
          <span>ACESSO RESTRITO</span>
          <h2 id="admin-login-title">Entrar</h2>
          <p>Use o e-mail e a senha do administrador configurado no banco privado do portfólio.</p>
          <Suspense fallback={<p className={styles.formMessage}>Preparando formulário...</p>}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
