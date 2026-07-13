import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminProjectEditor } from "@/components/admin/admin-project-editor";
import styles from "@/components/admin/admin-projects.module.css";
import { getAdminProjectBySlug, getProjectRevisions } from "@/lib/projects/repository";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "Editar projeto | Admin",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

export default async function EditAdminProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const [record, revisions] = await Promise.all([
    getAdminProjectBySlug(slug),
    getProjectRevisions(slug),
  ]);

  if (!record) {
    notFound();
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>ADMIN / EDITAR PROJETO</span>
          <h1>{record.project.title.pt}</h1>
          <p>Edite o conteúdo bilíngue e controle quando esta versão substitui o fallback estático público.</p>
        </div>
      </header>

      <AdminProjectEditor
        initialProject={record.project}
        initialPublicationStatus={record.publicationStatus}
        initialSortOrder={record.sortOrder}
        mode="edit"
        revisions={revisions}
      />
    </>
  );
}
