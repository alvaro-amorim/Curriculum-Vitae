import type { Metadata } from "next";

import { AdminProjectList } from "@/components/admin/admin-project-list";
import styles from "@/components/admin/admin-projects.module.css";
import { getAdminProjects, importStaticProjects } from "@/lib/projects/repository";

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
    await importStaticProjects("system:catalog-sync");
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
          <p>Edite versões bilíngues, mídias, publicação e a presença de cada projeto na Home e no carrossel.</p>
        </div>
      </header>

      <AdminProjectList
        databaseReady={databaseReady}
        projects={projects.map((record) => ({
          homePlacement: record.homePlacement,
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
