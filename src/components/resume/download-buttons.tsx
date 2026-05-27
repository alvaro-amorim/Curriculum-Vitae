"use client";

import { downloads } from "@/content/downloads";
import { buttonClassName, Button } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";

import styles from "./resume.module.css";

export function DownloadButtons() {
  const { locale, t } = usePortfolioUi();
  const files = downloads[locale];

  function printPdf() {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = files.pdf.href;

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.open(files.pdf.href, "_blank", "noopener,noreferrer");
      }

      window.setTimeout(() => iframe.remove(), 1500);
    };

    document.body.appendChild(iframe);
  }

  return (
    <div className={styles.downloadRail}>
      <a className={buttonClassName("primary")} download={files.pdf.fileName} href={files.pdf.href}>
        {t.actions.downloadPdf}
      </a>
      <a className={buttonClassName("success")} download={files.docx.fileName} href={files.docx.href}>
        {t.actions.downloadDocx}
      </a>
      <Button onClick={printPdf} variant="secondary">
        {t.actions.print}
      </Button>
    </div>
  );
}
