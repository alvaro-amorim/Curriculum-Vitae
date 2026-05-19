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
http://localhost:3000/projetos
http://localhost:3000/lab
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
    lab/page.tsx
    not-found.tsx
    page.tsx
    robots.ts
    sitemap.ts
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
    challenges.ts
    translations.ts
  lib/
    lab-score.ts
  types/

public/
  profile/
  resume/
```

## Status Atual

Fase 1 concluída e commitada. Fase 2 concluída e commitada com a área de case studies em `/projetos` e `/projetos/[slug]`. Fase 3 concluída e commitada com terminal interativo client-side, command palette com atalho `Ctrl+K`/`Cmd+K`, skill matrix e microinterações leves com respeito a `prefers-reduced-motion`.

Fase 4 concluída e commitada: foram criadas APIs em modo local/mock com Route Handlers, validação Zod, respostas padronizadas e fallback sem banco para `/api/health`, `/api/contact`, `/api/analytics`, `/api/terminal` e `/api/score`.

Fase 5 concluída e commitada: foi criada a rota `/lab` com Developer Lab, Debug Challenge, Architecture Builder, API Latency Game, pontuação local de sessão e envio seguro opcional para `/api/score`.

Fase 6.1 implementada e auditada, ainda sem checkpoint/commit: metadata global e por rota, sitemap, robots, página 404, ajustes leves de acessibilidade e readiness de deploy foram preparados.

A aplicação possui home, rota `/curriculo`, conteúdo principal separado em `src/content`, tema claro/escuro básico, PT/EN básico, downloads PDF/DOCX preservados, case studies de projetos, interações avançadas no front-end, APIs locais seguras, Developer Lab técnico e SEO básico para divulgação.

O arquivo `index.html` permanece na raiz como referência/backup da versão estática anterior. Os arquivos originais de imagem, PDF e DOCX também permanecem preservados na raiz, com cópias em `public/` para uso pelo Next.js.

## Próximas Fases

- Fase 6: auditar, consolidar e criar checkpoint do polimento final.

Supabase real, banco de dados, envio real de e-mail, analytics persistente, autenticação, dashboard admin, ranking real e Developer Lab completo ainda não foram implementados. Nenhuma fase futura está marcada como concluída.

## Deploy Readiness

Checklist para deploy na Vercel:

```powershell
npm install
npm run lint
npm run typecheck
npm run build
```

Variável recomendada:

```txt
NEXT_PUBLIC_APP_URL=https://seu-dominio-ou-projeto.vercel.app
```

Depois de configurar a variável no projeto da Vercel, o deploy pode ser feito pelo fluxo Git/Vercel ou pela CLI da Vercel. Este README não indica deploy concluído; a publicação real ainda precisa ser executada e validada.

## Testes Manuais das APIs

No PowerShell, use `curl.exe --%` para preservar as aspas do JSON:

```powershell
curl.exe -I http://localhost:3000/api/health
curl.exe --% -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Teste User\",\"email\":\"teste@example.com\",\"message\":\"Mensagem de teste com tamanho suficiente.\",\"source\":\"manual\"}"
curl.exe --% -X POST http://localhost:3000/api/analytics -H "Content-Type: application/json" -d "{\"event\":\"page_view\",\"metadata\":{\"path\":\"/\"}}"
curl.exe --% -X POST http://localhost:3000/api/terminal -H "Content-Type: application/json" -d "{\"command\":\"help\"}"
curl.exe --% -X POST http://localhost:3000/api/score -H "Content-Type: application/json" -d "{\"game\":\"portfolio\",\"score\":85,\"metadata\":{\"source\":\"manual\"}}"
```
