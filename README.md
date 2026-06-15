# Álvaro.dev Portfolio OS

Portfólio profissional de Álvaro Amorim em Next.js, com home premium, projetos em formato de case study, currículo tradicional preservado e Developer Lab em replanejamento para um arcade final mais forte.

O projeto deixou de ser apenas um currículo digital e passou a funcionar como uma demonstração prática de front-end, arquitetura de interface, motion, acessibilidade, SEO, conteúdo estruturado e APIs locais seguras.

## Estado Atual

Checkpoint atual publicado:

```txt
e69e771 feat: enhance motion system and mobile arcade
```

Estado real do produto após a revisão humana que abriu a R1-E.9.3.0:

- A home oficial `/` usa a experiência visual premium aprovada.
- `/visual-final-candidate` continua preservada temporariamente como rota de comparação.
- `/projetos` foi elevado para hub premium de projetos.
- `/projetos/[slug]` foi elevado para case study visual premium.
- `/lab` agora reúne os quatro jogos finais jogáveis do Developer Arcade.
- Runtime Runner, Bug Maze, Code Snake e Stack Tetris formam a vitrine jogável atual do Developer Arcade.
- Debug Arena e Latency Lab não devem continuar como jogos finais principais: ainda parecem quiz/teste e dashboard/formulário em uso real.
- Os módulos antigos de quiz/foundation continuam úteis como treino, mas não devem ser vendidos como jogos finais.
- `/curriculo` continua preservado para leitura objetiva e downloads.
- PDFs e DOCX continuam em `public/resume/`.
- A imagem de perfil continua em `public/profile/`.
- SEO básico, metadata por rota, sitemap e robots estão implementados.
- R1-E.9.6 foi checkpointada em `69cc377` com QA final documental do Developer Arcade.
- R1-E.9.1 e R1-E.9.2 foram hardening local sem checkpoint.
- R1-E.9.3.1.1/R1-E.9.3.1.2 foram checkpointadas em `1d8cf1b` com navbar premium, tema claro real, transições, currículo polido e contraste light.
- R1-E.9.3.2 foi checkpointada em `4ececc9` com o reset da direção do Arcade.
- R1-E.9.4/R1-E.9.4.1 foram checkpointadas em `9bcf7a3` com Code Snake como terceiro jogo final.
- R1-E.9.5/R1-E.9.5.1 foram checkpointadas em `73b3d69` com Stack Tetris como quarto jogo final.
- R1-F.0 foi checkpointada em `9adaa48` com o planejamento do Admin de Imagens.
- R1-E.10.0 foi checkpointada em `febd33c` com a estratégia de polish público antes da R1-F.1.
- R1-E.10.1 foi checkpointada em `31e7306` com clean UI pass e Smart Navbar funcional.
- R1-E.10.2 foi checkpointada em `4fc0581` com Arcade Hub, um jogo ativo por vez e Game Focus Mode desktop/mobile.
- R1-E.10.3/R1-E.10.3.1 foram checkpointadas em `fce20dd` com Bug Maze expandido, gestos mobile nos quatro jogos e calibração de densidade do Lab sem `zoom` global.
- R1-E.10.4 foi checkpointada em `18f38f2` com walls on/off no Code Snake, polish visual leve de Runtime Runner/Stack Tetris e limpeza da UI principal do Lab.
- R1-E.10.5/R1-E.10.5.1/R1-E.10.5.2 foram checkpointadas em `e69e771` com Signature Motion & Interaction System, transições fortes de rota/tema/idioma e polish mobile do Arcade para teste real em celular.
- R1-E.11.0 foi executada como auditoria geral sem alterações no worktree.
- O projeto ainda não deve ser tratado como fechamento final enquanto Admin de Imagens, storage real e mídia real dos projetos estiverem pendentes.

## Auditoria R1-E.11.0

A auditoria confirmou que o site público está em estado avançado, mas ainda não final. Home, projetos/cases, currículo, Lab, Smart Navbar, motion/transições e Arcade estão fortes; ainda faltam limpeza cautelosa, QA real, imagens reais dos projetos e Admin de Imagens.

Estado das rotas:

- `/`, `/projetos`, `/projetos/[slug]`, `/lab` e `/curriculo` são as rotas públicas principais.
- `/curriculo` está aprovado e deve ser preservado sem redesign salvo solicitação explícita.
- `/visual-final-candidate` é rota experimental/legada de comparação; avaliar remoção ou arquivamento futuro com cautela.
- `/admin` não existe.
- APIs existentes combinam foundations locais e rotas persistentes do Arcade: `/api/health`, `/api/score`, `/api/leaderboard`, `/api/leaderboard/me`, `/api/player-session`, `/api/contact`, `/api/analytics` e `/api/terminal`.

Componentes legados do Lab tratados pela limpeza R1-E.11.3:

- `debug-arena.tsx` removido na R1-E.11.3.8.
- `latency-lab.tsx` removido na R1-E.11.3.8.

R1-E.11.3.3 removeu os módulos legados zero-import `api-latency-game.tsx`, `architecture-builder.tsx`, `debug-challenge.tsx`, `interactive-terminal.tsx` e `skill-radar.tsx`. A rota `/visual-final-candidate` continua preservada para fase própria.

R1-E.11.3.6 definiu a estratégia de depreciação e R1-E.11.3.7 documentou `DebugArena` e `LatencyLab` como deprecated. R1-E.11.3.8 removeu os componentes `debug-arena.tsx` e `latency-lab.tsx`. R1-E.11.3.9 removeu o CSS `.arena*`/`.latency*`. R1-E.11.3.10 removeu a compatibilidade legada de score/types/validators/API: `/api/score` agora aceita apenas os quatro jogos finais.

Ruídos e cuidados:

- `.next/`, `node_modules/`, logs `.next-dev*`, logs `.next-start*` e `tsconfig.tsbuildinfo` são artefatos locais ignorados.
- `next-env.d.ts` é versionado pelo Next e não deve ser removido.
- R1-E.11.2 removeu `imagem.png` da raiz após confirmar que era duplicata byte-a-byte de `public/profile/imagem.png` e que o código usa `/profile/imagem.png`.
- Não remover `/visual-final-candidate`, módulos antigos do Lab ou CSS aparentemente órfão sem fase própria e validação.

## Rotas Principais

```txt
/                         Home premium
/?boot=1                  Home com loading cinematográfico forçado
/visual-final-candidate   Rota preservada de comparação visual
/projetos                 Hub premium de projetos
/projetos/[slug]          Case studies premium
/lab                      Developer Arcade
/curriculo                Currículo tradicional e downloads
/api/health               Health check local
/api/score                Score persistente no Supabase via Route Handler server-side
/api/leaderboard          Ranking público sanitizado por jogo
/api/leaderboard/me       Posição da sessão anônima atual
/sitemap.xml              Sitemap
/robots.txt               Robots
```

## Developer Arcade — Direção Revisada

A revisão humana da R1-E.9.3.0 redefiniu os jogos finais desejados:

1. Runtime Runner / Bug Runner.
2. Bug Maze.
3. Code Snake.
4. Stack Tetris.

Estado atual:

- Runtime Runner, Bug Maze, Code Snake e Stack Tetris existem como jogos principais jogáveis.
- Debug Arena está deprecated, com componente, CSS e contrato de score removidos; não deve voltar como jogo final.
- Latency Lab está deprecated, com componente, CSS e contrato de score removidos; não deve voltar como jogo final.
- Quiz/foundation challenge não é jogo final.

Desde a R1-E.9.3.2, o `/lab` não deve vender Debug Arena, Latency Lab e quiz/foundation como jogos principais. Depois da R1-E.11.3.10, Debug Arena e Latency Lab seguem apenas como histórico deprecated sem componentes ativos, sem CSS dedicado e sem ids aceitos no contrato ativo de score.

## Interface, Motion e Navegação

A home premium foi aprovada como direção e a navegação global já recebeu um checkpoint de polish:

```txt
1d8cf1b feat: polish premium ui theme and transitions
```

Esse checkpoint consolidou navbar/topbar premium, navegação direta da home, tema claro real, transições entre páginas/tema/idioma, lazy/defer seguro e `/curriculo` mais alinhado ao Portfolio OS. A etapa atual não reabre esse escopo salvo regressão visual.

## Projetos e Case Studies

Os projetos usam conteúdo real e placeholders visuais honestos enquanto screenshots reais ainda não existem.

Quando uma imagem ainda está pendente, a interface informa isso explicitamente:

- PT: "Imagem do projeto em preparação"
- EN: "Project image in preparation"

Não há screenshots falsos, métricas inventadas, clientes inventados ou resultados artificiais.

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
http://localhost:3000/projetos
http://localhost:3000/lab
http://localhost:3000/curriculo
```

## Scripts

```powershell
npm run lint
npm run typecheck
npm run build
npm run validate:foundation
npm run start
```

`npm run typecheck` executa `tsc --noEmit`.

## APIs

As APIs atuais validam entrada e retornam respostas padronizadas. O Arcade já usa persistência real server-side para score e ranking, sem acesso direto do client ao Supabase.

Rotas existentes:

```txt
/api/health
/api/contact
/api/analytics
/api/terminal
/api/score
/api/leaderboard
/api/leaderboard/me
/api/player-session
```

`/api/score` aceita os jogos finais do Developer Arcade:

```txt
runtime
bug-maze
code-snake
stack-tetris
```

Ids legados removidos do contrato ativo e agora rejeitados:

```txt
debug-arena
latency-lab
debug
architecture
latency
terminal
portfolio
```

Esse contrato reflete a implementação atual. `debug-arena`, `latency-lab`, `debug`, `architecture`, `latency`, `terminal` e `portfolio` não são mais game ids válidos para `/api/score`. A rota `/api/terminal` continua existindo separadamente e `terminal` não é mais score game id.

Contrato atual esperado:

- `GET /api/score`: retorna `405`.
- `POST /api/score` válido: retorna `202`.
- `POST /api/score` inválido: retorna `400`.
- O contrato ativo é `v2` e exige `durationMs`, `gameVersion` e `metadata` validável por jogo.
- O retorno válido persiste em `arcade_scores`, segue `contractVersion: "v2"` e retorna `mode: "persistent"`.
- `GET /api/leaderboard?game=<id>&period=all|month|week&limit=10`: retorna top scores sanitizados, sem `session_hash` ou ids internos.
- `GET /api/leaderboard/me`: retorna alias público e posição da sessão anônima atual por jogo, sem expor hash.

Game versions atuais:

```txt
runtime@2.0.0
bug-maze@2.0.0
code-snake@2.0.0
stack-tetris@2.0.0
```

Exemplo v2:

```powershell
curl.exe --% -X POST http://localhost:3000/api/score -H "Content-Type: application/json" -d "{\"game\":\"runtime\",\"score\":85,\"durationMs\":12000,\"gameVersion\":\"runtime@2.0.0\",\"deviceType\":\"desktop\",\"metadata\":{\"distance\":1800,\"cleared\":8,\"maxSpeed\":24.4,\"stageReached\":\"staging\",\"collisions\":1}}"
```

## O Que Ainda Não Existe

Não marcar como concluído:

- Analytics persistente real.
- Admin dashboard.
- Autenticação.
- Requests externos para jogos.
- Provider/LLM em jogos.
- Screenshots reais dos projetos.
- Admin de imagens dos projetos.
- Deploy manual nesta fase.

## Fase Obrigatória em Planejamento: R1-F

R1-F — Project Assets Admin / Project Media Manager ainda não existe como implementação. A R1-F.0 é apenas auditoria e planejamento técnico para essa área.

Escopo previsto:

- Página admin protegida.
- Cadastro/upload de imagens reais dos projetos.
- Edição de thumbnail, hero image e galeria.
- Integração com a estrutura `visuals` de `src/content/projects.ts`.
- Armazenamento real, provavelmente Supabase Storage/Auth ou solução equivalente.
- Preservação dos placeholders honestos enquanto imagens reais não existirem.
- Nenhum screenshot falso.

O projeto Supabase básico foi criado manualmente. A R1-E.12.3 aplicou a migration versionada de fundação de scores no projeto remoto `fkiuecyohcyjwygedncx`, a R1-E.12.4 adicionou sessão anônima, a R1-E.12.5 tornou `/api/score` persistente e a R1-E.12.6 adicionou leaderboard público sanitizado via Route Handlers server-side. A R1-E.12.7A adiciona higiene defensiva de grants para manter roles públicas sem acesso direto às tabelas Arcade. Storage, Auth e Admin continuam fora do runtime atual.

R1-F.0 não cria `/admin`, storage, banco, autenticação ou upload. A implementação deve começar somente em R1-F.1 ou fase posterior aprovada.

Roadmap proposto:

- R1-F.0 — Project Assets Admin Planning: auditoria, plano técnico, segurança e UX, sem implementação.
- R1-F.1 — Protected Admin Shell: criar `/admin` protegido e layout base, ainda sem upload real.
- R1-F.2 — Project Media Data Model: decidir persistência e manter fallback para `projects.ts`/placeholders.
- R1-F.3 — Upload & Storage Integration: integrar Supabase Storage/Auth ou alternativa aprovada.
- R1-F.4 — Project Media Manager UI: editor por projeto para thumbnail, hero, galeria, alt PT/EN e status.
- R1-F.5 — Public Rendering Integration: consumir imagens reais quando existirem e manter placeholders quando não existirem.
- R1-F.6 — Admin QA & Security Gate: validar auth, upload, permissões, produção e documentação.

## Fase Atual: R1-E.12.8

R1-E.12.8 — Runtime Runner Balance & Progression inicia o balanceamento por jogo com uma fatia estreita no Runtime Runner.

Objetivo da rodada atual:

- Adicionar marcos visuais de fase no Runtime Runner.
- Ajustar progressão de velocidade/cadência sem alterar a fórmula pública de score.
- Enviar `nearMisses` opcional no metadata v2 do Runtime Runner.
- Não alterar banco, leaderboard, gameVersion, Admin, Storage, Upload, CMS, Auth permanente ou outros jogos nesta rodada.

Snapshot agregado de QA da R1-E.12.7:

- `arcade_sessions`: 19 registros.
- `arcade_scores`: 10 registros.
- Runtime Runner: 4 scores, faixa 80-99.
- Bug Maze: 2 scores, faixa 91-91.
- Code Snake: 2 scores, faixa 73-73.
- Stack Tetris: 2 scores, faixa 65-65.

R1-E.12.8 usa esse snapshot apenas como baseline. O contrato continua `runtime@2.0.0`, e o ranking existente permanece comparável porque a fórmula pública de score não foi alterada.

## Plano Atual de Fases

```txt
R1-E.9.3.0 — Arcade Replan, Navigation Strategy & Cleanup Plan
R1-E.9.3.1 — Premium Interface, Motion & Navigation Polish
R1-E.9.3.1.1 — Premium UI, Theme & Transition Polish
R1-E.9.3.2 — Arcade Reset & Runtime/Bug Maze Action Polish
R1-E.9.4   — Code Snake
R1-E.9.4.1 — Code Snake Action Polish
R1-E.9.5   — Stack Tetris
R1-E.9.5.1 — Stack Tetris Action Polish
R1-E.9.6   — Developer Arcade Final QA
R1-E.10.0  — Premium Product Polish Strategy
R1-E.10.1  — Clean UI Pass & Smart Navbar
R1-E.10.2  — Arcade Hub & Game Focus Mode
R1-E.10.3  — Bug Maze Expansion & Mobile Gesture Controls
R1-E.10.3.1 — Lab Density & Scale Calibration
R1-E.10.4  — Snake/Runner/Tetris Polish
R1-E.10.5  — Motion & Interaction System
R1-E.10.5.1 — Strong Route, Theme & Language Transitions
R1-E.10.5.2 — Mobile Arcade Final Polish
R1-E.11.0  — Full Project Audit Before Finalization
R1-E.11.1  — Audit Documentation Sync
R1-E.11.2  — Safe Cleanup
R1-E.11.3  — Cautious Legacy Cleanup
R1-E.11.3.6 — Debug/Latency Deprecation Decision
R1-E.11.3.7 — Debug/Latency Deprecation Docs
R1-E.11.3.8 — Remove Debug/Latency Components
R1-E.11.3.9 — Remove Debug/Latency CSS
R1-E.11.3.10 — Score Compat Cleanup
R1-E.12.0  — Game Systems, Leaderboard & Database Architecture Plan
R1-E.12.1  — Game Score Contract v2
R1-E.12.2  — Supabase/DB Foundation
R1-E.12.3  — Apply Supabase DB Foundation
R1-E.12.4  — Anonymous Player Session
R1-E.12.5  — Persistent Score API
R1-E.12.6  — Leaderboard API & UI
R1-E.12.7A — Security & Config Hygiene
R1-E.12.7  — Game Balance & Leaderboard QA
R1-E.12.8  — Runtime Runner Balance & Progression
R1-E.11.4  — Final Mobile Polish
R1-E.11.5  — Public QA Final
R1-F.0     — Project Assets Admin Planning
R1-F.1     — Protected Admin Shell
R1-F.2     — Project Media Data Model
R1-F.3     — Upload & Storage Integration
R1-F.4     — Project Media Manager UI
R1-F.5     — Public Rendering Integration
R1-F.6     — Admin QA & Security Gate
```

Nenhuma dessas fases futuras deve ser marcada como concluída até implementação, validação e checkpoint próprios.

## Produção

URL pública usada para validação HTTP da R1-E.9:

```txt
https://curriculum-vitae-babr.vercel.app/
```

Na R1-E.9 a produção foi verificada somente por leitura, sem deploy manual.

Resultado observado:

- Rotas principais, `/api/health`, `sitemap.xml`, `robots.txt` e PDF PT responderam com HTTP 200.
- Metadata e canonical de produção apontam para `https://curriculum-vitae-babr.vercel.app`.
- A home de produção ainda não reflete a correção local R1-E.9 do teaser do Developer Lab; essa divergência deve ser resolvida pelo checkpoint/push e pelo deploy automático posterior.
- A sincronização exata com o commit `5f94f83` não é exposta pelo app; quando necessário, confirmar pelo painel/CLI da Vercel antes de declarar paridade exata.

## Variável Recomendada

```txt
NEXT_PUBLIC_APP_URL=https://curriculum-vitae-babr.vercel.app
```

## Próximos Passos Reais

- Executar R1-E.11.2 — Safe Cleanup com mudanças pequenas e reversíveis.
- Manter `public/profile/imagem.png`, `public/resume`, PDFs e DOCX preservados.
- Executar R1-E.11.3 — Cautious Legacy Cleanup somente depois de provar imports, UI, score e docs dos módulos rebaixados.
- Executar R1-E.11.4 — Final Mobile Polish com teste real em celular, especialmente Runtime Runner e Code Snake.
- Executar R1-E.11.5 — Public QA Final antes de chamar o site de final.
- Depois, iniciar R1-F.1 — Protected Admin Shell em fase própria.
- Executar R1-E.12.7 — Game Balance & Leaderboard QA para calibrar ranking e UX após dados reais.
- Planejar storage, analytics real ou Admin somente em fase futura explícita.
