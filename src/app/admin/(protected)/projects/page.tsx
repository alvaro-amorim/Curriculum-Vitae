import type { Metadata } from "next";

import { AdminProjectList } from "@/components/admin/admin-project-list";
import styles from "@/components/admin/admin-projects.module.css";
import { getAdminProjects } from "@/lib/projects/repository";

export const metadata: Metadata = {
  title: "Projetos | Admin",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

export default async function AdminProjectsPage() {
  let databaseReady = true;
  let projects = [] as Awaited<ReturnType<typeof getAdminProjects>>;

  try {
    projects = await getAdminProjects();
  } catch {
    databaseReady = false;
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>ADMIN / PROJETOS</span>
          <h1>Conteúdo editorial dos cases.</h1>
          <p>Importe o catálogo atual, edite versões bilíngues, controle publicação e preserve o fallback estático.</p>
        </div>
      </header>

      <AdminProjectList
        databaseReady={databaseReady}
        projects={projects.map((record) => ({
          publicationStatus: record.publicationStatus,
          slug: record.project.slug,
          sortOrder: record.sortOrder,
          subtitle: record.project.subtitle.pt,
          title: record.project.title.pt,
          updatedAt: record.updatedAt,
        }))}
      />
    </>
  );
}
