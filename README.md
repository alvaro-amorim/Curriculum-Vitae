# Álvaro.dev Portfolio OS

Portfólio profissional de Álvaro Amorim construído em Next.js. O produto reúne uma home interativa, currículo tradicional, projetos em formato de case study e um Developer Arcade com quatro jogos.

Este README descreve o estado versionado do repositório. Histórico de decisões não deve ser confundido com funcionalidade concluída nem com validação de produção.

## Estado confirmado do repositório

Baseline documental desta Fase 0:

```txt
branch: main
commit: 7ab0ae09d5bd25746f245460fed87ca9ff3247e8
message: feat: tune runtime runner progression
```

Confirmado no código:

- A aplicação usa Next.js App Router, React e TypeScript.
- `/`, `/projetos`, `/projetos/[slug]`, `/lab` e `/curriculo` são as rotas públicas principais.
- `/visual-final-candidate` permanece acessível como rota experimental de comparação.
- O Developer Arcade possui Runtime Runner, Bug Maze, Code Snake e Stack Tetris.
- `/api/score` valida o Score Contract v2 e persiste submissions em `arcade_scores` por um Route Handler server-side.
- `/api/player-session` mantém uma sessão anônima em cookie `httpOnly` e persiste o hash HMAC em `arcade_sessions`.
- `/api/leaderboard` e `/api/leaderboard/me` retornam DTOs sanitizados sem expor `session_hash` ou ids internos.
- O navegador consome apenas Route Handlers; a service role do Supabase permanece no servidor.
- `/api/contact` e `/api/analytics` ainda operam em modo local/mock.
- `/api/health` informa o ambiente por `VERCEL_ENV` ou `NODE_ENV` e inclui o commit abreviado quando a Vercel o disponibiliza.
- PDFs e DOCX estão preservados em `public/resume/`.
- A imagem de perfil está em `public/profile/`.
- Metadata, sitemap, robots e página de not-found estão implementados.
- Não existe script formal de testes automatizados no `package.json`.

## Limites do estado atual

O código versionado não comprova, por si só, o estado da infraestrutura externa.

Precisam de validação externa antes de qualquer declaração de produção:

- commit efetivamente publicado pela Vercel;
- variáveis de ambiente configuradas na Vercel;
- conectividade das APIs persistentes com o Supabase remoto;
- migrations e grants efetivamente aplicados no projeto remoto;
- funcionamento público de sessão, score e leaderboard;
- comportamento em dispositivo móvel real;
- acessibilidade, performance e experiência visual em produção;
- links e downloads públicos.

A URL prevista para metadata e validação é:

```txt
https://curriculum-vitae-babr.vercel.app
```

Ela não deve ser tratada como validada apenas por estar documentada aqui.

## Developer Arcade e ranking

O Arcade possui persistência server-side, mas o ranking atual ainda não representa um ranking final por jogador único.

Estado implementado:

- cada submission válida gera uma linha em `arcade_scores`;
- o leaderboard ordena linhas por score e data;
- a posição pessoal usa o melhor score da sessão, mas calcula a posição contando linhas de score;
- o alias também é copiado para a linha do score no momento da submission;
- os períodos suportados são `all`, `month` e `week`;
- o contrato aceita apenas `runtime`, `bug-maze`, `code-snake` e `stack-tetris`.

Limitações conhecidas para uma fase posterior:

- um jogador pode ocupar mais de uma posição com submissions diferentes;
- a posição pessoal não é calculada sobre jogadores únicos;
- alterar o alias da sessão não reescreve aliases copiados para scores anteriores;
- o cliente ainda pode fabricar payloads estruturalmente válidos;
- não há rate limit funcional, assinatura de rodada, nonce ou proteção contra replay;
- balanceamento e integridade do ranking ainda exigem dados e QA adicionais.

Essas limitações são roadmap. Esta Fase 0 não altera API, banco, contrato ou ranking.

## Projetos e mídia

Existem seis projetos em `src/content/projects.ts`. Todos ainda usam:

```txt
thumbnail: null
heroImage: null
gallery: []
```

A interface mantém placeholders honestos enquanto imagens reais não existem. Screenshots, métricas ou resultados não devem ser inventados.

## O que ainda é roadmap

Os itens abaixo não estão implementados:

- área administrativa e rota `/admin`;
- autenticação administrativa com Supabase Auth;
- Supabase Storage para imagens;
- GitHub App e sincronização de repositórios;
- seleção de projetos importados do GitHub;
- pipeline de análise de repositório por IA;
- geração de copy PT/EN por IA;
- editor, preview, publicação e histórico de versões;
- cadastro de credenciais de provedores de IA;
- criptografia de credenciais com `AI_CREDENTIALS_MASTER_KEY` e AES-256-GCM;
- rate limit e antiabuso robusto;
- analytics persistente;
- imagens reais dos projetos;
- ranking final por melhor score de jogador único.

## Rotas

```txt
/                         Home
/?boot=1                  Home com sequência de boot forçada
/visual-final-candidate   Comparação visual experimental preservada
/projetos                 Índice de projetos
/projetos/[slug]          Case study de cada projeto
/lab                      Developer Arcade
/curriculo                Currículo e downloads

/api/health               Health check atual
/api/contact              Contato local/mock
/api/analytics            Analytics local/mock
/api/terminal             Comandos permitidos do terminal
/api/player-session       Sessão anônima do Arcade
/api/score                Persistência de Score Contract v2
/api/leaderboard          Top submissions sanitizadas por jogo
/api/leaderboard/me       Posição da sessão atual

/sitemap.xml              Sitemap
/robots.txt               Robots
```

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ARCADE_SESSION_SECRET=
```

Regras:

- `SUPABASE_SERVICE_ROLE_KEY` e `ARCADE_SESSION_SECRET` são server-only;
- nenhum segredo pode usar prefixo `NEXT_PUBLIC_`;
- valores reais não devem ser versionados;
- a futura `AI_CREDENTIALS_MASTER_KEY` ainda não existe e só deve ser introduzida na fase aprovada de credenciais criptografadas.

## Scripts

```powershell
npm run dev
npm run lint
npm run typecheck
npm run build
npm run validate:foundation
npm run start
```

`npm run validate:foundation` depende de uma aplicação em execução. A variável opcional `PORTFOLIO_BASE_URL` permite apontar o script para outra origem.

Não há script `test` formal no estado atual.

## Banco versionado

Migrations presentes no repositório:

```txt
supabase/migrations/20260608154425_arcade_scores_foundation.sql
supabase/migrations/20260608222025_arcade_service_role_grants.sql
supabase/migrations/20260609192453_arcade_public_role_grants_hygiene.sql
```

Elas definem `arcade_sessions`, `arcade_scores`, RLS e grants server-side.

Supabase operacional atual, validado em 22/06/2026:

```txt
project: curriculo
account/organization: alvaroamorimom.jf@gmail.com
project ref: dgtwxzznoszrhflblddn
project URL: https://dgtwxzznoszrhflblddn.supabase.co
```

As três migrations acima foram aplicadas ao projeto novo e as APIs persistentes `/api/player-session`, `/api/leaderboard` e `/api/leaderboard/me` voltaram a responder em produção. O ref anterior `fkiuecyohcyjwygedncx` está abandonado/não localizado e permanece apenas em registros históricos. Ranking por jogador único, rate limit e antiabuso continuam pendentes.

Consulte `docs/arcade-db-foundation.md` para o desenho operacional do Arcade.

## Critérios para produção

Antes de considerar o site pronto:

1. Confirmar o commit publicado e as variáveis da Vercel.
2. Validar migrations, grants e RLS no Supabase remoto.
3. Validar sessão, score e leaderboard por HTTP em produção.
4. Corrigir o health check para representar o ambiente real.
5. Corrigir o ranking para melhor score por jogador único.
6. Implementar rate limit e controles antiabuso proporcionais.
7. Criar testes automatizados para contratos e fluxos críticos.
8. Adicionar imagens reais e revisar todos os projetos.
9. Validar mobile, PT/EN, temas, teclado e reduced motion.
10. Executar lint, typecheck, build, testes e smoke tests públicos.
11. Revisar headers de segurança, SEO, acessibilidade e performance.
12. Obter aprovação visual humana antes do fechamento final.

## Roadmap futuro

O roadmap é sequencial e não representa funcionalidade concluída:

1. **Fase 0 — documentação e estrutura:** alinhar documentação ao código e separar estado, histórico e futuro.
2. **Fase 1 — estabilização:** validar produção, corrigir Arcade persistente, ranking, antiabuso, testes e observabilidade.
3. **Fase 2 — Admin protegido:** autenticação, autorização, RLS, audit log e estados de publicação.
4. **Fase 3 — GitHub:** GitHub App, seleção de repositórios e leitura com menor privilégio.
5. **Fase 4 — IA:** provedores configuráveis, credenciais criptografadas, análise seletiva e rascunhos com evidências.
6. **Fase 5 — editor e imagens:** edição PT/EN, Storage, mídia, preview, versionamento e rollback.
7. **Fase 6 — integração pública:** conteúdo publicado, cache, revalidação e migração dos projetos atuais.
8. **Fase 7 — acabamento premium:** mídia real, storytelling, motion, mobile, acessibilidade, performance e QA final.

## Coordenação de trabalho

O projeto pode ser mantido por ChatGPT conectado ao GitHub e Codex local, mas nunca com edições simultâneas.

- ChatGPT: auditoria remota, documentação, planejamento e mudanças pequenas previamente autorizadas.
- Codex: implementação estrutural, segurança, APIs, banco, migrations, Auth, Storage, GitHub, IA e validações locais.
- Proprietário: coordenação do agente ativo, aprovação de escopo, decisões de produto, configuração externa e validação visual.

Antes de editar:

1. confirmar que não há outro agente trabalhando;
2. atualizar e verificar a branch principal;
3. inspecionar o worktree;
4. limitar o commit ao escopo autorizado;
5. não reverter mudanças alheias.

## Histórico e documentação

- `constituicao_alvaro_dev_portfolio_os.md` preserva decisões, fases antigas, direção visual e critérios históricos.
- `docs/arcade-db-foundation.md` documenta a fundação de dados do Arcade.
- O histórico real de implementação deve ser consultado em `git log`.

Em caso de divergência, a ordem de confiança é:

1. código e migrations versionados;
2. validação local reproduzível;
3. validação externa da infraestrutura;
4. documentação atual;
5. registros históricos.
