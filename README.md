# Álvaro.dev Portfolio OS

Portfólio profissional de Álvaro Amorim construído em Next.js. O produto reúne uma home interativa, currículo, projetos em formato de case study e um Developer Arcade com quatro jogos e ranking persistente.

Este README descreve o estado versionado do repositório. Histórico de decisões, planos e infraestrutura externa não devem ser confundidos com funcionalidade concluída ou validação reproduzível.

## Snapshot da auditoria

Baseline usado na auditoria estrutural iniciada em 12/07/2026:

```txt
branch: main
commit: b72236baf3e90c0dbdb1fdb04d115e6ba8c624e6
message: style: update custom cursor assets
```

A Fase 1 foi executada na branch:

```txt
refactor/foundation-stabilization
```

Pull Request:

```txt
#1 refactor: stabilize portfolio foundation
```

## Estado confirmado no código

- Next.js App Router, React, TypeScript, Tailwind CSS, Zod e Supabase.
- Rotas públicas principais: `/`, `/projetos`, `/projetos/[slug]`, `/lab` e `/curriculo`.
- A Home possui carrossel de projetos, stack, processo, chamada para o Arcade, seção Sobre e CTA final.
- O Developer Arcade possui Runtime Runner, Bug Maze, Code Snake e Stack Tetris.
- `/api/score` valida o Score Contract v2 e persiste scores em `arcade_scores` por Route Handler server-side.
- `/api/player-session` mantém uma sessão anônima em cookie `httpOnly` e persiste somente um hash HMAC em `arcade_sessions`.
- `/api/leaderboard` usa RPC para retornar o melhor score de cada jogador por jogo e período.
- `/api/leaderboard/me` retorna a posição do jogador atual sem expor `session_hash` ou ids internos.
- O navegador não acessa diretamente as tabelas do Arcade; a service role permanece no servidor.
- RLS está habilitado e os privilégios diretos de `anon` e `authenticated` foram revogados para as tabelas do Arcade.
- `/api/contact` e `/api/analytics` ainda operam em modo local/mock e não persistem dados em produção.
- `/api/health` informa ambiente e commit quando a plataforma disponibiliza essas informações.
- PDFs e DOCX estão em `public/resume/`.
- A imagem de perfil está em `public/profile/`.
- Metadata, sitemap, robots e página de not-found estão implementados.
- Existe um cursor customizado para dispositivos com mouse preciso.
- CI executa lint, typecheck, testes e build em Pull Requests para `main`.

## Limites atuais

O código versionado não comprova sozinho o estado da infraestrutura externa. Antes de declarar produção estável, devem ser verificados:

- commit efetivamente publicado pela Vercel;
- variáveis de ambiente configuradas no deploy;
- conectividade com o Supabase remoto;
- migrations, grants e RLS efetivamente aplicados;
- sessão, score e leaderboard em produção;
- downloads e links públicos;
- comportamento em dispositivos móveis reais;
- acessibilidade, performance e experiência visual.

URL pública atual:

```txt
https://curriculum-vitae-babr.vercel.app
```

## Developer Arcade e ranking

### Implementado

- cada submission válida gera uma linha histórica em `arcade_scores`;
- o leaderboard público seleciona o melhor score de cada sessão anônima;
- a posição pessoal também é calculada sobre jogadores únicos;
- os períodos suportados são `all`, `month` e `week`;
- os jogos válidos são `runtime`, `bug-maze`, `code-snake` e `stack-tetris`;
- aliases são validados e não podem conter e-mail, URL, telefone ou caracteres de controle;
- respostas públicas não expõem hash da sessão, cookie bruto, ids internos ou chaves.

### Pendente

- criação de sessão totalmente atômica para requisições simultâneas;
- endpoint agregado de bootstrap do Arcade;
- redução de escritas desnecessárias em `last_seen_at`;
- rate limit funcional;
- identificador de partida, nonce e proteção contra replay;
- validação mais forte contra scores fabricados pelo cliente;
- retenção ou limpeza planejada do histórico;
- testes automatizados dos contratos e fluxos críticos do Arcade.

## Conteúdo e projetos

A página `/projetos` usa `src/content/projects.ts` como catálogo principal. A Home usa estruturas extraídas para copy, ícones e apresentação dos projetos em:

```txt
src/content/home-copy.ts
src/content/home-projects.ts
src/components/visual-final-candidate/home-icons.tsx
```

A consolidação completa entre apresentação da Home e catálogo de cases permanece como refinamento futuro, porque exige revisão visual e de conteúdo projeto a projeto.

Os projetos usam placeholders honestos enquanto imagens reais não estiverem disponíveis:

```txt
thumbnail: null
heroImage: null
gallery: []
```

Screenshots, métricas ou resultados não devem ser inventados.

## Rotas

```txt
/                         Home
/projetos                 Índice de projetos
/projetos/[slug]          Case study de cada projeto
/lab                      Developer Arcade
/curriculo                Currículo e downloads

/api/health               Health check
/api/contact              Contato local/mock
/api/analytics            Analytics local/mock
/api/terminal             Comandos permitidos do terminal
/api/player-session       Sessão anônima do Arcade
/api/score                Persistência de Score Contract v2
/api/leaderboard          Ranking por melhor score de jogador único
/api/leaderboard/me       Posição do jogador atual

/sitemap.xml              Sitemap
/robots.txt               Robots
```

A rota experimental duplicada `/visual-final-candidate` foi removida. O componente visual continua sendo a implementação oficial da Home.

## Stack

- Next.js 16.2.6
- React 19.2.6
- React DOM 19.2.6
- TypeScript 6.0.3
- Tailwind CSS 4.3.0
- Zod 4
- Supabase JS 2
- ESLint 9
- npm com `package-lock.json`

## Como executar localmente

```powershell
npm install
npm run dev
```

Rotas locais principais:

```txt
http://localhost:3000
http://localhost:3000/projetos
http://localhost:3000/lab
http://localhost:3000/curriculo
```

## Variáveis de ambiente

Use `.env.example` como referência. Valores reais devem existir somente em `.env.local` ou no ambiente de deploy.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ARCADE_SESSION_SECRET=
```

Regras:

- `SUPABASE_SERVICE_ROLE_KEY` e `ARCADE_SESSION_SECRET` são server-only;
- nenhum segredo pode usar prefixo `NEXT_PUBLIC_`;
- o projeto não usa anon key no navegador para acessar o Arcade;
- valores reais não devem ser versionados;
- credenciais futuras de provedores de IA só poderão ser introduzidas em uma fase específica de segurança.

## Scripts

```powershell
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run validate:foundation
npm run start
```

`npm run validate:foundation` depende de uma aplicação em execução. A variável opcional `PORTFOLIO_BASE_URL` permite apontar o script para outra origem.

## Banco versionado

Migrations principais do Arcade:

```txt
supabase/migrations/20260608154425_arcade_scores_foundation.sql
supabase/migrations/20260608222025_arcade_service_role_grants.sql
supabase/migrations/20260609192453_arcade_public_role_grants_hygiene.sql
supabase/migrations/20260622113650_arcade_unique_player_leaderboard.sql
```

Supabase operacional documentado:

```txt
project: curriculo
project ref: dgtwxzznoszrhflblddn
project URL: https://dgtwxzznoszrhflblddn.supabase.co
```

O ref anterior `fkiuecyohcyjwygedncx` está abandonado e deve aparecer somente em registros históricos.

Consulte `docs/arcade-db-foundation.md` para o desenho operacional do Arcade.

## Fase 1 — estabilização da fundação

Concluída com:

- documentação e textos alinhados ao estado real;
- validação de fundação atualizada;
- rota experimental duplicada removida;
- filtros de projetos normalizados e testados;
- CI adicionada;
- código morto confirmado removido;
- Home parcialmente modularizada sem alterar o visual aprovado;
- exemplo de ambiente simplificado e sem chave pública não utilizada.

Relatório detalhado:

```txt
docs/foundation-stabilization-audit.md
```

## Próximas fases aprovadas

### Fase 2 — estabilidade do Arcade e banco

```txt
fix/arcade-data-stability
```

- sessão atômica;
- bootstrap agregado;
- menos requisições e escritas;
- tratamento parcial de falhas;
- rate limit inicial;
- proteção contra replay;
- tipos do Supabase gerados do schema.

### Fase 3 — repaginação do Lab

```txt
feat/lab-redesign
```

Refatoração e redesign mantendo inicialmente as regras dos quatro jogos.

### Fase 4 — Sobre e contatos

```txt
feat/about-contact
```

Ampliação da seção Sobre com apresentação, trajetória, disponibilidade, contatos e links diretos.

### Fase 5 — testes e CI ampliados

```txt
test/project-foundation
```

A CI inicial já existe. Essa fase amplia cobertura para Arcade, APIs e autorização futura.

### Fase 6 — Admin MVP

```txt
feat/admin-mvp
```

A área administrativa será iniciada somente depois que conteúdo, contratos e dados estiverem centralizados e testáveis.

## Roadmap posterior

- autenticação e autorização administrativa;
- audit log e estados de publicação;
- Supabase Storage para imagens;
- editor e preview PT/EN;
- histórico de versões e rollback;
- GitHub App com leitura de menor privilégio;
- análise seletiva de repositórios por IA;
- credenciais criptografadas para provedores externos;
- analytics persistente;
- imagens reais dos projetos;
- SEO indexável por idioma.

## Coordenação de trabalho

O projeto pode ser mantido pelo ChatGPT conectado ao GitHub e pelo Codex local, mas não deve receber edições simultâneas.

Antes de editar:

1. trabalhar a partir do estado mais recente da branch principal;
2. confirmar que não há outro agente alterando os mesmos arquivos;
3. limitar cada commit a um escopo específico;
4. preservar mudanças existentes;
5. nunca usar force push como fluxo normal;
6. executar `lint`, `typecheck`, `test` e `build` para mudanças de código.

## Histórico e documentação

- `constituicao_alvaro_dev_portfolio_os.md` preserva decisões, fases antigas e critérios históricos.
- `docs/arcade-db-foundation.md` documenta a fundação de dados do Arcade.
- `docs/foundation-stabilization-audit.md` documenta a auditoria e as decisões da Fase 1.
- O histórico real de implementação deve ser consultado em `git log`.

Em caso de divergência, a ordem de confiança é:

1. código e migrations versionados;
2. validação local reproduzível;
3. validação externa da infraestrutura;
4. documentação atual;
5. registros históricos.
