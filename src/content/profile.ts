import type { ProfileLink } from "@/types/portfolio";

export const profile = {
  fullName: "Álvaro Amorim de Oliveira Martins",
  shortName: "Álvaro Amorim",
  role: {
    pt: "Desenvolvedor Full Stack",
    en: "Full Stack Developer",
  },
  positioning: {
    pt: "Aplicações Web • Produtos SaaS • Automações • Integrações com IA",
    en: "Web Applications • SaaS Products • Automation • AI Integrations",
  },
  location: "Juiz de Fora, MG",
  country: {
    pt: "Brasil",
    en: "Brazil",
  },
  phone: "+55 32 99114-7944",
  email: "alvaroaom.jf@gmail.com",
  github: "https://github.com/alvaro-amorim",
  linkedin: "https://www.linkedin.com/in/alvaro-amorim-fullstack",
  portfolio: "https://curriculum-vitae-babr.vercel.app/",
  avatar: "/profile/imagem.png",
  highlights: ["React", "Next.js", "TypeScript", "Node.js", "Python", "Supabase"],
};

export const profileLinks: ProfileLink[] = [
  {
    label: {
      pt: "Currículo Digital",
      en: "Digital resume",
    },
    href: "https://curriculum-vitae-babr.vercel.app/",
    display: "curriculum-vitae-babr.vercel.app",
    kind: "portfolio",
  },
  {
    label: {
      pt: "GitHub",
      en: "GitHub",
    },
    href: "https://github.com/alvaro-amorim",
    display: "github.com/alvaro-amorim",
    kind: "github",
  },
];
