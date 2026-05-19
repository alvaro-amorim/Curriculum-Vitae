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
    lab/
    layout/
    resume/
    projects/
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

Fase 1 concluída e commitada. Fase 2 concluída e commitada com a área de case studies em `/projetos` e `/projetos/[slug]`. Fase 3.1 implementada e auditada, ainda sem checkpoint/commit: a home possui terminal interativo client-side, command palette com atalho `Ctrl+K`/`Cmd+K`, skill matrix e microinterações leves com respeito a `prefers-reduced-motion`.

A aplicação possui home, rota `/curriculo`, conteúdo principal separado em `src/content`, tema claro/escuro básico, PT/EN básico, downloads PDF/DOCX preservados, case studies de projetos e interações avançadas apenas no front-end.

O arquivo `index.html` permanece na raiz como referência/backup da versão estática anterior. Os arquivos originais de imagem, PDF e DOCX também permanecem preservados na raiz, com cópias em `public/` para uso pelo Next.js.

## Próximas Fases

- Fase 3: criar checkpoint da interatividade avançada front-end.
- Fase 4: adicionar APIs reais com validação e fallback sem banco.
- Fase 5: criar Developer Lab com mini-games técnicos.
- Fase 6: polimento final de SEO, acessibilidade, performance, README e deploy.

Backend, APIs, Supabase, analytics persistente, mini-games e Developer Lab completo ainda não foram implementados. Nenhuma fase futura está marcada como concluída.
