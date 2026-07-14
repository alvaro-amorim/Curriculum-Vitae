"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ProjectImportPreview } from "@/lib/projects/project-import";

import styles from "./admin-projects.module.css";

const MAX_JSON_BYTES = 1024 * 1024;
const TEMPLATE_URL = "/api/admin/projects/import/template";
const TEMPLATE_FILE_NAME = "portfolio-project-import.template.json";
const AI_INSTRUCTION = `Analise profundamente o repositório que vou informar. Entenda o objetivo, funcionalidades, arquitetura, stack, diferenciais, desafios técnicos e estágio atual do projeto.

Depois, preencha exatamente a estrutura do arquivo JSON fornecido.

Regras:
- não invente funcionalidades;
- use apenas informações comprovadas pelo código e documentação;
- escreva cópias profissionais para portfólio;
- preencha português e inglês;
- preserve exatamente os nomes dos campos;
- retorne somente JSON válido;
- não inclua Markdown;
- não inclua imagens ou mídias;
- mantenha publicationStatus como draft.`;

type ImportResponse = {
  data?: {
    imported?: Array<{
      slug: string;
      title: string;
    }>;
    preview?: ProjectImportPreview;
  };
  error?: {
    message?: string;
  };
  ok: boolean;
};

type Props = {
  onClose: () => void;
  onImported: (slugs: string[]) => void;
  open: boolean;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isJsonFile(file: File) {
  return /\.json$/i.test(file.name);
}

function parseJsonInput(text: string) {
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BYTES) {
    throw new Error("O JSON ultrapassa o limite de 1 MB.");
  }

  return JSON.parse(text) as unknown;
}

export function AdminProjectJsonImportModal({ onClose, onImported, open }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeInput, setActiveInput] = useState<"file" | "paste">("file");
  const [copyMessage, setCopyMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [imported, setImported] = useState<Array<{ slug: string; title: string }>>([]);
  const [jsonText, setJsonText] = useState("");
  const [loadingState, setLoadingState] = useState<"idle" | "validating" | "importing">("idle");
  const [preview, setPreview] = useState<ProjectImportPreview | null>(null);

  const hasContent = jsonText.trim().length > 0 || fileMeta !== null;
  const hasBlockingErrors = Boolean(preview && preview.invalidCount > 0);
  const importableCount = preview?.validCount ?? 0;
  const canImport = Boolean(preview && importableCount > 0 && !hasBlockingErrors && loadingState === "idle");

  const requestClose = useCallback(() => {
    if (loadingState === "importing") {
      return;
    }

    if (hasContent && imported.length === 0) {
      const confirmed = window.confirm("Descartar o JSON preenchido?");

      if (!confirmed) {
        return;
      }
    }

    onClose();
  }, [hasContent, imported.length, loadingState, onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("aria-hidden"));

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [open, requestClose]);

  async function readFile(file: File) {
    setError("");
    setPreview(null);
    setImported([]);

    if (!isJsonFile(file)) {
      setFileMeta(null);
      setError("Selecione um arquivo .json válido.");
      return;
    }

    if (file.size > MAX_JSON_BYTES) {
      setFileMeta(null);
      setError("O arquivo ultrapassa o limite de 1 MB.");
      return;
    }

    const text = await file.text();
    setFileMeta({
      name: file.name,
      size: file.size,
    });
    setJsonText(text);
  }

  function removeFile() {
    setFileMeta(null);
    setJsonText("");
    setPreview(null);
    setImported([]);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function formatJson() {
    try {
      const parsed = parseJsonInput(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Não foi possível formatar: o JSON está inválido.");
    }
  }

  function clearJson() {
    setJsonText("");
    setFileMeta(null);
    setPreview(null);
    setImported([]);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function validateJson() {
    setLoadingState("validating");
    setError("");
    setImported([]);

    try {
      const payload = parseJsonInput(jsonText);
      const response = await fetch("/api/admin/projects/import", {
        body: JSON.stringify({
          mode: "validate",
          payload,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const body = (await response.json()) as ImportResponse;

      if (!response.ok || !body.ok || !body.data?.preview) {
        setError(body.error?.message || "Não foi possível validar o JSON.");
        return;
      }

      setPreview(body.data.preview);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "JSON inválido.");
    } finally {
      setLoadingState("idle");
    }
  }

  async function importJson() {
    setLoadingState("importing");
    setError("");

    try {
      const payload = parseJsonInput(jsonText);
      const response = await fetch("/api/admin/projects/import", {
        body: JSON.stringify({
          mode: "import",
          payload,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const body = (await response.json()) as ImportResponse;

      if (!response.ok || !body.ok || !body.data?.imported) {
        setError(body.error?.message || "Não foi possível importar os projetos.");
        return;
      }

      setImported(body.data.imported);
      setPreview(body.data.preview ?? null);
      onImported(body.data.imported.map((project) => project.slug));
    } catch {
      setError("Não foi possível importar o JSON.");
    } finally {
      setLoadingState("idle");
    }
  }

  async function copyInstruction() {
    try {
      await navigator.clipboard.writeText(AI_INSTRUCTION);
      setCopyMessage("Instrução copiada.");
    } catch {
      setCopyMessage("Não foi possível copiar automaticamente.");
    }
  }

  const previewStats = useMemo(() => {
    if (!preview) return null;

    return {
      existing: preview.existingSlugs.length,
      invalid: preview.invalidCount,
      valid: preview.validCount,
    };
  }, [preview]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.importModalLayer}>
      <div
        aria-labelledby="project-json-import-title"
        aria-modal="true"
        className={styles.importModal}
        ref={dialogRef}
        role="dialog"
      >
        <header className={styles.importModalHeader}>
          <div>
            <span className={styles.eyebrow}>ADMIN / IMPORTAÇÃO</span>
            <h2 id="project-json-import-title">Importar projetos via JSON</h2>
            <p>Crie projetos a partir de um arquivo estruturado. As imagens e logos podem ser adicionadas posteriormente.</p>
          </div>
          <button
            aria-label="Fechar modal"
            className={styles.iconButton}
            disabled={loadingState === "importing"}
            onClick={requestClose}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </header>

        <section className={styles.importGuide}>
          <div>
            <strong>Modelo para IA</strong>
            <p>Envie este modelo à IA junto com o link do repositório do projeto. Peça para ela analisar o código e preencher todos os campos sem inventar funcionalidades.</p>
            {copyMessage ? <small aria-live="polite">{copyMessage}</small> : null}
          </div>
          <div className={styles.importGuideActions}>
            <a className={styles.secondaryButton} download={TEMPLATE_FILE_NAME} href={TEMPLATE_URL}>
              Baixar modelo JSON
            </a>
            <button className={styles.secondaryButton} onClick={() => void copyInstruction()} type="button">
              Copiar instrução para IA
            </button>
          </div>
        </section>

        <div className={styles.importTabs} role="tablist" aria-label="Forma de entrada do JSON">
          <button
            aria-selected={activeInput === "file"}
            className={styles.importTab}
            onClick={() => setActiveInput("file")}
            role="tab"
            type="button"
          >
            Enviar arquivo
          </button>
          <button
            aria-selected={activeInput === "paste"}
            className={styles.importTab}
            onClick={() => setActiveInput("paste")}
            role="tab"
            type="button"
          >
            Colar JSON
          </button>
        </div>

        {activeInput === "file" ? (
          <section
            className={styles.importDropzone}
            data-dragging={dragging}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragging(false);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files.item(0);

              if (file) {
                void readFile(file);
              }
            }}
          >
            <div>
              <strong>Arraste um JSON aqui</strong>
              <span>Somente .json até 1 MB. Nenhuma mídia será importada.</span>
            </div>
            <input
              accept=".json,application/json"
              className={styles.srOnly}
              onChange={(event) => {
                const file = event.target.files?.item(0);

                if (file) {
                  void readFile(file);
                }
              }}
              ref={fileInputRef}
              type="file"
            />
            <button className={styles.secondaryButton} onClick={() => fileInputRef.current?.click()} type="button">
              Selecionar arquivo
            </button>
            {fileMeta ? (
              <div className={styles.selectedFile}>
                <span>{fileMeta.name}</span>
                <small>{formatBytes(fileMeta.size)}</small>
                <button className={styles.linkButton} onClick={removeFile} type="button">
                  Remover
                </button>
              </div>
            ) : null}
          </section>
        ) : (
          <section className={styles.importPastePanel}>
            <textarea
              aria-label="JSON do projeto"
              className={styles.importTextarea}
              onChange={(event) => {
                setJsonText(event.target.value);
                setPreview(null);
                setImported([]);
              }}
              placeholder={`Cole aqui o conteúdo de ${TEMPLATE_FILE_NAME}`}
              spellCheck={false}
              value={jsonText}
            />
            <div className={styles.importTextareaActions}>
              <span>{jsonText.length.toLocaleString("pt-BR")} caracteres</span>
              <button className={styles.secondaryButton} disabled={!jsonText} onClick={formatJson} type="button">
                Formatar JSON
              </button>
              <button className={styles.secondaryButton} disabled={!jsonText} onClick={clearJson} type="button">
                Limpar
              </button>
            </div>
          </section>
        )}

        {error ? (
          <div className={styles.notice} data-tone="error" role="alert">
            <span>{error}</span>
          </div>
        ) : null}

        {previewStats ? (
          <section className={styles.importPreview}>
            <div className={styles.importStats}>
              <span>{previewStats.valid} projetos válidos</span>
              <span>{previewStats.invalid} projetos com problemas</span>
              <span>{previewStats.existing} slugs já existentes</span>
            </div>
            <div className={styles.importPreviewList}>
              {preview?.projects.map((item, index) => (
                <article className={styles.importPreviewCard} data-state={item.importable ? "valid" : "invalid"} key={`${item.rawSlug ?? "project"}-${index}`}>
                  <div>
                    <strong>{item.summary.titlePt || "Projeto sem título PT"}</strong>
                    <small>{item.summary.titleEn || "Sem título EN"}</small>
                  </div>
                  <dl>
                    <div>
                      <dt>Slug</dt>
                      <dd>{item.summary.slug || "indefinido"}</dd>
                    </div>
                    <div>
                      <dt>Subtítulo</dt>
                      <dd>{item.summary.subtitle || "indefinido"}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{item.summary.status || "draft"}</dd>
                    </div>
                    <div>
                      <dt>Categorias</dt>
                      <dd>{item.summary.categories.join(", ") || "indefinidas"}</dd>
                    </div>
                    <div>
                      <dt>Stack</dt>
                      <dd>{item.summary.stack.join(", ") || "indefinida"}</dd>
                    </div>
                    <div>
                      <dt>Featured</dt>
                      <dd>{item.summary.featured ? "Sim" : "Não"}</dd>
                    </div>
                    <div>
                      <dt>Ordem</dt>
                      <dd>{item.summary.sortOrder ?? "indefinida"}</dd>
                    </div>
                    <div>
                      <dt>Repositório</dt>
                      <dd>{item.summary.repository || "não informado"}</dd>
                    </div>
                  </dl>
                  <div className={styles.importBadges}>
                    <span>{item.existing ? "Slug já existente" : "Novo projeto"}</span>
                    {item.errors.map((projectError) => (
                      <span data-tone="error" key={projectError}>{projectError}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {imported.length > 0 ? (
          <section className={styles.importSuccess}>
            <strong>
              {imported.length === 1
                ? "Projeto importado com sucesso como rascunho."
                : `${imported.length} projetos foram importados como rascunho.`}
            </strong>
            <p>Agora você pode adicionar logo, capa, hero e galeria.</p>
            <div className={styles.importGuideActions}>
              <button className={styles.secondaryButton} onClick={onClose} type="button">
                Ver projetos
              </button>
              {imported[0] ? (
                <Link className={styles.primaryButton} href={`/admin/projects/${imported[0].slug}`}>
                  Editar projeto
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}

        <footer className={styles.importFooter}>
          <button
            className={styles.secondaryButton}
            disabled={!jsonText || loadingState !== "idle"}
            onClick={() => void validateJson()}
            type="button"
          >
            {loadingState === "validating" ? "Analisando..." : "Validar JSON"}
          </button>
          <button
            className={styles.primaryButton}
            disabled={!canImport}
            onClick={() => void importJson()}
            type="button"
          >
            {loadingState === "importing" ? "Importando..." : `Importar ${importableCount} projetos`}
          </button>
        </footer>
      </div>
    </div>
  );
}
