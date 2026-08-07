"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import type { ProjectCollectionId } from "@/lib/projects/project-collection";
import {
  CAROUSEL_DESCRIPTION_MAX_LENGTH,
  type ProjectHomePlacement,
} from "@/lib/projects/home-placement";
import type { LocalizedText } from "@/types/portfolio";

import styles from "./admin-projects.module.css";

type ApiResponse = {
  error?: {
    message?: string;
  };
  ok: boolean;
};

type AdminProjectHomePlacementProps = {
  fallbackDescription: LocalizedText;
  initialCollection: ProjectCollectionId;
  initialPlacement: ProjectHomePlacement;
  publicationStatus: "draft" | "published" | "archived";
  slug: string;
};

function numberValue(form: FormData, name: string) {
  return Number(String(form.get(name) ?? "0"));
}

function stringValue(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

export function AdminProjectHomePlacement({
  fallbackDescription,
  initialCollection,
  initialPlacement,
  publicationStatus,
  slug,
}: AdminProjectHomePlacementProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success">("success");
  const [carouselDescriptionPt, setCarouselDescriptionPt] = useState(
    initialPlacement.carouselDescription?.pt ?? "",
  );
  const [carouselDescriptionEn, setCarouselDescriptionEn] = useState(
    initialPlacement.carouselDescription?.en ?? "",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      carouselDescription: {
        en: stringValue(form, "carouselDescriptionEn"),
        pt: stringValue(form, "carouselDescriptionPt"),
      },
      carouselOrder: numberValue(form, "carouselOrder"),
      collection: String(form.get("collection") ?? "secondary") as ProjectCollectionId,
      homeOrder: numberValue(form, "homeOrder"),
      showInCarousel: form.get("showInCarousel") === "on",
      showInHome: form.get("showInHome") === "on",
    };

    setPending(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/projects/${slug}/home-placement`, {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      });
      const body = (await response.json()) as ApiResponse;

      if (!response.ok || !body.ok) {
        setTone("error");
        setMessage(body.error?.message || "Não foi possível salvar a apresentação pública.");
        return;
      }

      setTone("success");
      setMessage("Coleção, carrossel e exibição pública atualizados com sucesso.");
    } catch {
      setTone("error");
      setMessage("Não foi possível conectar ao endpoint de apresentação.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      <section className={styles.editorSection}>
        <h2>Organização e exibição pública</h2>
        <p>
          Defina a coleção da página de projetos e controle separadamente a grade da Home e o carrossel principal.
        </p>

        {publicationStatus !== "published" ? (
          <div className={styles.notice} data-tone="warning">
            Este projeto está como {publicationStatus}. As opções ficam salvas, mas ele só aparece publicamente quando o status for published.
          </div>
        ) : null}

        {message ? (
          <div className={styles.notice} data-tone={tone} aria-live="polite">
            {message}
          </div>
        ) : null}

        <div className={styles.fieldGrid}>
          <label className={styles.fullField}>
            Coleção na página de projetos
            <select defaultValue={initialCollection} name="collection" required>
              <option value="primary">Projetos principais</option>
              <option value="labs">Laboratórios técnicos</option>
              <option value="secondary">Outros cases</option>
            </select>
          </label>

          <label className={styles.checkboxField}>
            <input
              defaultChecked={initialPlacement.showInHome}
              name="showInHome"
              type="checkbox"
            />
            Exibir na grade de projetos da Home
          </label>

          <label className={styles.field}>
            Ordem na grade da Home
            <input
              defaultValue={initialPlacement.homeOrder}
              min="0"
              name="homeOrder"
              required
              type="number"
            />
          </label>

          <label className={styles.checkboxField}>
            <input
              defaultChecked={initialPlacement.showInCarousel}
              name="showInCarousel"
              type="checkbox"
            />
            Exibir no carrossel principal
          </label>

          <label className={styles.field}>
            Ordem no carrossel
            <input
              defaultValue={initialPlacement.carouselOrder}
              min="0"
              name="carouselOrder"
              required
              type="number"
            />
          </label>

          <label className={styles.field}>
            Resumo do carrossel PT
            <textarea
              maxLength={CAROUSEL_DESCRIPTION_MAX_LENGTH}
              name="carouselDescriptionPt"
              onChange={(event) => setCarouselDescriptionPt(event.currentTarget.value)}
              placeholder={fallbackDescription.pt}
              value={carouselDescriptionPt}
            />
            <span style={{ justifySelf: "end", opacity: 0.72 }}>
              {carouselDescriptionPt.length}/{CAROUSEL_DESCRIPTION_MAX_LENGTH}
            </span>
          </label>

          <label className={styles.field}>
            Carousel summary EN
            <textarea
              maxLength={CAROUSEL_DESCRIPTION_MAX_LENGTH}
              name="carouselDescriptionEn"
              onChange={(event) => setCarouselDescriptionEn(event.currentTarget.value)}
              placeholder={fallbackDescription.en}
              value={carouselDescriptionEn}
            />
            <span style={{ justifySelf: "end", opacity: 0.72 }}>
              {carouselDescriptionEn.length}/{CAROUSEL_DESCRIPTION_MAX_LENGTH}
            </span>
          </label>
        </div>

        <p>
          O resumo do carrossel é opcional. Se os dois campos ficarem vazios, a Home usa uma versão compactada automaticamente da descrição curta.
        </p>

        <div className={styles.headerActions}>
          <button className={styles.primaryButton} disabled={pending} type="submit">
            {pending ? "Salvando..." : "Salvar organização pública"}
          </button>
        </div>
      </section>
    </form>
  );
}
