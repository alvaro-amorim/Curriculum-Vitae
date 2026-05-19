# Álvaro.dev Portfolio OS

Portfólio e currículo digital de Álvaro Amorim, migrado de uma página HTML estática para uma base profissional em Next.js. O projeto preserva o currículo objetivo atual e prepara a evolução incremental para case studies, interatividade avançada, backend e Developer Lab, conforme a constituição técnica do repositório.

## Objetivo

Criar uma aplicação de portfólio/currículo que demonstre habilidades reais de front-end moderno, organização de conteúdo, UX, acessibilidade, SEO inicial e arquitetura limpa, sem perder o acesso rápido ao currículo tradicional usado por recrutadores.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zod
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
    api/
      analytics/route.ts
      contact/route.ts
      health/route.ts
      score/route.ts
      terminal/route.ts
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

Fase 1 concluída e commitada. Fase 2 concluída e commitada com a área de case studies em `/projetos` e `/projetos/[slug]`. Fase 3 concluída e commitada com terminal interativo client-side, command palette com atalho `Ctrl+K`/`Cmd+K`, skill matrix e microinterações leves com respeito a `prefers-reduced-motion`.

Fase 4.1 implementada e auditada, ainda sem checkpoint/commit: foram criadas APIs em modo local/mock com Route Handlers, validação Zod, respostas padronizadas e fallback sem banco para `/api/health`, `/api/contact`, `/api/analytics`, `/api/terminal` e `/api/score`.

A aplicação possui home, rota `/curriculo`, conteúdo principal separado em `src/content`, tema claro/escuro básico, PT/EN básico, downloads PDF/DOCX preservados, case studies de projetos, interações avançadas no front-end e APIs locais seguras para evolução futura.

O arquivo `index.html` permanece na raiz como referência/backup da versão estática anterior. Os arquivos originais de imagem, PDF e DOCX também permanecem preservados na raiz, com cópias em `public/` para uso pelo Next.js.

## Próximas Fases

- Fase 4: criar checkpoint das APIs locais/mock; Supabase real fica para etapa futura.
- Fase 5: criar Developer Lab com mini-games técnicos.
- Fase 6: polimento final de SEO, acessibilidade, performance, README e deploy.

Supabase real, banco de dados, envio real de e-mail, analytics persistente, autenticação, mini-games e Developer Lab completo ainda não foram implementados. Nenhuma fase futura está marcada como concluída.

## Testes Manuais das APIs

No PowerShell, use `curl.exe --%` para preservar as aspas do JSON:

```powershell
curl.exe -I http://localhost:3000/api/health
curl.exe --% -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Teste User\",\"email\":\"teste@example.com\",\"message\":\"Mensagem de teste com tamanho suficiente.\",\"source\":\"manual\"}"
curl.exe --% -X POST http://localhost:3000/api/analytics -H "Content-Type: application/json" -d "{\"event\":\"page_view\",\"metadata\":{\"path\":\"/\"}}"
curl.exe --% -X POST http://localhost:3000/api/terminal -H "Content-Type: application/json" -d "{\"command\":\"help\"}"
curl.exe --% -X POST http://localhost:3000/api/score -H "Content-Type: application/json" -d "{\"game\":\"portfolio\",\"score\":85,\"metadata\":{\"source\":\"manual\"}}"
```
