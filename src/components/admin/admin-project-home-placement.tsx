"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import type { ProjectHomePlacement } from "@/lib/projects/home-placement";

import styles from "./admin-projects.module.css";

type ApiResponse = {
  error?: {
    message?: string;
  };
  ok: boolean;
};

type AdminProjectHomePlacementProps = {
  initialPlacement: ProjectHomePlacement;
  publicationStatus: "draft" | "published" | "archived";
  slug: string;
};

function numberValue(form: FormData, name: string) {
  return Number(String(form.get(name) ?? "0"));
}

export function AdminProjectHomePlacement({
  initialPlacement,
  publicationStatus,
  slug,
}: AdminProjectHomePlacementProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success">("success");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: ProjectHomePlacement = {
      carouselOrder: numberValue(form, "carouselOrder"),
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
        setMessage(body.error?.message || "Não foi possível salvar a exibição na Home.");
        return;
      }

      setTone("success");
      setMessage("Exibição na Home atualizada com sucesso.");
    } catch {
      setTone("error");
      setMessage("Não foi possível conectar ao endpoint de exibição.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      <section className={styles.editorSection}>
        <h2>Exibição na Home</h2>
        <p>
          Controle separadamente a grade de projetos e o carrossel principal. Apenas projetos publicados aparecem publicamente.
        </p>

        {publicationStatus !== "published" ? (
          <div className={styles.notice} data-tone="warning">
            Este projeto está como {publicationStatus}. As opções ficam salvas, mas só entram na Home quando o status for published.
          </div>
        ) : null}

        {message ? (
          <div className={styles.notice} data-tone={tone} aria-live="polite">
            {message}
          </div>
        ) : null}

        <div className={styles.fieldGrid}>
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
        </div>

        <div className={styles.headerActions}>
          <button className={styles.primaryButton} disabled={pending} type="submit">
            {pending ? "Salvando..." : "Salvar exibição na Home"}
          </button>
        </div>
      </section>
    </form>
  );
}
