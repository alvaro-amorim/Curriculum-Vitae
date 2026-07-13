import type { Metadata } from "next";

import { AdminProjectEditor } from "@/components/admin/admin-project-editor";
import styles from "@/components/admin/admin-projects.module.css";

export const metadata: Metadata = {
  title: "Novo projeto | Admin",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

export default function NewAdminProjectPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>ADMIN / NOVO PROJETO</span>
          <h1>Criar um case editorial.</h1>
          <p>Preencha as versões PT e EN. O projeto pode permanecer em draft até estar pronto para publicação.</p>
        </div>
      </header>

      <AdminProjectEditor mode="create" />
    </>
  );
}
