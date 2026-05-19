import type { DownloadAsset, Locale } from "@/types/portfolio";

export const downloads: Record<Locale, Record<"pdf" | "docx", DownloadAsset>> = {
  pt: {
    pdf: {
      label: "PDF",
      href: "/resume/ALVARO.MARTINS-PT.pdf",
      fileName: "ALVARO.MARTINS-PT.pdf",
    },
    docx: {
      label: "DOCX",
      href: "/resume/ALVARO.MARTINS-PT.docx",
      fileName: "ALVARO.MARTINS-PT.docx",
    },
  },
  en: {
    pdf: {
      label: "PDF",
      href: "/resume/ALVARO.MARTINS-EN.pdf",
      fileName: "ALVARO.MARTINS-EN.pdf",
    },
    docx: {
      label: "DOCX",
      href: "/resume/ALVARO.MARTINS-EN.docx",
      fileName: "ALVARO.MARTINS-EN.docx",
    },
  },
};
