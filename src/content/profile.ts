import type { ProfileLink } from "@/types/portfolio";

import { career } from "./career.ts";

export const profile = {
  fullName: "Álvaro Amorim de Oliveira Martins",
  shortName: "Álvaro Amorim",
  role: career.role,
  positioning: career.positioning,
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
    href: profile.portfolio,
    display: "curriculum-vitae-babr.vercel.app",
    kind: "portfolio",
  },
  {
    label: {
      pt: "GitHub",
      en: "GitHub",
    },
    href: profile.github,
    display: "github.com/alvaro-amorim",
    kind: "github",
  },
];
