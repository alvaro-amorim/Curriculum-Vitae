import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminProjectEditor } from "@/components/admin/admin-project-editor";
import { AdminProjectHomePlacement } from "@/components/admin/admin-project-home-placement";
import styles from "@/components/admin/admin-projects.module.css";
import { getProjectMediaAssets } from "@/lib/media/repository";
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
  const [record, revisions, mediaAssets] = await Promise.all([
    getAdminProjectBySlug(slug),
    getProjectRevisions(slug),
    getProjectMediaAssets(slug),
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
          <p>Edite conteúdo, mídias, coleção, publicação e todos os locais em que o projeto aparece.</p>
        </div>
      </header>

      <AdminProjectHomePlacement
        initialCollection={record.collection}
        initialPlacement={record.homePlacement}
        publicationStatus={record.publicationStatus}
        slug={record.project.slug}
      />

      <AdminProjectEditor
        initialProject={record.project}
        initialPublicationStatus={record.publicationStatus}
        initialSortOrder={record.sortOrder}
        mediaAssets={mediaAssets}
        mode="edit"
        revisions={revisions}
      />
    </>
  );
}
