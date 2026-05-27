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

## Estado Atual Real

Atualização R1-E.9.3.0 — Arcade Replan, Navigation Strategy & Cleanup Plan.

Checkpoint publicado antes desta fase:

```txt
5f94f83 feat: finalize developer arcade release gate
```

Estado real do produto após revisão humana em vídeo:

- A home oficial `/` já usa a experiência visual premium aprovada.
- `/visual-final-candidate` continua preservada temporariamente como rota de comparação.
- `/projetos` está concluída como hub premium de projetos.
- `/projetos/[slug]` está concluída como experiência premium de case studies.
- `/lab` contém uma versão publicada do Developer Arcade, mas a direção final dos jogos foi revisada.
- Runtime Runner / Bug Runner e Bug Maze melhoraram, mas ainda precisam ficar mais divertidos, responsivos e com mais ação.
- Debug Arena ainda parece quiz/teste estilizado.
- Latency Lab ainda parece dashboard/formulário.
- Quiz/foundation challenge não deve ser tratado como jogo final.
- Existem falhas de motion, animações iniciais, posicionamento de texto, eventuais sobreposições e sensação amadora em alguns pontos.
- A navbar/topbar atual não mantém a identidade premium da home e pode fazer o usuário sentir que mudou de site ao navegar.
- A home premium precisa de navegação direta e minimalista para rotas e seções importantes.
- `/curriculo` continua preservada para leitura objetiva e downloads.
- Downloads PDF/DOCX continuam em `public/resume/`.
- A imagem ativa continua em `public/profile/`.
- Metadata, sitemap, robots, not-found e fundamentos de SEO estão implementados.
- `/api/score` é mock/local, não persistente, com validação para os jogos do Developer Arcade.
- A revisão humana bloqueou o checkpoint R1-E.9 e também a checkpointagem da R1-E.9.1/R1-E.9.2.
- O projeto não deve ser tratado como fechamento final até a R1-E.9.3 redefinir e implementar a nova direção.

Direção final desejada do Developer Arcade:

1. Runtime Runner / Bug Runner.
2. Bug Maze.
3. Code Snake.
4. Stack Tetris.

Decisão sobre módulos existentes:

- Debug Arena deve ser rebaixado para módulo de treino, experimento arquivado ou removido da vitrine principal.
- Latency Lab deve ser rebaixado para módulo de treino, experimento arquivado ou removido da vitrine principal.
- Quiz/foundation challenge permanece como treino/foundation, não como jogo final.
- O código desses módulos pode permanecer temporariamente até a fase de limpeza, mas a UI principal não deve vendê-los como jogos finais.

O que ainda não existe e não deve ser marcado como concluído:

- Supabase ativo.
- Banco de dados real.
- Ranking real.
- Analytics persistente real.
- Admin dashboard.
- Autenticação.
- Requests externos nos jogos.
- Provider/LLM dinâmico nos jogos.
- Screenshots reais dos projetos.
- Admin de imagens dos projetos.
- Deploy manual nesta fase.

Fase futura obrigatória:

- R1-F — Project Assets Admin / Project Media Manager.
- Essa fase deve criar uma página admin protegida para cadastrar ou subir imagens reais dos projetos.
- O admin deve editar thumbnail, hero image e galeria conectados à estrutura `visuals`.
- O armazenamento real deve ser definido em fase própria, provavelmente Supabase Storage/Auth ou solução equivalente.
- Enquanto R1-F não existir, os placeholders de projeto continuam honestos.
- Supabase ainda não está ativo.
- Não criar screenshots falsos.

Estado de produção na R1-E.9:

- URL pública usada para leitura: `https://curriculum-vitae-babr.vercel.app/`.
- Rotas principais, `/api/health`, `sitemap.xml`, `robots.txt` e PDF PT responderam com HTTP 200 em produção.
- Metadata e canonical de produção apontam para `https://curriculum-vitae-babr.vercel.app`.
- A home de produção ainda não reflete a correção local R1-E.9 do teaser do Developer Lab; essa divergência deve ser resolvida pelo checkpoint/push e pelo deploy automático posterior.
- A sincronização exata com o commit publicado deve ser confirmada por Vercel quando necessário, porque o app não expõe o hash em runtime.

Próximo passo oficial:

- Concluir a R1-E.9.3.1 — Premium Interface, Motion & Navigation Polish, em execução local sem checkpoint.
- Validar a navbar/topbar global premium em `/`, `/projetos`, cases, `/lab` e `/curriculo`.
- Validar a navegação direta e minimalista na home sem competir com o hero.
- Sincronizar motion/transições, corrigir textos mal posicionados, z-index, espaçamentos, sobreposições e mobile.
- Executar a subfase R1-E.9.3.1.1 — Premium UI, Theme & Transition Polish para tema claro real, transições entre rotas, animação de tema/idioma, lazy/defer seguro e currículo visualmente alinhado ao Portfolio OS.
- Depois executar R1-E.9.3.2 para rebaixar Debug Arena/Latency Lab/quiz da vitrine principal e melhorar Runtime Runner/Bug Maze antes de criar Code Snake e Stack Tetris.
- Criar checkpoint somente com validação técnica, QA visual e revisão humana.

Plano oficial pós-revisão:

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

Estratégia de navbar/navegação global:

- A navegação global deve parecer parte da experiência premium, não um header comum de dashboard.
- Deve ter estado ativo claro, transições suaves, versão mobile própria e respeito a `prefers-reduced-motion`.
- Não pode ocupar espaço demais, esconder conteúdo ou causar sobreposição.
- Deve preservar identidade visual entre home, projetos, cases, Lab e currículo.

Estratégia de navegação direta na home:

- Criar uma solução minimalista como nav flutuante, section rail, magnetic nav pills, command dock visual ou progress/section navigator.
- A navegação deve levar diretamente para projetos, Lab, currículo, contato/download e seções internas relevantes.
- Não pode poluir a primeira dobra nem competir com o palco visual aprovado.

Fase futura obrigatória R1-F:

- Ainda não existe `/admin`.
- Ainda não existe autenticação/proteção de admin.
- Ainda não existe upload/cadastro de imagens reais dos projetos.
- Ainda não existe storage real.
- R1-F deve planejar e implementar Project Assets Admin / Project Media Manager em fases próprias.
- O escopo futuro inclui `/admin`, proteção, upload/cadastro de thumbnail, hero image, galeria, alt PT/EN, integração com `visuals`, e armazenamento real, provavelmente Supabase Storage/Auth ou alternativa aprovada.
- Até lá, os placeholders de projetos continuam honestos e nenhum screenshot falso deve ser criado.

As seções históricas abaixo explicam o diagnóstico e as decisões que levaram ao estado atual. Quando houver divergência, o bloco **Estado Atual Real** prevalece.

---

## Diagnóstico de Falha da Primeira Versão

O desenvolvimento anterior priorizou segurança, validação, arquitetura incremental e baixo risco. Essa decisão produziu um MVP técnico correto, com build estável, rotas funcionais, dados estruturados e APIs mock/local.

O problema é que a visão original exigia mais do que correção técnica. O objetivo era criar uma experiência memorável, premium e interativa que demonstrasse criatividade front-end, motion design, lógica de jogo, arquitetura visual e produto.

Falhas identificadas:

- O projeto ficou conservador demais.
- A home virou uma composição de cards e CTAs, não uma primeira dobra memorável.
- O erro principal do Developer Lab foi tratar "mini-games" como questionários, listas de alternativas e checklists com score.
- O erro visual foi depender de cards genéricos, grids simples, badges, bordas e animações mínimas.
- O erro de produto foi não criar uma narrativa visual forte.
- O terminal não virou um command center real.
- A skill matrix não virou uma visualização forte.
- As páginas de projeto têm estrutura, mas ainda não têm storytelling visual premium.

Essa primeira versão deve ser preservada como base técnica, mas não como experiência final.

---

## Nova Direção Obrigatória — Developer Arcade OS

A nova direção criativa do projeto é:

```txt
Developer Arcade OS / Portfolio Arcade OS
```

O produto deve evoluir para um portfólio premium e interativo com estética de sistema, laboratório técnico e arcade de desenvolvimento.

A nova versão deve priorizar:

- Portfólio premium, não dashboard genérico.
- Experiência interativa, não apenas navegação por cards.
- Estética de sistema/dev arcade.
- Visual memorável nos primeiros segundos.
- Animações de scroll e transições perceptíveis.
- Loading/boot sequence inicial com identidade própria.
- Terminal/command center real.
- Jogos simples, divertidos e ligados à programação.
- Case studies com storytelling visual.
- Back-end e APIs como suporte técnico da experiência, não como único diferencial.

O site deve parecer uma experiência criada por alguém que entende front-end, produto, UX, estado, animação, arquitetura e sistemas web.

Não é aceitável continuar criando apenas cards, checklists e quizzes e chamá-los de experiência avançada.

---

## Definição Correta de Mini-game

Mini-game **não é**:

- Quiz simples.
- Checklist.
- Formulário com score.
- Lista de alternativas estática.
- Card clicável com feedback.
- Tabela com pontuação.

Mini-game **deve ser**:

- Jogável.
- Visual.
- Divertido.
- Com regras claras.
- Com estado.
- Com pontuação.
- Com feedback visual.
- Com interação real.
- Preferencialmente com movimento, colisão, tempo, fases, mapa, canvas, SVG ou simulação.

O mini-game precisa demonstrar uma competência técnica real, mas também precisa parecer uma experiência de jogo. Ele pode ser simples, mas não pode ser apenas um formulário disfarçado.

### Runtime Runner / Bug Runner

Inspirado no tipo de experiência do jogo offline do Chrome, mas sem copiar assets, marca, visual ou identidade do Chrome.

Ideia:

- Personagem, cursor ou dev bot correndo.
- Desviar de bugs, null pointer, timeout, 404, build failed e merge conflict.
- Coletar power-ups como tests, cache, type safety e CI passed.
- Pontuação e dificuldade progressiva.

Demonstra:

- Game loop.
- Teclado.
- Colisão.
- Canvas/SVG/CSS.
- Estado.
- Performance front-end.

### Bug Maze / Commit Maze

Inspirado em maze game clássico, mas original e com tema de programação. Não deve copiar visual, nome, assets ou marca de jogos existentes.

Ideia:

- Jogador coleta commits, tests ou deploy tokens.
- Inimigos são bugs, regressions, legacy code e production errors.
- Power-ups como debug mode, rollback e test coverage.
- Mapa simples em grid.

Demonstra:

- Grid engine.
- Movimento.
- Colisão.
- IA simples.
- Estado.
- Fases.

### Debug Arena

Ideia:

- Interface visual de editor.
- Bugs aparecem em linhas de código.
- Usuário identifica ou corrige antes do build falhar.
- Feedback técnico depois da jogada.

Demonstra:

- UI de editor.
- Lógica de validação.
- Feedback técnico.
- Animação.
- Estado.

### Latency Lab

Ideia:

- Painel de API com latência simulada.
- Usuário aplica cache, paginação, debounce, índice e background job.
- Gráficos e métricas mudam visualmente.
- Request waterfall ou painel de performance.

Demonstra:

- Raciocínio full stack.
- Visualização de métricas.
- Gráficos.
- Simulação.
- Back-end awareness.

---

## Animações e Motion Design Obrigatórios

As próximas fases devem incluir motion design real e perceptível:

- Loading inicial estilo boot de sistema.
- Scroll reveal por seção.
- Transições suaves entre áreas.
- Hover states mais ricos.
- Background animado leve.
- Terminal com digitação real.
- Command palette com animação premium.
- Feedback visual em jogos.
- Animações de score, erro e sucesso.
- Respeito a `prefers-reduced-motion`.

Regras:

- A animação deve melhorar a experiência.
- A animação não pode prejudicar leitura.
- A animação não pode pesar demais.
- A experiência precisa funcionar em mobile.
- Usuários com redução de movimento devem receber alternativa estável.

Animações moderadas e quase invisíveis não são suficientes para a nova direção. O objetivo é ter motion design elegante, não ruído visual.

---

## Roadmap de Resgate

Este roadmap complementa e substitui a interpretação de que as fases 1 a 6 encerram o produto. As fases anteriores entregaram a base técnica. As fases abaixo são obrigatórias para alcançar a experiência desejada.

### Fase R0 — Deploy, legado e limpeza operacional

Objetivo:

- Confirmar Vercel como Next.js.
- Confirmar último commit em produção.
- Testar rotas públicas.
- Confirmar que `index.html` legado não está mais na raiz nem em `legacy/`.
- Garantir que a Vercel não sirva HTML antigo ou deployment vazio.

Critérios de aceite:

- Produção serve a versão Next.
- `/`, `/curriculo`, `/projetos`, `/lab`, `/api/health` funcionam.
- Não há `index.html` legado confundindo deploy.

### Fase R1 — Redesign Visual Premium da Home

Objetivo:

- Reescrever hero/home.
- Criar identidade visual forte.
- Criar primeira dobra memorável.
- Aplicar direção Developer Arcade OS.
- Adicionar background/efeitos leves.
- Melhorar tipografia, escala, spacing e CTAs.

Critérios de aceite:

- Impressiona nos primeiros 5 segundos.
- Não parece template genérico.
- Comunica valor rapidamente.
- Terminal/command center vira peça visual central.
- Mobile continua bom.

### Fase R2 — Motion System e Loading Experience

Objetivo:

- Loading/boot sequence.
- Scroll animations.
- Page transitions.
- Microinterações.
- `prefers-reduced-motion`.

Critérios de aceite:

- Animações perceptíveis e elegantes.
- Nada pesado.
- Nada atrapalha acessibilidade.

### Fase R3 — Terminal e Command Center Premium

Objetivo:

- Terminal parecer ferramenta real.
- Autocomplete.
- Histórico.
- Navegação por setas.
- Comandos agrupados.
- Outputs ricos.
- Integração segura com API se fizer sentido.

Critérios de aceite:

- Terminal não parece input simples.
- Terminal é útil, bonito e demonstra React/state/UX.

### Fase R4 — Developer Arcade com Jogos Reais

Objetivo:

- Substituir checklists/quizzes por jogos reais.
- Implementar Runtime Runner/Bug Runner.
- Implementar Bug Maze/Commit Maze ou versão inicial.
- Transformar Debug Challenge em Debug Arena.
- Transformar API Latency Game em Latency Lab visual.

Critérios de aceite:

- Jogos são jogáveis.
- Jogos possuem estado, score e feedback.
- Jogos demonstram habilidades técnicas.
- Jogos divertem sem parecer infantis.

### Fase R5 — Case Studies Premium

Objetivo:

- Transformar páginas de projeto em storytelling visual.
- Adicionar diagramas.
- Mostrar arquitetura.
- Adicionar screenshots/mockups quando houver assets reais.
- Explicar trade-offs.
- Explicar decisões técnicas.
- Mostrar resultados sem exagero.

Critérios de aceite:

- Cada case parece estudo profissional.
- Recrutador entende problema, solução, stack e raciocínio.

### Fase R6 — Polimento Final e Deploy Premium

Objetivo:

- Mobile.
- Performance.
- Acessibilidade.
- SEO.
- OG image visual.
- Screenshots finais.
- Produção validada.

Critérios de aceite:

- Build passa.
- Produção serve a versão correta.
- Rotas principais funcionam.
- Usuário aprova visualmente antes de commit final.

---

## Bibliotecas e Recursos Permitidos no Resgate

Recomendações:

- `motion` ou `framer-motion` para animações, transições e scroll reveal.
- React Flow para Architecture Builder visual.
- Recharts para métricas e Latency Lab.
- Canvas API, SVG ou CSS puro para games.
- CodeMirror leve ou editor fake em CSS para Debug Arena.
- shadcn/ui apenas se ajudar com Dialog, Tabs ou Command.
- Evitar Three.js por enquanto.

Regras de dependência:

- Não instalar tudo de uma vez.
- Cada dependência precisa justificar valor real.
- Prioridade é experiência, performance e manutenção.
- Se CSS/SVG/Canvas nativo resolver bem, preferir solução nativa.
- Dependências não podem virar desculpa para adiar a direção visual.

---

## Regras Para Evitar Nova Confusão

- Não chamar checklist de mini-game.
- Não chamar lista com barras de skill radar.
- Não aceitar hero estático como home premium.
- Não aceitar card genérico como experiência interativa.
- Não priorizar novas APIs antes de resolver visual/UX.
- Não iniciar Supabase antes do produto visual estar satisfatório.
- Não mexer em backend persistente nesta fase.
- Não inventar informações profissionais.
- Não remover a rota `/curriculo` objetiva.
- Não quebrar downloads PDF/DOCX.
- Não quebrar PT/EN e tema.
- Não comprometer acessibilidade.
- Não criar jogo que copie marca, assets, personagem, nome ou identidade de Chrome, Pac-Man ou qualquer IP.
- Pode se inspirar em mecânicas conhecidas, mas visual, nome, assets e execução devem ser originais.

---

## Critérios de Aceite Globais da Nova Versão

A nova versão só será considerada satisfatória se:

- A home impressiona nos primeiros 5 segundos.
- O visual não parece dashboard genérico.
- Existe motion design perceptível.
- O terminal parece command center.
- O Developer Lab tem pelo menos 1 jogo real jogável.
- Jogos são relacionados à programação.
- Mini-games têm pontuação e feedback visual.
- Case studies parecem premium.
- Mobile funciona bem.
- `lint`, `typecheck` e `build` passam.
- Produção Vercel serve a versão correta.
- Usuário aprova visualmente antes de commit final.

---

## R1-C — Portfolio OS Premium Rebuild

Esta é a nova fase oficial de reconstrução visual do projeto.

As tentativas R1.1, R1.1B e a última tentativa cinematográfica devem ser tratadas como experimentos não aprovados. Elas passaram em validações técnicas, mas não atingiram o padrão visual esperado. O erro principal foi continuar tentando resolver direção visual com grids, cards, bordas, labels, blocos escuros e composição insuficiente.

Objetivo da R1-C:

- Reconstruir a experiência visual com padrão premium real.
- Trabalhar com abordagem hero-first.
- Criar narrativa visual clara antes de expandir o restante da home.
- Aplicar UI/UX avançada com hierarquia, profundidade e composição forte.
- Usar motion design com propósito, não como decoração para mascarar layout fraco.
- Preservar performance, acessibilidade, PT/EN, tema, rotas, downloads e conteúdo factual.

Princípio central da R1-C:

> Build passar não significa pronto.

Uma entrega visual só pode ser considerada pronta se todos os itens abaixo forem verdadeiros:

- `npm run lint` passa.
- `npm run typecheck` passa.
- `npm run build` passa.
- Playwright, Browser MCP ou Chrome DevTools MCP validam desktop e mobile.
- Screenshots são gerados e anexados ou listados no relatório.
- Não há mistura indevida de PT/EN.
- Não há erro de acentuação, ortografia ou encoding.
- Não há mojibake no HTML/DOM visível.
- Não há overflow horizontal.
- Não há console errors nem page errors.
- O usuário aprova visualmente de forma explícita.

Sem aprovação visual humana, a fase permanece em revisão, mesmo que lint, typecheck e build estejam verdes.

### Estratégia Visual Obrigatória da R1-C

A nova direção visual deve seguir estes critérios:

- Dark-first premium.
- Hero-first.
- Uma composição dominante, não dashboard.
- Headline curta, memorável e legível.
- No máximo 2 CTAs primários e 2 CTAs secundários na primeira dobra.
- Imagem ou identity node dominante, sem cortes estranhos.
- Profundidade em 3 planos: fundo, palco visual e overlays.
- Motion curto, sutil e com propósito.
- Mobile desenhado como experiência própria, não versão quebrada do desktop.
- Tema claro premium, não apenas inversão automática do dark.
- Estética de produto/portfólio premium, não admin panel.

A primeira dobra deve parecer desenhada como peça principal do produto. Ela não pode ser apenas uma coleção de componentes.

### Anti-patterns Proibidos na R1-C

Não fazer:

- Não criar grid de cards genéricos na primeira dobra.
- Não usar foto cortada, esmagada, grande demais ou mal posicionada no mobile.
- Não esconder CTA principal abaixo da dobra.
- Não misturar textos PT/EN.
- Não aceitar mojibake.
- Não chamar checklist, quiz ou formulário com score de mini-game final.
- Não usar animação decorativa como substituta de bom layout.
- Não usar CSS gigante desorganizado sem tokens, seções e responsabilidade clara.
- Não entregar apenas com validação técnica sem validação visual.
- Não priorizar Supabase, banco, ranking, dashboard admin ou novas APIs antes da experiência visual estar aprovada.
- Não criar terminal gigante vazio para preencher espaço.
- Não repetir estética de dashboard administrativo.
- Não tratar badge, borda e glow como direção visual completa.

### Atualização R1-D.SELECT — Candidata Visual Preservada

Após as reprovações visuais das tentativas R1.1, R1.1B, R1-C.3 e dos refinamentos estáticos do hero, o projeto passou por uma etapa de exploração visual real.

Estado real atual:

- A rota `/visual-final-candidate` é a melhor direção visual validada pelo usuário até agora.
- Essa rota **não é a home oficial**.
- Essa rota **não é a versão final**.
- A home oficial `/` permanece preservada até aprovação visual humana explícita.
- A fase R1-D.SELECT escolheu a direção **Interactive Product Showcase** como base.
- A candidata incorpora a atmosfera viva, o boot e a sensação de sistema da direção **Cinematic Operating System**.
- Os protótipos `/visual-prototype` e `/visual-exploration` foram tratados como experimentos legados/reprovados e podem ser removidos quando não houver dependência real.
- A próxima prioridade é transformar a primeira dobra em uma vitrine viva, ultra premium e interativa.

Regra central reforçada:

> Build passar não significa pronto. A versão só avança quando a validação visual humana aprovar.

Prioridade central da próxima etapa visual:

- A primeira dobra deve ser a melhor parte do site.
- A primeira dobra deve apresentar projetos como showcase/carrossel interativo.
- O projeto ativo deve ter imagem, screenshot real ou placeholder premium preparado para receber imagem futura.
- A stack relacionada ao projeto ativo deve aparecer de forma animada e conectada ao showcase.
- A troca de projetos deve ter transição cinematográfica.
- O mouse deve influenciar parallax, spotlight, tilt, canvas, brilho ou perspectiva.
- A experiência precisa comunicar valor em até 5 segundos.
- O layout não pode parecer dashboard, card grid comum ou template.
- PT/EN devem permanecer separados, sem mistura indevida de idioma.
- Acentuação, ortografia e encoding precisam permanecer limpos.
- `prefers-reduced-motion`, mobile e acessibilidade continuam obrigatórios.

Anti-patterns proibidos daqui para frente:

- Não voltar para dashboard ou cards genéricos como estrutura dominante.
- Não usar terminal gigante vazio na primeira dobra.
- Não usar skill matrix comum como seção principal.
- Não usar foto grande com chips soltos como direção visual.
- Não usar placeholder pobre, vazio ou com aparência improvisada.
- Não usar apenas fade, hover simples ou glow como prova de motion premium.
- Não criar scroll sem narrativa.
- Não misturar PT com EN fora dos termos técnicos aceitos.
- Não aceitar erro de acentuação ou mojibake.
- Não aplicar a candidata visual na home oficial antes de aprovação visual humana.

### R1-E — Roadmap Oficial de Fechamento Visual Premium

A R1-E deixou de ser apenas plano e virou histórico de entregas publicadas, mas a revisão humana da R1-E.9.3.0 bloqueou o fechamento final. O objetivo original foi atingido parcialmente: home, projetos e cases chegaram a uma direção premium, porém o Developer Arcade e a navegação global precisam de replanejamento antes do encerramento.

Status publicado:

- R1-E.0: cleanup e preservação da candidata visual.
- R1-E.1: first fold living showcase.
- R1-E.2: cinematic loading system.
- R1-E.3: project visual asset foundation.
- R1-E.4: premium scroll narrative.
- R1-E.5: motion/interaction refinement.
- R1-E.5.1: final visual polish e readiness.
- R1-E.6: aplicação da candidata na home oficial `/`.
- R1-E.7: projetos e case studies premium.
- R1-E.8.0/R1-E.8.1: Developer Arcade foundation e Runtime Runner.
- R1-E.8.1.1: polish do Runtime Runner.
- R1-E.8.2: Bug Maze.
- R1-E.8.2.1: polish do Bug Maze.
- R1-E.8.3: Debug Arena.
- R1-E.8.3.1: polish do Debug Arena.
- R1-E.8.4: Latency Lab.
- R1-E.8.5: release gate do Developer Arcade.

Estado revisado antes do fechamento R1-E.9:

- Home oficial `/` validada como experiência premium.
- `/visual-final-candidate` preservada temporariamente como comparação.
- `/projetos` e `/projetos/[slug]` validados como experiência premium.
- `/lab` não validado como arcade final.
- Jogos finais desejados: Runtime Runner, Bug Maze, Code Snake e Stack Tetris.
- Debug Arena, Latency Lab e quiz/foundation challenge não devem ser vendidos como jogos finais.
- `/curriculo` e downloads preservados.
- `/api/score` permanece mock/local não persistente. O contrato atual ainda aceita `runtime`, `bug-maze`, `debug-arena` e `latency-lab`; contratos futuros devem acompanhar Code Snake e Stack Tetris em fases próprias.
- Sitemap, robots, metadata, links, idiomas, tema, acessibilidade, reduced motion e mobile validados.
- Produção deve ser validada por leitura quando disponível, sem deploy manual nesta fase.

Regras permanentes:

- Não inventar screenshots, métricas, clientes, ranking, analytics ou persistência.
- Não iniciar Supabase sem fase explícita.
- Não tratar módulos de treino como jogos finais.
- Não remover `/visual-final-candidate` sem decisão posterior.
- Não declarar paridade de produção com commit sem evidência observável.

### Critérios Globais de Aceite da R1-E

- Nada de dashboard como experiência principal.
- Nada de cards genéricos como solução dominante.
- Nada de PT/EN misturado.
- Nada de acentuação quebrada.
- Nada de mojibake.
- Nada de screenshot falso.
- Nada de aplicar na home antes de aprovação humana.
- Nada de Supabase antes da experiência visual estar aprovada.
- QA visual é obrigatório.
- Screenshots e, quando possível, vídeo curto são obrigatórios antes de pedir aprovação humana.

### Próximo Passo Oficial

A fase em execução local é:

```txt
R1-E.9.3.1 — Premium Interface, Motion & Navigation Polish
R1-E.9.3.1.1 — Premium UI, Theme & Transition Polish
```

Essa fase moderniza a navbar global, cria navegação direta na home, sincroniza motion, corrige textos/sobreposições e refina mobile antes de continuar o Arcade. Ainda precisa de QA visual e revisão humana antes de checkpoint.

A subfase R1-E.9.3.1.1 aprofunda tema claro, transições entre rotas, troca dark/light, troca PT/EN, tipografia, lazy/defer seguro e currículo, sem iniciar Arcade Reset, Code Snake, Stack Tetris ou Admin.

### Roadmap R1-C Recomendado

#### R1-C.0 — Documentation & Visual Contract

Objetivo:

- Atualizar documentação.
- Registrar critérios de aceite.
- Congelar tentativas visuais reprovadas como experimentos não aprovados.
- Deixar claro que aprovação visual humana é gate obrigatório.

Critérios de aceite:

- Documentação mestre atualizada.
- R1-C definida como direção oficial.
- Anti-patterns e gates visuais documentados.
- Nenhum código visual novo implementado nesta subfase.

#### R1-C.1 — Clean Reset

Objetivo:

- Descartar implementação visual reprovada se ainda estiver sem commit.
- Preservar rotas, downloads, tema, currículo, projetos, lab e conteúdo.
- Voltar para uma base técnica limpa antes de nova tentativa visual.

Critérios de aceite:

- Worktree limpo ou com escopo documentado.
- Nenhum arquivo de `public/resume/` ou `public/profile/` removido.
- `/curriculo`, `/projetos`, `/lab`, `/api/health` e downloads funcionando.

#### R1-C.2 — Design Foundation

Objetivo:

- Criar tokens de cor, tipografia, espaçamento, motion e foco.
- Organizar CSS para evitar `globals.css` descontrolado.
- Garantir i18n por locale e encoding limpo.
- Definir estilos base de dark e light premium antes de compor a home.

Critérios de aceite:

- Tokens nomeados e reutilizáveis.
- CSS organizado por seções.
- `prefers-reduced-motion` previsto desde o início.
- Strings PT/EN separadas por locale.
- Nenhum mojibake.

#### R1-C.3 — Premium Hero Only

Objetivo:

- Implementar apenas a primeira dobra.
- Validar desktop/mobile, PT/EN, dark/light.
- Gerar screenshots.
- Só avançar se o usuário aprovar visualmente.

Critérios de aceite:

- Causa boa primeira impressão em até 5 segundos.
- Não parece template genérico.
- Não parece dashboard.
- CTA principal visível sem scroll.
- Headline legível e forte.
- Foto/identity node bem integrado.
- Mobile não parece versão quebrada do desktop.
- Desktop e mobile têm composições próprias.
- PT e EN estão 100% separados.
- Acentuação correta.
- Screenshots fornecidos.
- Usuário aprova explicitamente.

#### R1-C.4 — Command Center / Command Palette

Objetivo:

- Implementar depois do hero aprovado.
- Tornar command center e command palette acessíveis, keyboard-first e visualmente premium.
- Evitar terminal grande vazio ou input sem propósito.

Critérios de aceite:

- Navegação por teclado preservada.
- Estados de foco claros.
- Visual compatível com o hero aprovado.
- Sem regressão em comandos existentes.

#### R1-C.5 — Below-the-fold Narrative

Objetivo:

- Projetos como missões.
- Skills como módulos.
- Lab/arcade teaser sem roubar foco do hero.
- Construir narrativa progressiva abaixo da primeira dobra.

Critérios de aceite:

- Abaixo da dobra complementa o hero, não compete com ele.
- Projetos usam dados reais.
- Skills mantêm níveis honestos.
- Lab/arcade teaser não promete jogos finalizados que ainda não existem.

#### R1-C.6 — QA, Performance and Release Gate

Objetivo:

- Playwright visual snapshots.
- Testes de i18n/encoding.
- Core Web Vitals.
- Lighthouse.
- Checklist final antes de commit, push ou deploy.

Critérios de aceite:

- `lint`, `typecheck` e `build` passam.
- Desktop e mobile validados visualmente.
- Dark e light validados.
- PT e EN validados.
- Sem overflow horizontal.
- Sem console/page errors.
- Produção Vercel serve a versão correta após publicação.

### Validação Visual Obrigatória

Para qualquer fase visual a partir da R1-C:

- O Codex deve usar Playwright sempre que possível.
- Se Browser MCP ou Chrome DevTools MCP estiverem disponíveis, também podem ser usados.
- A página real deve ser aberta localmente.
- Desktop e mobile devem ser testados.
- PT e EN devem ser testados.
- Dark e light devem ser testados.
- Screenshots devem ser salvos ou listados.
- Console errors e page errors devem ser inspecionados.
- Overflow horizontal deve ser verificado.
- Strings misturadas PT/EN devem ser procuradas.
- Mojibake deve ser procurado por sequências quebradas típicas e caracteres de substituição Unicode.

Se a ferramenta visual falhar, isso deve ser relatado. A entrega visual não deve ser tratada como aprovada apenas por validação textual ou build verde.

### Supabase Durante R1-C

Supabase ainda **não deve ser iniciado**.

O usuário ainda não criou nem configurou Supabase para este projeto. A prioridade atual é experiência visual, UX e aprovação humana da nova direção. Supabase, banco real, dashboard admin, ranking real e analytics persistente só devem entrar depois que a base visual estiver aprovada.

---

## 3. Princípio Central

Este projeto deve seguir a seguinte ideia:

> O portfólio não deve apenas dizer que Álvaro sabe desenvolver.  
> Ele deve provar isso através da própria experiência da página.

Cada seção precisa demonstrar uma habilidade válida:

- A interface demonstra front-end.
- Os dados estruturados demonstram organização.
- As rotas e APIs demonstram back-end.
- Os mini-games reais demonstram lógica, estado, interação e performance front-end.
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
Álvaro.dev — Developer Arcade OS
Álvaro.dev — Portfolio Arcade OS
```

A nomenclatura final pode ser ajustada, mas a ideia de “Portfolio OS” agora deve ser guiada pela direção Developer Arcade OS: a página deve parecer um sistema interativo memorável, com jogos e motion design, não apenas um currículo estático ou um painel comum.

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
- React Flow para arquitetura visual, se o Architecture Builder evoluir para canvas/blocos conectados.
- Canvas API, SVG ou CSS puro para mini-games 2D leves.
- CodeMirror leve ou editor fake em CSS para Debug Arena, se houver ganho real.
- next-themes para tema claro/escuro, se fizer sentido.

Não instalar todas as dependências de uma vez. Cada biblioteca precisa justificar valor claro para experiência, performance ou manutenção.

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

A home deve parecer a abertura de um Developer Arcade OS, não uma página estática nem um dashboard genérico. A versão em cards e grids simples é aceitável como fundação técnica, mas não atende a experiência final desejada.

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

Além dos CTAs, a primeira dobra deve ter uma peça visual forte: boot sequence, command center, cena interativa, background técnico animado ou outro elemento memorável. Um hero estático com texto e cards não é suficiente para a nova direção.

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

O Developer Lab deve evoluir para Developer Arcade: uma área com jogos reais e simulações visuais ligadas à programação. A versão atual baseada em perguntas, checklists e pontuação é uma fundação funcional, mas não satisfaz a definição final de mini-game.

### 11.1 Debug Arena

Experiência visual onde o usuário interage com uma interface de editor, identifica bugs em linhas de código e tenta corrigir antes do build falhar.

Funcionalidades:

- Mostrar código em interface de editor ou editor fake.
- Destacar linhas suspeitas.
- Permitir seleção/correção por interação real, não apenas alternativa estática.
- Mostrar feedback após a jogada.
- Explicar tecnicamente a correção.
- Pontuação.
- Dificuldade: fácil, médio, difícil.
- Estado de build, erro e sucesso com feedback visual.

Exemplo de desafio:

```ts
const total = prices.map(p => p.value).reduce((acc, value) => acc + value);

```

Problema: `reduce` sem valor inicial pode quebrar se a lista vier vazia.

O jogo deve explicar:

- Por que quebra.
- Como corrigir.
- Qual boa prática aplicar.

Se esta experiência for implementada apenas como quiz de múltipla escolha, ela deve ser tratada como protótipo didático, não como mini-game final.

### 11.2 Architecture Builder

Mini-game visual onde o usuário monta a arquitetura de uma aplicação com blocos, conexões ou canvas simples.

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

Não precisa começar com drag and drop complexo, mas a versão final deve parecer uma construção visual de arquitetura, não apenas uma checklist.

### 11.3 Latency Lab

Simulação visual de performance full stack.

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

O jogo deve mostrar métricas antes/depois, feedback e pontuação. Sempre que possível, deve ter painel visual de latência, waterfall, gráfico, barras ou outra representação clara do impacto das decisões.

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

Uma lista filtrável com barras pode ser usada como base, mas não deve ser chamada de radar se não houver visualização realmente diferenciada.

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

### Fase 5 — Developer Lab Foundation

Objetivo:

Adicionar a primeira fundação do Developer Lab, sem considerar esta entrega como a versão final dos mini-games.

Entregas:

- Debug Challenge.
- Architecture Builder.
- API Latency Game.
- Score local ou via API.
- Feedback técnico.
- Página `/lab`.

Critério de aceite:

Esta fase só é aceita como fundação técnica se demonstrar raciocínio, estado e feedback. Se os desafios forem quizzes, checklists ou formulários com score, eles não satisfazem a definição final de mini-game e devem ser substituídos no Roadmap de Resgate.

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

A fundação técnica deve estar pronta para deploy e validação pública. Isso não significa aprovação visual final: o projeto só deve ser tratado como portfólio premium depois do resgate criativo, dos jogos reais e da aprovação visual do usuário.

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

Observação obrigatória:
As fases 1 a 6 já formam uma fundação técnica. Para as próximas etapas, siga o Roadmap de Resgate e a direção Developer Arcade OS. Não trate cards, checklists ou quizzes como experiência final.

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
[ ] Confirmar se há jogo real jogável ou marcar como fundação/protótipo.
[ ] Rejeitar checklist/quiz como mini-game final.
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
[ ] Confirmar que o polimento não está sendo tratado como aprovação visual final.
[ ] Confirmar se a Vercel serve a versão Next.js correta.
[ ] Atualizar README final.
```

---

## 32. Definição de Pronto

A definição de pronto final fica suspensa até a conclusão do Roadmap de Resgate. As fases 1 a 6 comprovam fundação técnica, mas não comprovam experiência visual premium.

O projeto só deve ser considerado pronto como Álvaro.dev Portfolio OS final quando:

- A aplicação estiver em Next.js.
- O conteúdo atual estiver preservado.
- A arquitetura estiver componentizada.
- A home impressionar nos primeiros 5 segundos.
- O visual não parecer dashboard genérico.
- Houver motion design perceptível e respeitoso.
- Houver rota objetiva de currículo.
- Houver rota de projetos/case studies.
- Houver case studies com storytelling visual.
- Houver interatividade real, não apenas cards clicáveis.
- Houver pelo menos uma demonstração de back-end.
- O terminal parecer command center.
- O Developer Lab tiver pelo menos um jogo real jogável relacionado à programação.
- Os mini-games tiverem estado, regras, pontuação e feedback visual.
- Houver documentação.
- Build estiver passando.
- Mobile estiver bom.
- Tema claro/escuro funcionando.
- PT/EN funcionando.
- Links funcionando.
- PDF/DOCX disponíveis.
- A produção Vercel servir a versão correta.
- O usuário aprovar visualmente a experiência antes do commit final.
- O projeto estiver pronto para ser enviado em processo seletivo como peça premium.

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

Portanto, uma versão apenas organizada, estável e funcional ainda não é suficiente. A próxima etapa deve provar criatividade front-end, domínio de UX e lógica interativa por meio de uma experiência visual memorável.
