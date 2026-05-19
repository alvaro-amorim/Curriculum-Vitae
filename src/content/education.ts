import type { CertificationGroup, EducationItem } from "@/types/portfolio";

export const education: EducationItem[] = [
  {
    title: {
      pt: "Tecnólogo em Desenvolvimento Full Stack",
      en: "Technologist in Full Stack Development",
    },
    institution: {
      pt: "Universidade Estácio de Sá",
      en: "Estácio de Sá University",
    },
    period: "2023-2025",
  },
];

export const certificationGroup: CertificationGroup = {
  title: {
    pt: "Certificações",
    en: "Certifications",
  },
  meta: {
    pt: "Cloud • Segurança • IA aplicada a negócios",
    en: "Cloud • Security • AI applied to business",
  },
  badge: {
    pt: "Cursos",
    en: "Courses",
  },
  items: [
    {
      pt: "Capacitação Amazon Cloud Services AWS (KaSolutions)",
      en: "Amazon Cloud Services AWS Training (KaSolutions)",
    },
    {
      pt: "Segurança de Endpoint (Cisco Networking Academy)",
      en: "Endpoint Security (Cisco Networking Academy)",
    },
    {
      pt: "Pré-MBA em IA para Negócios (EXAME / Saint Paul)",
      en: "Pre-MBA in AI for Business (EXAME / Saint Paul)",
    },
    {
      pt: "Jornada Python (Hashtag Treinamentos)",
      en: "Python Journey (Hashtag Treinamentos)",
    },
  ],
};
