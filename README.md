# Álvaro.dev Portfolio OS

Portfólio e currículo digital de Álvaro Amorim, migrado de uma página HTML estática para uma base profissional em Next.js. O projeto preserva o currículo objetivo atual e prepara a evolução incremental para case studies, interatividade avançada, backend e Developer Lab, conforme a constituição técnica do repositório.

## Objetivo

Criar uma aplicação de portfólio/currículo que demonstre habilidades reais de front-end moderno, organização de conteúdo, UX, acessibilidade, SEO inicial e arquitetura limpa, sem perder o acesso rápido ao currículo tradicional usado por recrutadores.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- ESLint
- npm

## Como Rodar Localmente

```powershell
npm install
npm run dev
```

Depois acesse:

```txt
http://localhost:3000
http://localhost:3000/curriculo
```

## Scripts Disponíveis

```powershell
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

`npm run typecheck` executa `tsc --noEmit`.

## Estrutura Básica

```txt
src/
  app/
    page.tsx
    curriculo/page.tsx
    layout.tsx
    globals.css
  components/
    layout/
    resume/
    ui/
  content/
    profile.ts
    resume.ts
    projects.ts
    skills.ts
    education.ts
    experience.ts
    certifications.ts
    downloads.ts
    translations.ts
  lib/
  types/

public/
  profile/
  resume/
```

## Status Atual

Fase 1.1 concluída: base Next.js criada, home inicial disponível, rota `/curriculo` criada, conteúdo principal separado em `src/content`, tema claro/escuro básico, PT/EN básico e downloads PDF/DOCX preservados.

O arquivo `index.html` permanece na raiz como referência/backup da versão estática anterior. Os arquivos originais de imagem, PDF e DOCX também permanecem preservados na raiz, com cópias em `public/` para uso pelo Next.js.

## Próximas Fases

- Fase 2: criar listagem e páginas de case study para projetos.
- Fase 3: adicionar interatividade avançada com terminal visual, command palette e skill radar.
- Fase 4: adicionar APIs reais com validação e fallback sem banco.
- Fase 5: criar Developer Lab com mini-games técnicos.
- Fase 6: polimento final de SEO, acessibilidade, performance, README e deploy.

Nenhuma fase futura está marcada como concluída.
