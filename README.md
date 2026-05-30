# Álvaro.dev Portfolio OS

Portfólio profissional de Álvaro Amorim em Next.js, com home premium, projetos em formato de case study, currículo tradicional preservado e Developer Lab em replanejamento para um arcade final mais forte.

O projeto deixou de ser apenas um currículo digital e passou a funcionar como uma demonstração prática de front-end, arquitetura de interface, motion, acessibilidade, SEO, conteúdo estruturado e APIs locais seguras.

## Estado Atual

Checkpoint publicado antes da R1-E.10.5:

```txt
18f38f2 feat: polish arcade games and cleanup lab
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
- R1-E.10.5 está em execução local sem checkpoint para criar o Signature Motion & Interaction System do produto público.
- R1-E.10.5.1 está em execução local sem checkpoint para fortalecer transições de rota, tema e idioma após revisão humana.
- R1-E.10.5.2 está em execução local sem checkpoint para fechar o polish mobile do Arcade: foco 400x858, controles por swipe, instruções compactas e ajustes de escala/performance dos jogos.
- O projeto ainda não deve ser tratado como fechamento final enquanto Admin de Imagens, storage real e mídia real dos projetos estiverem pendentes.

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
/api/score                Score mock/local não persistente
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
- Debug Arena deve ser rebaixado para treino, experimento arquivado ou removido da vitrine principal.
- Latency Lab deve ser rebaixado para treino, experimento arquivado ou removido da vitrine principal.
- Quiz/foundation challenge não é jogo final.

Desde a R1-E.9.3.2, o `/lab` não deve vender Debug Arena, Latency Lab e quiz/foundation como jogos principais. Eles podem permanecer como compatibilidade, treino ou arquivo temporário até a limpeza definitiva.

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

## APIs Locais

As APIs atuais são foundations locais/mock. Elas validam entrada e retornam respostas padronizadas, mas não criam persistência real.

Rotas existentes:

```txt
/api/health
/api/contact
/api/analytics
/api/terminal
/api/score
```

`/api/score` aceita os jogos do Developer Arcade:

```txt
runtime
bug-maze
code-snake
stack-tetris
debug-arena
latency-lab
```

Esse contrato reflete a implementação atual. `debug-arena` e `latency-lab` permanecem aceitos apenas por compatibilidade temporária.

Contrato atual esperado:

- `GET /api/score`: retorna `405`.
- `POST /api/score` válido: retorna `202`.
- `POST /api/score` inválido: retorna `400`.

Exemplo:

```powershell
curl.exe --% -X POST http://localhost:3000/api/score -H "Content-Type: application/json" -d "{\"game\":\"runtime\",\"score\":85,\"metadata\":{\"source\":\"developer-lab\",\"mode\":\"manual\"}}"
```

## O Que Ainda Não Existe

Não marcar como concluído:

- Supabase ativo.
- Banco de dados real.
- Ranking real.
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

Supabase ainda não está ativo neste projeto.

R1-F.0 não cria `/admin`, storage, banco, autenticação ou upload. A implementação deve começar somente em R1-F.1 ou fase posterior aprovada.

Roadmap proposto:

- R1-F.0 — Project Assets Admin Planning: auditoria, plano técnico, segurança e UX, sem implementação.
- R1-F.1 — Protected Admin Shell: criar `/admin` protegido e layout base, ainda sem upload real.
- R1-F.2 — Project Media Data Model: decidir persistência e manter fallback para `projects.ts`/placeholders.
- R1-F.3 — Upload & Storage Integration: integrar Supabase Storage/Auth ou alternativa aprovada.
- R1-F.4 — Project Media Manager UI: editor por projeto para thumbnail, hero, galeria, alt PT/EN e status.
- R1-F.5 — Public Rendering Integration: consumir imagens reais quando existirem e manter placeholders quando não existirem.
- R1-F.6 — Admin QA & Security Gate: validar auth, upload, permissões, produção e documentação.

## Fase Atual: R1-E.10.5.2

Antes da R1-F.1, o produto público terá uma nova rodada de polish com direção **Arcade clean premium com detalhes dev**.

Objetivo da rodada atual:

- Criar um sistema de motion/interação com assinatura própria para home, navegação, projetos/cases e Lab.
- Fortalecer page transitions, troca de tema e troca de idioma sem adicionar dependência.
- Adicionar loading/lazy visual curto para navegação interna com continuidade de rota.
- Diferenciar claramente rota, tema e idioma: handoff de rota, sweep de tema e scan de tradução.
- Dar mais resposta a botões, cards, foco, seleção e estados ativos com microinterações consistentes.
- Evoluir o Lab/Arcade Hub e o Game Focus Mode com transições de abertura/troca mais premium, sem alterar regras dos jogos.
- Fechar o polish mobile do Arcade em 400x858: jogos dentro da tela, controles de gameplay ocultos no mobile, swipe como controle primário, instruções idle compactas e ajustes de Runtime Runner/Code Snake/Bug Maze/Stack Tetris.
- Preservar reduced motion com versões simplificadas e acessíveis das transições.
- Preservar `/curriculo`, que está aprovado em tema claro e escuro.
- Manter o Arcade Hub, Smart Navbar e os quatro jogos finais já implementados.
- Deixar R1-F.1 Admin Shell para depois do polish público.

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
R1-E.10.6  — Public Experience QA
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

- Concluir R1-E.10.5/R1-E.10.5.1/R1-E.10.5.2 com Signature Motion & Interaction System, page/theme/language transitions fortes, microinterações premium e Arcade mobile jogável em 400x858.
- Preservar `/curriculo` no polish atual, salvo bug crítico.
- Preservar Runtime Runner, Bug Maze, Code Snake e Stack Tetris como jogos principais.
- Validar home, projetos/cases, Lab, Smart Navbar, tema claro/escuro, PT/EN e reduced motion.
- Decidir quando remover ou arquivar `/visual-final-candidate`.
- Adicionar screenshots reais dos projetos quando houver assets próprios.
- Planejar Supabase, ranking real ou analytics real somente em fase futura explícita.
