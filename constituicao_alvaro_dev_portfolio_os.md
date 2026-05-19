# Constituição Técnica — Álvaro.dev Portfolio OS

> Documento-base para o Codex transformar o currículo/portfólio digital atual em uma aplicação profissional, interativa e full stack.

---

## 1. Objetivo do Projeto

Transformar o currículo digital atual, hoje implementado como uma página HTML única, em uma aplicação moderna chamada provisoriamente **Álvaro.dev Portfolio OS**.

O objetivo não é apenas criar um site bonito. O objetivo é construir uma experiência que demonstre, na prática, habilidades reais de:

- Front-end moderno.
- Back-end.
- Arquitetura de aplicação.
- UX/UI.
- TypeScript.
- Next.js.
- APIs.
- Banco de dados.
- Autenticação opcional.
- Analytics.
- Performance.
- SEO.
- Acessibilidade.
- Organização profissional de projeto.
- Integração com IA e automações, quando fizer sentido.

A aplicação deve continuar servindo como currículo/portfólio, mas também precisa funcionar como uma demonstração viva das capacidades técnicas do desenvolvedor.

---

## 2. Contexto Atual

Existe uma versão atual do currículo em HTML puro, com CSS e JavaScript no mesmo arquivo.

A versão atual já possui:

- Layout responsivo.
- Tema claro/escuro.
- Alternância de idioma PT/EN.
- Cards de projetos.
- Modal de detalhes dos projetos.
- Filtros de habilidades.
- Botões para baixar PDF e DOCX.
- Botão de impressão.
- Animação de reveal no scroll.
- Efeito spotlight nos cards.
- Botões para copiar telefone, e-mail e links.
- Atalhos de teclado.
- Metatags básicas de SEO e Open Graph.

Apesar disso, a versão atual ainda demonstra mais domínio de HTML/CSS/JS vanilla do que uma aplicação front-end/back-end profissional. O novo projeto deve preservar o conteúdo importante, mas reorganizar tudo em arquitetura moderna.

---

## 3. Princípio Central

Este projeto deve seguir a seguinte ideia:

> O portfólio não deve apenas dizer que Álvaro sabe desenvolver.  
> Ele deve provar isso através da própria experiência da página.

Cada seção precisa demonstrar uma habilidade válida:

- A interface demonstra front-end.
- Os dados estruturados demonstram organização.
- As rotas e APIs demonstram back-end.
- Os mini-games demonstram lógica.
- Os dashboards demonstram dados e produto.
- O terminal interativo demonstra criatividade e domínio técnico.
- O tracking de eventos demonstra visão de produto.
- As páginas de case study demonstram comunicação técnica.

---

## 4. Nome do Produto

Nome sugerido:

```txt
Álvaro.dev Portfolio OS
```

Outras alternativas aceitáveis:

```txt
Álvaro Amorim — Full Stack Portfolio OS
Álvaro.dev — Interactive Resume
Álvaro Amorim — Developer Lab
Álvaro Amorim — Full Stack Lab
```

A nomenclatura final pode ser ajustada, mas a ideia de “Portfolio OS” deve orientar a experiência: a página deve parecer um sistema, um painel ou um ambiente interativo, não apenas um currículo estático.

---

## 5. Stack Recomendada

### 5.1 Front-end

Usar:

- Next.js com App Router.
- TypeScript.
- React.
- Tailwind CSS.
- Framer Motion ou Motion para animações.
- shadcn/ui, se fizer sentido.
- Lucide React para ícones.
- React Hook Form para formulários.
- Zod para validação.
- Recharts para gráficos simples.
- next-themes para tema claro/escuro, se fizer sentido.

### 5.2 Back-end

Usar:

- Route Handlers do Next.js em `app/api`.
- Zod para validar payloads.
- Supabase como banco, caso o projeto já tenha configuração disponível.
- PostgreSQL via Supabase.
- Server Actions apenas se fizer sentido.
- Rate limit simples para endpoints públicos, se possível.

### 5.3 Infraestrutura

Usar:

- Vercel para deploy.
- Variáveis de ambiente documentadas.
- `.env.example`.
- README com instruções.
- ESLint.
- Prettier, se já houver padrão.
- Testes mínimos com Vitest ou equivalente, se o setup permitir.

---

## 6. Arquitetura de Pastas Sugerida

```txt
app/
  layout.tsx
  page.tsx
  globals.css

  curriculo/
    page.tsx

  projetos/
    page.tsx
    [slug]/
      page.tsx

  lab/
    page.tsx

  terminal/
    page.tsx

  api/
    contact/
      route.ts
    analytics/
      route.ts
    terminal/
      route.ts
    score/
      route.ts

components/
  layout/
    app-shell.tsx
    topbar.tsx
    footer.tsx
    mobile-nav.tsx

  hero/
    hero-section.tsx
    terminal-preview.tsx
    availability-badge.tsx

  resume/
    resume-summary.tsx
    skills-cloud.tsx
    education-section.tsx
    experience-timeline.tsx
    download-buttons.tsx

  projects/
    project-card.tsx
    project-grid.tsx
    project-case-study.tsx
    project-tech-stack.tsx
    project-architecture.tsx

  lab/
    command-palette.tsx
    debug-challenge.tsx
    architecture-builder.tsx
    api-latency-game.tsx
    skill-radar.tsx

  ui/
    button.tsx
    card.tsx
    badge.tsx
    dialog.tsx
    toast.tsx

content/
  profile.ts
  projects.ts
  skills.ts
  experience.ts
  education.ts
  certifications.ts
  translations.ts

lib/
  analytics.ts
  supabase.ts
  validators.ts
  constants.ts
  format.ts
  terminal-commands.ts

types/
  project.ts
  resume.ts
  analytics.ts

public/
  avatar/
  pdf/
  docs/
  images/
```

---

## 7. Regras de Migração do HTML Atual

O Codex deve analisar o HTML atual antes de implementar.

Preservar:

- Nome completo.
- Cargo e posicionamento.
- Localização.
- Contatos.
- Links.
- Projetos existentes.
- Descrições dos projetos.
- Lista de skills.
- Formação.
- Certificações.
- Experiências.
- Versões PT/EN.
- Links para PDF e DOCX.
- Tema claro/escuro.
- Responsividade.
- Boa legibilidade em mobile.

Melhorar:

- Separar conteúdo de apresentação.
- Remover textos hardcoded diretamente em componentes grandes.
- Criar arquivos de dados estruturados.
- Transformar cards de projetos em componentes.
- Criar páginas individuais para projetos.
- Criar experiência mais impactante na home.
- Melhorar SEO.
- Melhorar acessibilidade.
- Adicionar backend real.
- Adicionar interações que provem conhecimento técnico.
- Adicionar documentação.

Evitar:

- Copiar todo o HTML atual como um componente gigante.
- Criar animações excessivas que atrapalhem leitura.
- Usar dependências sem necessidade.
- Fazer layout pesado demais.
- Quebrar a versão mobile.
- Remover acesso rápido ao currículo tradicional.
- Criar backend falso sem utilidade.

---

## 8. Experiência Principal da Home

A home deve parecer uma tela inicial de um sistema.

### 8.1 Hero

A hero deve comunicar rapidamente:

```txt
Álvaro Amorim
Full Stack Developer
Construo aplicações web, SaaS, automações e integrações com IA.
```

Deve ter CTAs:

- Ver projetos.
- Abrir currículo.
- Entrar no Developer Lab.
- Baixar PDF.
- Copiar contato.
- Ver GitHub.

### 8.2 Terminal Interativo

Adicionar um terminal interativo visual.

Exemplo de comandos:

```bash
whoami
stack
projects
open margem
open rivals
skills --backend
skills --frontend
contact
download resume
clear
help
```

O terminal pode começar apenas no front-end, mas a versão ideal deve consultar `/api/terminal` para responder comandos simples.

Critérios de aceite:

- O terminal deve aceitar comandos.
- Deve ter histórico visual.
- Deve responder `help`.
- Deve abrir rotas ou cards quando comandos específicos forem usados.
- Deve ser acessível por teclado.
- Deve funcionar bem no mobile ou ter uma versão adaptada.

### 8.3 Command Palette

Adicionar command palette com atalho `Ctrl + K`.

Ações sugeridas:

- Ir para projetos.
- Ir para currículo.
- Ir para lab.
- Baixar PDF.
- Copiar e-mail.
- Alternar tema.
- Alternar idioma.
- Abrir GitHub.
- Abrir LinkedIn, caso exista.
- Abrir projeto específico.

Critérios de aceite:

- Funciona com teclado.
- Tem busca.
- Fecha com `Esc`.
- Não conflita com inputs.
- É responsiva.

---

## 9. Seção de Projetos

A seção de projetos deve deixar de ser apenas uma lista e virar uma área de case studies.

Projetos atuais que devem ser mantidos:

1. MARGEM APP.
2. RIVALS AI.
3. SDR EXPERT CRM.
4. COMERC IAS.
5. GDASH DASHBOARD.
6. GLACÊ CONFEITARIA.

Cada projeto deve ter:

- Nome.
- Descrição curta.
- Descrição completa.
- Problema.
- Solução.
- Stack.
- Funcionalidades.
- Desafios técnicos.
- O que o projeto demonstra sobre Álvaro.
- Links.
- Repositório, quando houver.
- Status.
- Imagem ou placeholder visual.
- Tags de categoria.

Exemplo de modelo em `content/projects.ts`:

```ts
export const projects = [
  {
    slug: "margem-app",
    title: "MARGEM APP",
    subtitle: "Gestão, precificação e rotulagem para negócios de alimentação",
    status: "Em produção",
    category: ["SaaS", "FoodTech", "IA"],
    stack: ["Next.js", "React", "TypeScript", "Prisma", "Supabase", "PostgreSQL", "Tailwind CSS", "OpenAI", "AbacatePay"],
    problem: "Pequenos negócios de alimentação precisam controlar ingredientes, fichas técnicas, preços e rotulagem sem depender de planilhas frágeis.",
    solution: "Uma plataforma SaaS para centralizar gestão de ingredientes, receitas, precificação, billing e rotulagem nutricional.",
    highlights: [
      "Arquitetura preparada para multi-workspace.",
      "Entitlements por plano.",
      "Integração com IA.",
      "Fluxos administrativos e operacionais."
    ],
    links: {
      website: "https://margemapp.com.br/"
    }
  }
];
```

---

## 10. Páginas Individuais de Case Study

Criar rota:

```txt
/projetos/[slug]
```

Cada página deve conter:

### 10.1 Header do Projeto

- Nome.
- Subtítulo.
- Status.
- Stack principal.
- Links.

### 10.2 Problema

Explicar o problema real que o projeto resolve.

### 10.3 Solução

Explicar a solução criada.

### 10.4 Arquitetura

Mostrar uma representação visual da arquitetura.

Exemplo:

```txt
Client
  ↓
Next.js App
  ↓
API Routes / Server Actions
  ↓
Supabase / PostgreSQL
  ↓
External Providers
  ├─ OpenAI / Gemini
  ├─ AbacatePay
  └─ WhatsApp / APIs externas
```

### 10.5 Funcionalidades

Listar features de forma objetiva.

### 10.6 Desafios Técnicos

Exemplos:

- Multi-tenant.
- Autenticação.
- RLS.
- Billing.
- Integração com IA.
- Pipeline de dados.
- Realtime.
- Validação.
- Deploy.
- UX responsiva.

### 10.7 O que este projeto prova

Exemplo:

```txt
Este projeto demonstra capacidade de transformar uma dor de negócio em um produto web funcional, com front-end, back-end, banco de dados, integrações externas e visão de SaaS.
```

---

## 11. Developer Lab

Criar rota:

```txt
/lab
```

O Developer Lab deve ser uma área interativa para demonstrar habilidades.

### 11.1 Debug Challenge

Um mini-game onde o usuário recebe um trecho de código com bug e precisa identificar o problema.

Funcionalidades:

- Mostrar snippet.
- Opções de resposta.
- Feedback após resposta.
- Explicação técnica.
- Pontuação.
- Dificuldade: fácil, médio, difícil.

Exemplo de desafio:

```ts
const total = prices.map(p => p.value).reduce((acc, value) => acc + value);

```

Problema: `reduce` sem valor inicial pode quebrar se a lista vier vazia.

O jogo deve explicar:

- Por que quebra.
- Como corrigir.
- Qual boa prática aplicar.

### 11.2 Architecture Builder

Mini-game onde o usuário monta a arquitetura de uma aplicação.

Exemplo:

O visitante precisa organizar:

- Client.
- CDN.
- Next.js.
- API.
- Auth.
- Database.
- Queue.
- AI Provider.
- Payment Provider.

Depois o sistema calcula uma pontuação simples.

Critérios de avaliação:

- Auth antes de recursos protegidos.
- API antes do banco.
- Payment isolado.
- IA como provider externo.
- Banco protegido por camada server-side.
- Cache quando fizer sentido.

### 11.3 API Latency Game

Mini-game de performance.

Cenário:

```txt
A API está lenta. Escolha melhorias.
```

Opções:

- Adicionar cache.
- Criar índice no banco.
- Paginar resultado.
- Remover chamada duplicada.
- Usar debounce.
- Rodar processamento pesado em background.
- Buscar tudo no client sem filtro.

O jogo deve dar feedback e pontuação.

### 11.4 Skill Radar

Visualização interativa das skills por categoria:

- Front-end.
- Back-end.
- Banco de dados.
- DevOps.
- IA.
- Produto.
- UX.
- Testes.

Não deve inventar senioridade falsa. Usar labels honestos:

- Em uso prático.
- Experiência em projeto.
- Estudando/aprimorando.
- Base conceitual.

---

## 12. Back-end Real

Criar APIs úteis.

### 12.1 `/api/contact`

Recebe contato do visitante.

Payload:

```ts
{
  name: string;
  email: string;
  message: string;
  source?: string;
}
```

Regras:

- Validar com Zod.
- Retornar erros claros.
- Não expor stack trace.
- Rate limit simples, se possível.
- Salvar no Supabase, se configurado.
- Caso Supabase não esteja configurado, retornar modo mock documentado.

### 12.2 `/api/analytics`

Registra eventos simples.

Eventos possíveis:

```txt
page_view
project_view
resume_download
contact_copy
github_click
terminal_command
lab_score
```

Payload:

```ts
{
  event: string;
  metadata?: Record<string, unknown>;
}
```

Regras:

- Validar evento.
- Não coletar dados sensíveis desnecessários.
- Não armazenar telefone/e-mail do visitante sem necessidade.
- Se não houver banco, apenas logar no servidor em modo dev.

### 12.3 `/api/terminal`

Recebe comandos do terminal.

Payload:

```ts
{
  command: string;
}
```

Retorna:

```ts
{
  output: string[];
  action?: {
    type: "navigate" | "copy" | "open";
    target: string;
  }
}
```

### 12.4 `/api/score`

Salva pontuação dos mini-games.

Payload:

```ts
{
  game: "debug" | "architecture" | "latency";
  score: number;
  metadata?: Record<string, unknown>;
}
```

Regras:

- Validar score.
- Não permitir score absurdo.
- Salvar se Supabase existir.
- Caso contrário, usar estado local no front-end.

---

## 13. Banco de Dados

Caso Supabase seja usado, criar tabelas simples.

### 13.1 `portfolio_events`

```sql
create table portfolio_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

### 13.2 `portfolio_contacts`

```sql
create table portfolio_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  source text,
  created_at timestamptz not null default now()
);
```

### 13.3 `portfolio_scores`

```sql
create table portfolio_scores (
  id uuid primary key default gen_random_uuid(),
  game text not null,
  score int not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

### 13.4 Segurança

Não expor service role key no client.

Usar variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

O service role só pode ser usado no server.

---

## 14. Internacionalização

O HTML atual já possui PT/EN. A nova versão deve manter isso de forma mais organizada.

Opções:

1. Implementar sistema simples com `content/translations.ts`.
2. Usar rotas `/pt` e `/en`.
3. Usar biblioteca de i18n somente se realmente necessário.

Recomendação inicial:

Usar sistema simples, pois o projeto não precisa de complexidade excessiva.

Exemplo:

```ts
export const dictionary = {
  pt: {
    heroTitle: "Álvaro Amorim",
    heroSubtitle: "Desenvolvedor Full Stack"
  },
  en: {
    heroTitle: "Álvaro Amorim",
    heroSubtitle: "Full Stack Developer"
  }
};
```

Critérios:

- Botão de troca de idioma.
- Persistir escolha no localStorage.
- Atualizar metadados conforme idioma quando possível.
- Não duplicar componentes.

---

## 15. Tema Claro/Escuro

Manter tema claro/escuro.

Critérios:

- Detectar preferência do sistema.
- Permitir alternância manual.
- Persistir escolha.
- Não causar flash visual forte.
- Garantir contraste aceitável.
- Não depender apenas de cor para comunicar estado.

---

## 16. Design System

Criar tokens para:

- Cores.
- Tipografia.
- Espaçamentos.
- Radius.
- Sombras.
- Bordas.
- Estados de hover/focus.
- Componentes base.

Visual desejado:

- Moderno.
- Escuro por padrão.
- Profissional.
- Com estética de produto SaaS/dev tool.
- Sofisticado, mas legível.
- Sem parecer template genérico.

Referência estética:

```txt
Developer dashboard + terminal + SaaS landing page + case study técnico
```

Não usar excesso de neon, excesso de 3D ou animações poluídas.

---

## 17. Acessibilidade

Implementar:

- HTML semântico.
- Labels corretos.
- Foco visível.
- Navegação por teclado.
- `aria-label` quando necessário.
- Contraste adequado.
- Dialog acessível.
- Command palette acessível.
- Botões reais, não div clicável.
- Respeitar `prefers-reduced-motion`.

Critério obrigatório:

Se o usuário tiver `prefers-reduced-motion`, reduzir ou remover animações complexas.

---

## 18. Performance

Metas:

- Carregamento rápido.
- Imagens otimizadas.
- Componentes pesados carregados sob demanda.
- Animações sem travar.
- Evitar JavaScript desnecessário.
- Usar Server Components onde fizer sentido.
- Usar Client Components apenas quando houver interatividade real.

Regras:

- Terminal, command palette e mini-games podem ser Client Components.
- Conteúdo estático de projetos pode ser Server Component.
- Dados de projetos devem vir de arquivos locais inicialmente.
- Não chamar APIs externas no carregamento inicial sem necessidade.

---

## 19. SEO

Implementar:

- Metadata global.
- Metadata por projeto.
- Open Graph.
- Twitter cards.
- JSON-LD básico de pessoa/desenvolvedor.
- Sitemap.
- Robots.
- URLs amigáveis.
- Títulos e descrições únicos por rota.

Exemplo de título:

```txt
Álvaro Amorim — Desenvolvedor Full Stack
```

Exemplo por projeto:

```txt
MARGEM APP | Case Study — Álvaro Amorim
```

---

## 20. Currículo Tradicional

A aplicação deve ter uma rota para currículo tradicional:

```txt
/curriculo
```

Essa rota deve ser mais direta, menos experimental, útil para recrutadores.

Deve conter:

- Resumo.
- Contato.
- Skills.
- Formação.
- Certificações.
- Experiência.
- Projetos.
- Botões de PDF/DOCX.
- Versão para impressão.

Critério:

Mesmo que a home seja criativa, o recrutador deve conseguir acessar uma versão objetiva rapidamente.

---

## 21. Conteúdo Profissional Sugerido

### 21.1 Posicionamento

Usar algo como:

```txt
Desenvolvedor Full Stack focado em construir aplicações web, produtos SaaS, automações e integrações com IA.
```

### 21.2 Frase principal

```txt
Transformo ideias em aplicações funcionais, com front-end bem estruturado, back-end confiável e visão de produto.
```

### 21.3 Resumo

```txt
Sou Desenvolvedor Full Stack com experiência prática na criação de produtos digitais, dashboards administrativos, aplicações SaaS, integrações com bancos de dados, pagamentos e recursos de IA. Trabalho principalmente com TypeScript, React, Next.js, Node.js, Python, Supabase e PostgreSQL.
```

### 21.4 Tom

O texto deve ser:

- Profissional.
- Confiante.
- Direto.
- Não exagerado.
- Sem parecer gerado por IA.
- Sem prometer senioridade que não possa ser defendida.

---

## 22. Analytics Interno

Criar um painel simples opcional no futuro.

Não precisa implementar dashboard admin na primeira fase, mas deixar preparado.

Eventos úteis:

- Visualização da home.
- Visualização de projeto.
- Download de currículo.
- Clique em GitHub.
- Clique em projeto.
- Envio de contato.
- Uso do terminal.
- Pontuação nos mini-games.

Não coletar dados pessoais desnecessários.

---

## 23. Critérios de Qualidade

Antes de considerar concluído, verificar:

```bash
npm run lint
npm run typecheck
npm run build
```

Se houver testes:

```bash
npm run test
```

A aplicação precisa:

- Buildar sem erro.
- Não ter erro de TypeScript.
- Não quebrar em mobile.
- Não quebrar em tema claro.
- Não quebrar em tema escuro.
- Não quebrar com idioma PT.
- Não quebrar com idioma EN.
- Ter fallback quando Supabase não estiver configurado.
- Ter README claro.

---

## 24. Fases de Implementação

### Fase 1 — Migração Estrutural

Objetivo:

Criar base Next.js e migrar conteúdo atual.

Entregas:

- Projeto Next com TypeScript.
- Tailwind configurado.
- Layout base.
- Home inicial.
- Conteúdo separado em arquivos.
- Currículo tradicional em `/curriculo`.
- Projetos em dados estruturados.
- Tema claro/escuro.
- Responsividade.

Não implementar ainda:

- Mini-games complexos.
- Backend completo.
- Banco de dados.
- Analytics persistente.

Critério de aceite:

O conteúdo atual deve estar disponível, com visual melhorado e arquitetura limpa.

---

### Fase 2 — Case Studies

Objetivo:

Transformar projetos em páginas profissionais.

Entregas:

- `/projetos`.
- `/projetos/[slug]`.
- Página individual para cada projeto.
- Arquitetura visual.
- Problema/solução.
- Stack.
- Links.
- SEO por projeto.

Critério de aceite:

Cada projeto deve parecer um estudo de caso real, não apenas um card.

---

### Fase 3 — Interatividade Avançada

Objetivo:

Adicionar elementos que demonstrem front-end avançado.

Entregas:

- Terminal interativo.
- Command palette.
- Animações com Motion.
- Skill radar.
- Melhorias de UX.
- Atalhos de teclado.

Critério de aceite:

A aplicação deve parecer uma experiência interativa profissional.

---

### Fase 4 — Back-end Real

Objetivo:

Adicionar APIs reais.

Entregas:

- `/api/contact`.
- `/api/analytics`.
- `/api/terminal`.
- `/api/score`.
- Validação com Zod.
- Fallback sem banco.
- `.env.example`.

Critério de aceite:

O projeto deve demonstrar back-end real, mesmo que simples.

---

### Fase 5 — Developer Lab

Objetivo:

Adicionar mini-games técnicos.

Entregas:

- Debug Challenge.
- Architecture Builder.
- API Latency Game.
- Score local ou via API.
- Feedback técnico.
- Página `/lab`.

Critério de aceite:

Os mini-games devem ensinar ou demonstrar raciocínio técnico, não apenas divertir.

---

### Fase 6 — Polimento Final

Objetivo:

Preparar para divulgação.

Entregas:

- SEO final.
- OG images.
- Sitemap.
- Robots.
- README.
- Testes básicos.
- Performance.
- Acessibilidade.
- Deploy na Vercel.
- Conferência mobile.
- Conferência de links.

Critério de aceite:

O projeto deve estar pronto para ser usado em processos seletivos.

---

## 25. Prompt de Execução para o Codex

Use este prompt ao iniciar o trabalho:

```txt
Você é o responsável por transformar meu currículo digital atual em uma aplicação Next.js profissional chamada Álvaro.dev Portfolio OS.

Antes de implementar qualquer coisa, analise o HTML atual do currículo e identifique:
1. quais conteúdos precisam ser preservados;
2. quais comportamentos interativos já existem;
3. quais partes devem virar componentes;
4. quais dados devem sair do HTML e ir para arquivos estruturados;
5. qual arquitetura inicial será criada.

Objetivo do projeto:
Criar uma aplicação full stack de portfólio/currículo que demonstre habilidades reais de front-end, back-end, arquitetura, APIs, UX, animações, mini-games técnicos e organização profissional.

Siga o documento Constituição Técnica — Álvaro.dev Portfolio OS.

Regras obrigatórias:
- Não copie o HTML inteiro para um componente gigante.
- Preserve conteúdo profissional importante.
- Use Next.js, TypeScript e Tailwind.
- Crie arquitetura limpa.
- Trabalhe por fases pequenas.
- Após cada fase, rode lint/typecheck/build quando possível.
- Atualize README/documentação.
- Não invente informações profissionais falsas.
- Não remova a versão objetiva de currículo.
- Priorize responsividade, acessibilidade e performance.
- Mantenha PT/EN.
- Explique claramente o que foi implementado, quais arquivos foram alterados e quais testes foram executados.

Primeira tarefa:
Implementar apenas a Fase 1 — Migração Estrutural.
Não implemente mini-games, banco de dados ou backend completo ainda.
```

---

## 26. Checklist de Fase 1 para o Codex

```txt
[ ] Criar/ajustar projeto Next.js com TypeScript.
[ ] Configurar Tailwind.
[ ] Criar layout base.
[ ] Criar conteúdo em arquivos estruturados.
[ ] Migrar dados pessoais.
[ ] Migrar skills.
[ ] Migrar formação.
[ ] Migrar certificações.
[ ] Migrar experiências.
[ ] Migrar projetos.
[ ] Criar home inicial.
[ ] Criar rota /curriculo.
[ ] Criar componentes reutilizáveis.
[ ] Implementar tema claro/escuro.
[ ] Implementar PT/EN básico.
[ ] Manter links PDF/DOCX.
[ ] Garantir responsividade.
[ ] Rodar lint.
[ ] Rodar typecheck.
[ ] Rodar build.
[ ] Atualizar README.
```

---

## 27. Checklist de Fase 2 para o Codex

```txt
[ ] Criar /projetos.
[ ] Criar /projetos/[slug].
[ ] Criar página individual por projeto.
[ ] Criar componente ProjectCaseStudy.
[ ] Criar seção Problema.
[ ] Criar seção Solução.
[ ] Criar seção Stack.
[ ] Criar seção Arquitetura.
[ ] Criar seção Desafios Técnicos.
[ ] Criar seção O que este projeto prova.
[ ] Adicionar metadata por projeto.
[ ] Testar rotas inválidas.
[ ] Rodar lint/typecheck/build.
[ ] Atualizar README.
```

---

## 28. Checklist de Fase 3 para o Codex

```txt
[ ] Criar terminal interativo.
[ ] Criar comandos help/whoami/stack/projects/contact/clear.
[ ] Criar command palette.
[ ] Criar atalho Ctrl+K.
[ ] Criar animações com Motion.
[ ] Criar Skill Radar.
[ ] Respeitar prefers-reduced-motion.
[ ] Testar mobile.
[ ] Rodar lint/typecheck/build.
[ ] Atualizar README.
```

---

## 29. Checklist de Fase 4 para o Codex

```txt
[ ] Criar /api/contact.
[ ] Criar /api/analytics.
[ ] Criar /api/terminal.
[ ] Criar /api/score.
[ ] Criar schemas Zod.
[ ] Criar fallback sem Supabase.
[ ] Criar .env.example.
[ ] Documentar variáveis.
[ ] Não expor service role no client.
[ ] Rodar lint/typecheck/build.
[ ] Atualizar README.
```

---

## 30. Checklist de Fase 5 para o Codex

```txt
[ ] Criar rota /lab.
[ ] Criar Debug Challenge.
[ ] Criar Architecture Builder.
[ ] Criar API Latency Game.
[ ] Criar sistema de pontuação.
[ ] Criar feedback técnico.
[ ] Integrar /api/score se existir.
[ ] Testar mobile.
[ ] Rodar lint/typecheck/build.
[ ] Atualizar README.
```

---

## 31. Checklist de Fase 6 para o Codex

```txt
[ ] Revisar SEO.
[ ] Criar sitemap.
[ ] Criar robots.
[ ] Criar metadata por rota.
[ ] Criar OG images se possível.
[ ] Revisar acessibilidade.
[ ] Revisar performance.
[ ] Revisar responsividade.
[ ] Conferir links.
[ ] Conferir downloads.
[ ] Conferir PT/EN.
[ ] Conferir tema claro/escuro.
[ ] Rodar lint/typecheck/build.
[ ] Atualizar README final.
```

---

## 32. Definição de Pronto

O projeto só deve ser considerado pronto quando:

- A aplicação estiver em Next.js.
- O conteúdo atual estiver preservado.
- A arquitetura estiver componentizada.
- A home estiver mais impactante que o currículo atual.
- Houver rota objetiva de currículo.
- Houver rota de projetos/case studies.
- Houver interatividade real.
- Houver pelo menos uma demonstração de back-end.
- Houver documentação.
- Build estiver passando.
- Mobile estiver bom.
- Tema claro/escuro funcionando.
- PT/EN funcionando.
- Links funcionando.
- PDF/DOCX disponíveis.
- O projeto estiver pronto para ser enviado em processo seletivo.

---

## 33. Observação Final

Este projeto deve ser construído com equilíbrio.

A página precisa impressionar, mas não pode parecer exagerada ou confusa.

O visitante deve entender rapidamente:

1. Quem é Álvaro.
2. O que ele sabe construir.
3. Quais projetos ele já desenvolveu.
4. Como acessar os projetos.
5. Como entrar em contato.
6. Que a própria página é uma demonstração técnica.

A melhor versão deste projeto é aquela em que o recrutador pensa:

> “Esse candidato não apenas listou tecnologias. Ele construiu uma experiência completa para provar que sabe usá-las.”
