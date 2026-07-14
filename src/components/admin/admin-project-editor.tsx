"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";

import {
  assertPublishedProjectMediaAlt,
  buildProjectVisualsFromMediaAssets,
} from "@/lib/media/project-media-visuals";
import {
  mapCloudinaryUploadResultToRegistrationPayload,
  type ProjectMediaRegisterPayload,
} from "@/lib/media/media-rules";
import type { AdminProjectMediaAsset } from "@/lib/media/repository";
import type { ProjectRevision } from "@/lib/projects/repository";
import type { Project } from "@/types/portfolio";

import styles from "./admin-projects.module.css";

type EditorProps = {
  initialProject?: Project;
  initialPublicationStatus?: "draft" | "published" | "archived";
  initialSortOrder?: number;
  mediaAssets?: AdminProjectMediaAsset[];
  mode: "create" | "edit";
  revisions?: ProjectRevision[];
};

type ApiResponse = {
  data?: {
    project?: {
      project: Project;
    };
  };
  error?: {
    message?: string;
  };
  ok: boolean;
};

type MediaUploadState = {
  error?: string;
  fileName: string;
  id: string;
  progress: number;
  status: "uploading" | "success" | "error" | "cancelled";
};

type UploadSignatureResponse = {
  data?: {
    upload?: {
      apiKey: string;
      params: {
        overwrite: "false";
        public_id: string;
        signature: string;
        timestamp: number;
      };
      resourceType: "image";
      uploadUrl: string;
    };
  };
  error?: {
    message?: string;
  };
  ok: boolean;
};

type RegisterMediaResponse = {
  data?: {
    asset?: AdminProjectMediaAsset;
  };
  error?: {
    message?: string;
  };
  ok: boolean;
};

const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maxImageBytes = 10 * 1024 * 1024;

const emptyProject: Project = {
  category: ["SaaS"],
  featured: false,
  fullDescription: { en: "Project full description.", pt: "Descrição completa do projeto." },
  highlights: { en: ["Main highlight"], pt: ["Destaque principal"] },
  links: { website: "https://example.com" },
  problem: { en: "Problem solved by the project.", pt: "Problema resolvido pelo projeto." },
  shortDescription: { en: "Short project description.", pt: "Descrição curta do projeto." },
  slug: "novo-projeto",
  solution: { en: "Solution developed for the project.", pt: "Solução desenvolvida para o projeto." },
  stack: ["Next.js", "TypeScript"],
  status: { en: "In development", pt: "Em desenvolvimento" },
  subtitle: { en: "Project subtitle", pt: "Subtítulo do projeto" },
  technicalChallenges: { en: ["Main technical challenge"], pt: ["Desafio técnico principal"] },
  title: { en: "New Project", pt: "Novo Projeto" },
  whatItShows: { en: "What this project demonstrates.", pt: "O que este projeto demonstra." },
};

function listToText(values: string[]) {
  return values.join("\n");
}

function textToList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function commaList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringValue(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

function mediaByteLabel(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function mediaDimensionsLabel(asset: AdminProjectMediaAsset) {
  return `${asset.width}x${asset.height}`;
}

function mediaRoleLabel(role: AdminProjectMediaAsset["role"]) {
  const labels: Record<AdminProjectMediaAsset["role"], string> = {
    logo: "Logo",
    gallery: "Galeria",
    hero: "Hero",
    thumbnail: "Capa",
    unassigned: "Sem função",
  };

  return labels[role];
}

function mediaUploadAccept() {
  return [...allowedImageMimeTypes].join(",");
}

function validateClientMediaFile(file: File) {
  if (!allowedImageMimeTypes.has(file.type)) {
    throw new Error("Tipo de imagem não permitido.");
  }

  if (file.size > maxImageBytes) {
    throw new Error("Imagem acima de 10 MB.");
  }
}

function hiddenMediaSelection(asset: AdminProjectMediaAsset) {
  return {
    alt: asset.alt,
    id: asset.id,
    position: asset.position,
    role: asset.role,
  };
}

export function AdminProjectEditor({
  initialProject = emptyProject,
  initialPublicationStatus = "draft",
  initialSortOrder = 0,
  mediaAssets: initialMediaAssets = [],
  mode,
  revisions = [],
}: EditorProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success">("success");
  const [mediaAssets, setMediaAssets] = useState<AdminProjectMediaAsset[]>(initialMediaAssets);
  const [uploadStates, setUploadStates] = useState<MediaUploadState[]>([]);
  const uploadRequests = useRef(new Map<string, XMLHttpRequest>());
  const uploadSequence = useRef(0);
  const galleryAssets = useMemo(
    () => mediaAssets
      .filter((asset) => asset.role === "gallery" && asset.resourceType === "image")
      .sort((left, right) => left.position - right.position),
    [mediaAssets],
  );
  const thumbnailAsset = mediaAssets.find((asset) => asset.role === "thumbnail" && asset.resourceType === "image");
  const heroAsset = mediaAssets.find((asset) => asset.role === "hero" && asset.resourceType === "image");
  const logoAsset = mediaAssets.find((asset) => asset.role === "logo" && asset.resourceType === "image");
  const canManageMedia = mode === "edit";

  function updateUploadState(id: string, patch: Partial<MediaUploadState>) {
    setUploadStates((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function updateAsset(id: string, patch: Partial<AdminProjectMediaAsset>) {
    setMediaAssets((current) => current.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)));
  }

  function assignAssetRole(id: string, role: AdminProjectMediaAsset["role"]) {
    setMediaAssets((current) => current.map((asset) => {
      if (asset.id !== id && (role === "logo" || role === "thumbnail" || role === "hero") && asset.role === role) {
        return { ...asset, role: "unassigned" };
      }

      if (asset.id === id) {
        return {
          ...asset,
          position: role === "gallery" ? (asset.role === "gallery" ? asset.position : galleryAssets.length) : 0,
          role,
        };
      }

      return asset;
    }));
  }

  function moveGalleryAsset(id: string, direction: -1 | 1) {
    const ordered = galleryAssets.map((asset) => asset.id);
    const index = ordered.indexOf(id);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) {
      return;
    }

    [ordered[index], ordered[nextIndex]] = [ordered[nextIndex], ordered[index]];
    const positions = new Map(ordered.map((assetId, position) => [assetId, position]));
    setMediaAssets((current) => current.map((asset) => positions.has(asset.id)
      ? { ...asset, position: positions.get(asset.id) ?? asset.position }
      : asset));
  }

  function cancelUpload(id: string) {
    uploadRequests.current.get(id)?.abort();
    uploadRequests.current.delete(id);
    updateUploadState(id, {
      error: "Upload cancelado.",
      progress: 0,
      status: "cancelled",
    });
  }

  async function rollbackCloudinaryUpload(payload: ProjectMediaRegisterPayload) {
    const response = await fetch("/api/admin/media/rollback", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    return response.ok;
  }

  async function registerCloudinaryUpload(payload: ProjectMediaRegisterPayload) {
    const response = await fetch("/api/admin/media/register", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const body = (await response.json()) as RegisterMediaResponse;

    if (!response.ok || !body.ok || !body.data?.asset) {
      throw new Error(body.error?.message || "Não foi possível registrar a imagem.");
    }

    return body.data.asset;
  }

  async function uploadFile(file: File) {
    if (!canManageMedia) {
      setTone("error");
      setMessage("Salve o projeto antes de enviar imagens.");
      return;
    }

    validateClientMediaFile(file);
    uploadSequence.current += 1;
    const uploadId = `${file.name}-${uploadSequence.current}`;
    setUploadStates((current) => [...current, {
      fileName: file.name,
      id: uploadId,
      progress: 0,
      status: "uploading",
    }]);

    try {
      const signatureResponse = await fetch("/api/admin/media/signature", {
        body: JSON.stringify({
          bytes: file.size,
          fileName: file.name,
          mimeType: file.type,
          projectSlug: initialProject.slug,
          resourceType: "image",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const signatureBody = (await signatureResponse.json()) as UploadSignatureResponse;

      if (!signatureResponse.ok || !signatureBody.ok || !signatureBody.data?.upload) {
        throw new Error(signatureBody.error?.message || "Não foi possível assinar o upload.");
      }

      const upload = signatureBody.data.upload;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", upload.apiKey);
      formData.append("timestamp", String(upload.params.timestamp));
      formData.append("signature", upload.params.signature);
      formData.append("public_id", upload.params.public_id);
      formData.append("overwrite", upload.params.overwrite);

      const uploadResult = await new Promise<unknown>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        uploadRequests.current.set(uploadId, xhr);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            updateUploadState(uploadId, {
              progress: Math.round((event.loaded / event.total) * 100),
            });
          }
        };
        xhr.onload = () => {
          uploadRequests.current.delete(uploadId);

          try {
            const payload = JSON.parse(xhr.responseText) as unknown;

            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(payload);
              return;
            }

            reject(new Error("Cloudinary recusou o upload."));
          } catch {
            reject(new Error("Resposta inválida do Cloudinary."));
          }
        };
        xhr.onerror = () => {
          uploadRequests.current.delete(uploadId);
          reject(new Error("Falha de rede durante o upload."));
        };
        xhr.onabort = () => {
          uploadRequests.current.delete(uploadId);
          reject(new Error("Upload cancelado."));
        };
        xhr.open("POST", upload.uploadUrl);
        xhr.send(formData);
      });
      let registrationPayload: ProjectMediaRegisterPayload;

      try {
        registrationPayload = mapCloudinaryUploadResultToRegistrationPayload(initialProject.slug, uploadResult);
      } catch {
        throw new Error("Não foi possível registrar a imagem. A resposta do provedor foi recusada com segurança.");
      }

      let asset: AdminProjectMediaAsset;

      try {
        asset = await registerCloudinaryUpload(registrationPayload);
      } catch (error) {
        const rolledBack = await rollbackCloudinaryUpload(registrationPayload).catch(() => false);
        throw new Error(
          rolledBack
            ? "Não foi possível registrar a imagem. O envio foi revertido com segurança."
            : "Não foi possível registrar a imagem. Verifique a biblioteca Cloudinary antes de reenviar.",
          {
            cause: error,
          },
        );
      }

      setMediaAssets((current) => [...current, asset]);
      updateUploadState(uploadId, {
        progress: 100,
        status: "success",
      });
    } catch (error) {
      updateUploadState(uploadId, {
        error: error instanceof Error ? error.message : "Não foi possível enviar a imagem.",
        status: "error",
      });
    }
  }

  async function handleFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  }

  async function deleteAsset(asset: AdminProjectMediaAsset) {
    const confirmed = window.confirm("Excluir esta imagem? Referências no projeto serão removidas.");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, {
        method: "DELETE",
      });
      const body = (await response.json()) as ApiResponse;

      if (!response.ok || !body.ok) {
        throw new Error(body.error?.message || "Não foi possível excluir a imagem.");
      }

      setMediaAssets((current) => current.filter((item) => item.id !== asset.id));
      setTone("success");
      setMessage("Imagem excluída com segurança.");
      router.refresh();
    } catch (error) {
      setTone("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível excluir a imagem.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const slug = stringValue(form, "slug");
    const repository = stringValue(form, "repository");
    const publicationStatus = stringValue(form, "publicationStatus");
    const project: Project = {
      category: commaList(form.get("category")),
      featured: form.get("featured") === "on",
      fullDescription: {
        en: stringValue(form, "fullDescriptionEn"),
        pt: stringValue(form, "fullDescriptionPt"),
      },
      highlights: {
        en: textToList(form.get("highlightsEn")),
        pt: textToList(form.get("highlightsPt")),
      },
      links: {
        ...(repository ? { repository } : {}),
        website: stringValue(form, "website"),
      },
      problem: {
        en: stringValue(form, "problemEn"),
        pt: stringValue(form, "problemPt"),
      },
      shortDescription: {
        en: stringValue(form, "shortDescriptionEn"),
        pt: stringValue(form, "shortDescriptionPt"),
      },
      slug,
      solution: {
        en: stringValue(form, "solutionEn"),
        pt: stringValue(form, "solutionPt"),
      },
      stack: commaList(form.get("stack")),
      status: {
        en: stringValue(form, "statusEn"),
        pt: stringValue(form, "statusPt"),
      },
      subtitle: {
        en: stringValue(form, "subtitleEn"),
        pt: stringValue(form, "subtitlePt"),
      },
      technicalChallenges: {
        en: textToList(form.get("technicalChallengesEn")),
        pt: textToList(form.get("technicalChallengesPt")),
      },
      title: {
        en: stringValue(form, "titleEn"),
        pt: stringValue(form, "titlePt"),
      },
      whatItShows: {
        en: stringValue(form, "whatItShowsEn"),
        pt: stringValue(form, "whatItShowsPt"),
      },
    };
    project.visuals = buildProjectVisualsFromMediaAssets(project, mediaAssets);

    try {
      assertPublishedProjectMediaAlt(publicationStatus, mediaAssets);
    } catch (error) {
      setTone("error");
      setMessage(error instanceof Error ? error.message : "Revise os dados das imagens.");
      return;
    }

    const payload = {
      mediaAssets: mediaAssets.map(hiddenMediaSelection),
      project,
      publicationStatus,
      sortOrder: Number(stringValue(form, "sortOrder")),
    };
    const endpoint = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${initialProject.slug}`;

    setPending(true);
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: mode === "create" ? "POST" : "PUT",
      });
      const body = (await response.json()) as ApiResponse;

      if (!response.ok || !body.ok) {
        setTone("error");
        setMessage(body.error?.message || "Não foi possível salvar o projeto.");
        return;
      }

      setTone("success");
      setMessage("Projeto salvo no MongoDB com sucesso.");

      if (mode === "create") {
        router.replace(`/admin/projects/${slug}`);
      }

      router.refresh();
    } catch {
      setTone("error");
      setMessage("Não foi possível conectar ao endpoint administrativo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      {message ? <div className={styles.notice} data-tone={tone} aria-live="polite">{message}</div> : null}

      <section className={styles.editorSection}>
        <h2>Publicação e identificação</h2>
        <p>O slug fica bloqueado depois da criação para preservar URLs e histórico.</p>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            Slug
            <input defaultValue={initialProject.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" readOnly={mode === "edit"} required />
          </label>
          <label className={styles.field}>
            Status de publicação
            <select defaultValue={initialPublicationStatus} name="publicationStatus">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className={styles.field}>
            Ordem
            <input defaultValue={initialSortOrder} min="0" name="sortOrder" required type="number" />
          </label>
          <label className={styles.checkboxField}>
            <input defaultChecked={initialProject.featured} name="featured" type="checkbox" />
            Projeto em destaque
          </label>
          <label className={styles.fullField}>
            Categorias separadas por vírgula
            <input defaultValue={initialProject.category.join(", ")} name="category" required />
          </label>
          <label className={styles.fullField}>
            Stack separada por vírgula
            <input defaultValue={initialProject.stack.join(", ")} name="stack" required />
          </label>
          <label className={styles.field}>
            Website
            <input defaultValue={initialProject.links.website} name="website" required type="url" />
          </label>
          <label className={styles.field}>
            Repositório opcional
            <input defaultValue={initialProject.links.repository ?? ""} name="repository" type="url" />
          </label>
        </div>
      </section>

      <section className={styles.editorSection}>
        <h2>Identidade bilíngue</h2>
        <p>Títulos, subtítulos e descrições usadas no índice e na metadata.</p>
        <div className={styles.localizedGrid}>
          <label className={styles.field}>Título PT<input defaultValue={initialProject.title.pt} name="titlePt" required /></label>
          <label className={styles.field}>Title EN<input defaultValue={initialProject.title.en} name="titleEn" required /></label>
          <label className={styles.field}>Subtítulo PT<input defaultValue={initialProject.subtitle.pt} name="subtitlePt" required /></label>
          <label className={styles.field}>Subtitle EN<input defaultValue={initialProject.subtitle.en} name="subtitleEn" required /></label>
          <label className={styles.field}>Status PT<input defaultValue={initialProject.status.pt} name="statusPt" required /></label>
          <label className={styles.field}>Status EN<input defaultValue={initialProject.status.en} name="statusEn" required /></label>
          <label className={styles.field}>Descrição curta PT<textarea defaultValue={initialProject.shortDescription.pt} name="shortDescriptionPt" required /></label>
          <label className={styles.field}>Short description EN<textarea defaultValue={initialProject.shortDescription.en} name="shortDescriptionEn" required /></label>
          <label className={styles.field}>Descrição completa PT<textarea defaultValue={initialProject.fullDescription.pt} name="fullDescriptionPt" required /></label>
          <label className={styles.field}>Full description EN<textarea defaultValue={initialProject.fullDescription.en} name="fullDescriptionEn" required /></label>
        </div>
      </section>

      <section className={styles.editorSection}>
        <h2>Case study</h2>
        <p>Contexto, solução e evidências apresentadas na página do projeto.</p>
        <div className={styles.localizedGrid}>
          <label className={styles.field}>Problema PT<textarea defaultValue={initialProject.problem.pt} name="problemPt" required /></label>
          <label className={styles.field}>Problem EN<textarea defaultValue={initialProject.problem.en} name="problemEn" required /></label>
          <label className={styles.field}>Solução PT<textarea defaultValue={initialProject.solution.pt} name="solutionPt" required /></label>
          <label className={styles.field}>Solution EN<textarea defaultValue={initialProject.solution.en} name="solutionEn" required /></label>
          <label className={styles.field}>O que demonstra PT<textarea defaultValue={initialProject.whatItShows.pt} name="whatItShowsPt" required /></label>
          <label className={styles.field}>What it shows EN<textarea defaultValue={initialProject.whatItShows.en} name="whatItShowsEn" required /></label>
          <label className={styles.field}>Destaques PT · um por linha<textarea defaultValue={listToText(initialProject.highlights.pt)} name="highlightsPt" required /></label>
          <label className={styles.field}>Highlights EN · one per line<textarea defaultValue={listToText(initialProject.highlights.en)} name="highlightsEn" required /></label>
          <label className={styles.field}>Desafios técnicos PT · um por linha<textarea defaultValue={listToText(initialProject.technicalChallenges.pt)} name="technicalChallengesPt" required /></label>
          <label className={styles.field}>Technical challenges EN · one per line<textarea defaultValue={listToText(initialProject.technicalChallenges.en)} name="technicalChallengesEn" required /></label>
        </div>
      </section>

      <section className={styles.editorSection}>
        <h2>Mídias do projeto</h2>
        <p>Uploads vão direto ao Cloudinary e só os metadados ficam vinculados ao projeto no MongoDB.</p>

        {!canManageMedia ? (
          <div className={styles.notice} data-tone="error">
            Salve o projeto antes de enviar imagens.
          </div>
        ) : null}

        <div
          className={styles.mediaDropzone}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            void handleFiles(event.dataTransfer.files);
          }}
        >
          <div>
            <strong>Arraste imagens</strong>
            <span>JPEG, PNG, WebP ou AVIF até 10 MB.</span>
          </div>
          <label className={styles.secondaryButton}>
            Selecionar arquivos
            <input
              accept={mediaUploadAccept()}
              disabled={!canManageMedia}
              multiple
              onChange={(event) => {
                if (event.target.files) {
                  void handleFiles(event.target.files);
                }

                event.currentTarget.value = "";
              }}
              type="file"
            />
          </label>
        </div>

        {uploadStates.length > 0 ? (
          <div className={styles.uploadList} aria-live="polite">
            {uploadStates.map((upload) => (
              <div className={styles.uploadRow} key={upload.id} data-status={upload.status}>
                <div>
                  <strong>{upload.fileName}</strong>
                  <span>{upload.error ?? `${upload.progress}%`}</span>
                </div>
                <progress max={100} value={upload.progress} />
                {upload.status === "uploading" ? (
                  <button className={styles.secondaryButton} onClick={() => cancelUpload(upload.id)} type="button">
                    Cancelar
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className={styles.mediaRoleGrid}>
          <article className={styles.rolePanel}>
            <div>
              <h3>Logo do projeto</h3>
              <p>Use PNG/WebP com fundo transparente.</p>
            </div>
            <div className={styles.logoPreview}>
              {logoAsset ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={logoAsset.alt.pt || initialProject.title.pt} src={logoAsset.secureUrl} />
              ) : <span>Logo pendente</span>}
            </div>
            {logoAsset ? (
              <button className={styles.secondaryButton} onClick={() => assignAssetRole(logoAsset.id, "unassigned")} type="button">
                Remover logo
              </button>
            ) : null}
          </article>

          <article className={styles.rolePanel}>
            <div>
              <h3>Capa do card</h3>
              <p>Imagem da listagem pública, separada da logo.</p>
            </div>
            <div className={styles.cardPreview}>
              {thumbnailAsset ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={thumbnailAsset.alt.pt || initialProject.title.pt} src={thumbnailAsset.secureUrl} />
              ) : <span>Capa pendente</span>}
            </div>
          </article>

          <article className={styles.rolePanel}>
            <div>
              <h3>Hero do case</h3>
              <p>Imagem widescreen do estudo de caso.</p>
            </div>
            <div className={styles.heroPreview}>
              {heroAsset ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={heroAsset.alt.pt || initialProject.title.pt} src={heroAsset.secureUrl} />
              ) : <span>Hero pendente</span>}
            </div>
          </article>

          <article className={styles.rolePanel}>
            <div>
              <h3>Galeria</h3>
              <p>{galleryAssets.length} imagem(ns) ordenada(s).</p>
            </div>
            <div className={styles.galleryPreviewStrip}>
              {galleryAssets.slice(0, 4).map((asset) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" key={asset.id} src={asset.secureUrl} />
              ))}
              {galleryAssets.length === 0 ? <span>Galeria pendente</span> : null}
            </div>
          </article>
        </div>

        <div className={styles.mediaLayout}>
          <div className={styles.mediaLibrary}>
            <h3>Biblioteca do projeto</h3>
            {mediaAssets.length === 0 ? (
              <p className={styles.mediaEmpty}>Nenhuma imagem cadastrada neste projeto.</p>
            ) : (
              <div className={styles.mediaAssetList}>
                {mediaAssets.map((asset) => (
                  <article className={styles.mediaAsset} key={asset.id}>
                    <div className={styles.mediaThumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" src={asset.secureUrl} />
                    </div>
                    <div className={styles.mediaAssetBody}>
                      <div className={styles.mediaAssetHeader}>
                        <strong>{mediaRoleLabel(asset.role)}</strong>
                        <span>{asset.format.toUpperCase()} · {mediaDimensionsLabel(asset)} · {mediaByteLabel(asset.bytes)}</span>
                      </div>
                      <label className={styles.field}>
                        Função
                        <select
                          value={asset.role}
                          onChange={(event) => assignAssetRole(asset.id, event.currentTarget.value as AdminProjectMediaAsset["role"])}
                        >
                          <option value="unassigned">Sem função</option>
                          <option value="logo">Logo do projeto</option>
                          <option value="thumbnail">Capa do card</option>
                          <option value="hero">Hero do case</option>
                          <option value="gallery">Galeria</option>
                        </select>
                      </label>
                      <div className={styles.mediaAltGrid}>
                        <label className={styles.field}>
                          Alt PT
                          <input
                            value={asset.alt.pt}
                            onChange={(event) => updateAsset(asset.id, {
                              alt: {
                                ...asset.alt,
                                pt: event.currentTarget.value,
                              },
                            })}
                          />
                        </label>
                        <label className={styles.field}>
                          Alt EN
                          <input
                            value={asset.alt.en}
                            onChange={(event) => updateAsset(asset.id, {
                              alt: {
                                ...asset.alt,
                                en: event.currentTarget.value,
                              },
                            })}
                          />
                        </label>
                      </div>
                      <div className={styles.mediaActions}>
                        <button className={styles.secondaryButton} disabled={asset.role === "logo"} onClick={() => assignAssetRole(asset.id, "logo")} type="button">
                          Selecionar como logo
                        </button>
                        <button className={styles.secondaryButton} disabled={asset.role === "thumbnail"} onClick={() => assignAssetRole(asset.id, "thumbnail")} type="button">
                          Capa
                        </button>
                        <button className={styles.secondaryButton} disabled={asset.role === "hero"} onClick={() => assignAssetRole(asset.id, "hero")} type="button">
                          Hero
                        </button>
                        <button className={styles.secondaryButton} disabled={asset.role === "gallery"} onClick={() => assignAssetRole(asset.id, "gallery")} type="button">
                          Galeria
                        </button>
                        <button
                          className={styles.secondaryButton}
                          onClick={() => void navigator.clipboard?.writeText(asset.secureUrl)}
                          type="button"
                        >
                          Copiar URL
                        </button>
                        <button className={styles.dangerButton} onClick={() => void deleteAsset(asset)} type="button">
                          Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className={styles.mediaPreview}>
            <h3>Preview administrativo</h3>
            <div className={styles.homeCardPreview}>
              <div className={styles.homeCardLogoTile}>
                {logoAsset ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={logoAsset.alt.pt || initialProject.title.pt} src={logoAsset.secureUrl} />
                ) : <span>{initialProject.title.pt.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div>
                <strong>{initialProject.title.pt}</strong>
                <span>{initialProject.subtitle.pt}</span>
              </div>
              <small>{initialProject.stack.slice(0, 4).join(" · ")}</small>
            </div>
          </aside>
        </div>

        {galleryAssets.length > 0 ? (
          <div className={styles.galleryManager}>
            <h3>Galeria</h3>
            {galleryAssets.map((asset, index) => (
              <div className={styles.galleryManagerRow} key={asset.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{asset.format.toUpperCase()} · {asset.alt.pt || "Alt PT pendente"}</strong>
                <div className={styles.rowActions}>
                  <button className={styles.secondaryButton} disabled={index === 0} onClick={() => moveGalleryAsset(asset.id, -1)} type="button">
                    Subir
                  </button>
                  <button
                    className={styles.secondaryButton}
                    disabled={index === galleryAssets.length - 1}
                    onClick={() => moveGalleryAsset(asset.id, 1)}
                    type="button"
                  >
                    Descer
                  </button>
                  <button className={styles.secondaryButton} onClick={() => assignAssetRole(asset.id, "unassigned")} type="button">
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {revisions.length > 0 ? (
        <section className={styles.editorSection}>
          <h2>Histórico recente</h2>
          <p>As versões são registradas automaticamente antes de cada alteração.</p>
          <ol className={styles.revisionList}>
            {revisions.map((revision) => (
              <li key={revision.id}>
                <strong>{revision.action}</strong>
                <span>{revision.changedBy ?? "Admin"}</span>
                <time dateTime={revision.changedAt}>{new Date(revision.changedAt).toLocaleString("pt-BR")}</time>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className={styles.formActions}>
        <Link className={styles.secondaryButton} href="/admin/projects">Cancelar</Link>
        <button className={styles.primaryButton} disabled={pending} type="submit">
          {pending ? "Salvando..." : mode === "create" ? "Criar projeto" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
