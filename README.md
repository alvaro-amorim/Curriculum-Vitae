# Álvaro.dev Portfolio OS

Portfólio profissional de Álvaro Amorim em Next.js, com home premium, projetos em formato de case study, currículo tradicional preservado e Developer Lab em replanejamento para um arcade final mais forte.

O projeto deixou de ser apenas um currículo digital e passou a funcionar como uma demonstração prática de front-end, arquitetura de interface, motion, acessibilidade, SEO, conteúdo estruturado e APIs locais seguras.

## Estado Atual

Checkpoint publicado antes da R1-E.9:

```txt
5f94f83 feat: finalize developer arcade release gate
```

Estado real do produto após a revisão humana que abriu a R1-E.9.3.0:

- A home oficial `/` usa a experiência visual premium aprovada.
- `/visual-final-candidate` continua preservada temporariamente como rota de comparação.
- `/projetos` foi elevado para hub premium de projetos.
- `/projetos/[slug]` foi elevado para case study visual premium.
- `/lab` contém uma versão publicada do Developer Arcade, mas a direção final foi revisada antes do fechamento.
- Runtime Runner e Bug Maze continuam como bases de jogos reais, ainda exigindo mais ação, diversão e polimento.
- Debug Arena e Latency Lab não devem continuar como jogos finais principais: ainda parecem quiz/teste e dashboard/formulário em uso real.
- Os módulos antigos de quiz/foundation continuam úteis como treino, mas não devem ser vendidos como jogos finais.
- `/curriculo` continua preservado para leitura objetiva e downloads.
- PDFs e DOCX continuam em `public/resume/`.
- A imagem de perfil continua em `public/profile/`.
- SEO básico, metadata por rota, sitemap e robots estão implementados.
- R1-E.9 ainda não está fechada.
- R1-E.9.1 e R1-E.9.2 foram hardening local sem checkpoint.
- O projeto ainda não deve ser tratado como fechamento final enquanto R1-E.9.3, revisão humana e mídia real dos projetos estiverem pendentes.

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

- Runtime Runner e Bug Maze existem, melhoraram, mas ainda precisam de mais ação e diversão.
- Debug Arena deve ser rebaixado para treino, experimento arquivado ou removido da vitrine principal.
- Latency Lab deve ser rebaixado para treino, experimento arquivado ou removido da vitrine principal.
- Quiz/foundation challenge não é jogo final.
- Code Snake ainda não existe.
- Stack Tetris ainda não existe.

Enquanto a R1-E.9.3.2 não for implementada, o `/lab` ainda pode exibir elementos antigos. Isso é estado pendente, não direção final.

## Interface, Motion e Navegação

A home premium foi aprovada como direção, mas a revisão humana apontou problemas reais que ainda precisam de uma etapa própria:

- A navbar/topbar atual parece separada da experiência premium e faz algumas páginas parecerem outro site.
- A home precisa de navegação direta e minimalista para projetos, Lab, currículo, contato/download e seções internas.
- Motion e transições ainda precisam de sincronização mais madura.
- Textos, espaçamentos, z-index e sobreposições precisam de polish maior.
- Mobile precisa continuar sendo tratado como experiência própria.

A etapa de implementação em andamento local é:

```txt
R1-E.9.3.1 — Premium Interface, Motion & Navigation Polish
R1-E.9.3.1.1 — Premium UI, Theme & Transition Polish
```

Essa etapa moderniza a navegação global e cria uma navegação direta na home sem poluir a primeira dobra. Ela ainda precisa de QA visual e revisão humana antes de checkpoint.

A subfase R1-E.9.3.1.1 aprofunda o polish de UI sem iniciar Arcade Reset: controla escalas tipográficas, adiciona transições leves entre rotas, torna o tema claro uma experiência real, anima troca de tema/idioma, aplica lazy/defer seguro e refina `/curriculo` para continuar sóbrio, mas visualmente alinhado ao restante do Portfolio OS.

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
debug-arena
latency-lab
```

Esse contrato reflete a implementação atual. A direção final do Arcade deve migrar para `runtime`, `bug-maze`, `code-snake` e `stack-tetris` em fases futuras, sem criar ranking real ou persistência real antes de fase explícita.

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

## Fase Futura Obrigatória: R1-F

R1-F — Project Assets Admin / Project Media Manager ainda não existe.

Escopo previsto:

- Página admin protegida.
- Cadastro/upload de imagens reais dos projetos.
- Edição de thumbnail, hero image e galeria.
- Integração com a estrutura `visuals` de `src/content/projects.ts`.
- Armazenamento real, provavelmente Supabase Storage/Auth ou solução equivalente.
- Preservação dos placeholders honestos enquanto imagens reais não existirem.
- Nenhum screenshot falso.

Supabase ainda não está ativo neste projeto.

R1-F não deve ser implementada antes do replanejamento visual e de arcade estar estabilizado.

## Plano Atual de Fases

```txt
R1-E.9.3.0 — Arcade Replan, Navigation Strategy & Cleanup Plan
R1-E.9.3.1 — Premium Interface, Motion & Navigation Polish
R1-E.9.3.1.1 — Premium UI, Theme & Transition Polish
R1-E.9.3.2 — Arcade Reset & Runtime/Bug Maze Action Polish
R1-E.9.4   — Code Snake
R1-E.9.5   — Stack Tetris
R1-E.9.6   — Developer Arcade Final QA
R1-F.0     — Project Assets Admin Planning
R1-F.1     — Protected Admin Shell
R1-F.2     — Project Media Manager
R1-F.3     — Storage/Persistence Integration
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

- Concluir a R1-E.9.3.1.1 local com QA visual e revisão humana antes de qualquer checkpoint.
- Validar navbar global, navegação direta da home, tema claro real, troca PT/EN animada, page transitions, currículo polido e lazy/defer seguro.
- Depois, iniciar R1-E.9.3.2 para rebaixar Debug Arena/Latency Lab/quiz da vitrine principal e melhorar Runtime Runner/Bug Maze.
- Só então implementar Code Snake e Stack Tetris.
- Criar checkpoint somente após validação técnica, QA visual e revisão humana.
- Iniciar R1-F apenas depois do replanejamento visual/arcade estar estabilizado.
- Decidir quando remover ou arquivar `/visual-final-candidate`.
- Adicionar screenshots reais dos projetos quando houver assets próprios.
- Planejar Supabase, ranking real ou analytics real somente em fase futura explícita.
