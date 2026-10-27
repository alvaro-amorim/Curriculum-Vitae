# Álvaro.dev Portfolio OS

Portfólio profissional de Álvaro Amorim construído em Next.js. O produto reúne uma home interativa, currículo, projetos em formato de case study e um Developer Arcade com quatro jogos e ranking persistente.

Este README descreve o estado versionado do repositório. Histórico de decisões, planos e infraestrutura externa não devem ser confundidos com funcionalidade concluída ou validação reproduzível.

## Como avaliar

- [Aplicação publicada](https://curriculum-vitae-babr.vercel.app/).
- O site lê os projetos publicados no MongoDB, gerenciados pelo painel administrativo.
- `src/content/project-catalog.ts`, `src/content/projects.ts` e `src/content/additional-projects.ts` mantêm a base versionada de curadoria e importação.
- APIs, sessões e administração são server-side; a infraestrutura publicada deve ser validada separadamente.
- Os scripts de lint, typecheck, testes e build estão descritos abaixo.

Os cadernos de estudo não fazem parte do runtime web. A remoção recente do notebook da raiz foi preservada nesta revisão.

## Estado confirmado no código

- Next.js App Router, React, TypeScript, Tailwind CSS, Zod e MongoDB.
- Rotas públicas principais: `/`, `/projetos`, `/projetos/[slug]`, `/lab` e `/curriculo`.
- A Home possui carrossel de projetos, stack, processo, chamada para o Arcade, seção Sobre e CTA final.
- O Developer Arcade possui Runtime Runner, Bug Maze, Code Snake e Stack Tetris.
- `/api/score` valida o Score Contract v3 e persiste scores em `arcade_scores` por Route Handler server-side.
- `/api/player-session` mantém uma sessão anônima em cookie `httpOnly` e persiste somente um hash HMAC em `arcade_sessions`.
- `/api/leaderboard` usa MongoDB para retornar o melhor score de cada jogador por jogo e período.
- `/api/leaderboard/me` retorna a posição do jogador atual sem expor `session_hash` ou ids internos.
- O navegador não acessa diretamente as coleções do Arcade; todas as leituras e escritas passam por Route Handlers.
- A autenticação administrativa usa usuário owner e sessões persistidas no MongoDB.
- O Admin de projetos gerencia imagens com upload direto assinado para Cloudinary e metadados em MongoDB.
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
- conectividade com o MongoDB Atlas;
- índices e TTLs do MongoDB aplicados;
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

### Escopo da validação

O código atual contém bootstrap agregado, rate limit e testes de contratos de sessão, ranking e payloads. A presença dessas implementações não comprova o estado do deploy nem proteção completa contra scores fabricados pelo cliente.

Antes de afirmar estabilidade operacional, valide concorrência, limites, comportamento do histórico e integrações no ambiente pretendido. As verificações não devem usar dados ou credenciais de produção.

## Conteúdo e projetos

A página `/projetos`, os detalhes, a Home e o sitemap consultam os projetos publicados no MongoDB por `src/lib/projects/repository.ts`. Alterações nos arquivos de conteúdo não atualizam automaticamente os registros já publicados; esses registros devem ser revisados pelo painel administrativo, preservando seu histórico.

`src/content/project-catalog.ts` reúne a base versionada de curadoria, composta pelo conteúdo de `projects.ts` e `additional-projects.ts`, usada na importação e nos testes dessa base. A Home usa estruturas extraídas para copy, ícones e apresentação dos projetos em:

```txt
src/content/home-copy.ts
src/content/home-projects.ts
src/components/visual-final-candidate/home-icons.tsx
```

A consolidação completa entre apresentação da Home e catálogo de cases permanece como refinamento futuro, porque exige revisão visual e de conteúdo projeto a projeto.

Os projetos usam placeholders honestos enquanto imagens reais não estiverem disponíveis. Quando mídias forem cadastradas no Admin, o MongoDB mantém metadados, vínculo, função e ordem, enquanto Cloudinary armazena os binários e entrega URLs públicas otimizadas.

```txt
thumbnail: null
heroImage: null
gallery: []
logo: null
logoAlt: { pt: "...", en: "..." }
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
/api/score                Persistência de Score Contract v3
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
- MongoDB Node.js Driver 6
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
MONGODB_URI=
MONGODB_DB=portfolio_os
ARCADE_SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Regras:

- `MONGODB_URI`, `ARCADE_SESSION_SECRET` e `CLOUDINARY_API_SECRET` são server-only;
- nenhum segredo pode usar prefixo `NEXT_PUBLIC_`;
- o projeto não usa cliente de banco no navegador para acessar o Arcade;
- o navegador recebe somente assinatura temporária, `api_key`, timestamp e `public_id` permitido para upload direto no Cloudinary;
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
npm run mongodb:setup
npm run admin:bootstrap -- --email "email@dominio.com"
npm run start
```

`npm run validate:foundation` depende de uma aplicação em execução. A variável opcional `PORTFOLIO_BASE_URL` permite apontar o script para outra origem.

## Banco operacional

O runtime usa MongoDB Atlas para Arcade, projetos, autenticação administrativa e metadados de mídias dos projetos. O script `npm run mongodb:setup` cria índices e TTLs sem apagar dados.

Imagens de projetos:

- coleção: `project_media_assets`;
- provider: Cloudinary;
- pasta por projeto: `portfolio-os/projects/{projectSlug}/`;
- imagens permitidas: JPEG, PNG, WebP e AVIF até 10 MB;
- limite: 20 imagens por projeto;
- funções separadas: logo, thumbnail, hero e galeria;
- exclusão remove a referência do projeto, registra revisão e só marca o asset como deletado após confirmação do Cloudinary.

Consulte `docs/arcade-db-foundation.md` para o desenho operacional do Arcade.
Consulte `docs/admin-projects-mongodb.md` para o fluxo editorial de projetos e mídias.

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

Validação final da branch:

```txt
GitHub Actions CI: success
Vercel preview build: success
```

Relatório detalhado:

```txt
docs/foundation-stabilization-audit.md
```

## Manutenção e evolução

O histórico de fases não deve ser interpretado como uma lista atual de funcionalidades ausentes. Administração autenticada, gestão de mídias, bootstrap e rate limit já possuem implementação versionada.

Prioridades de manutenção:

- manter catálogo, links e informações profissionais coerentes com os repositórios públicos;
- ampliar validação dos contratos e dos fluxos administrativos;
- acompanhar sessões, histórico e retenção conforme o ambiente de publicação;
- verificar experiência móvel, acessibilidade e desempenho;
- preservar o caráter privado dos códigos comerciais e materiais reutilizáveis.

Consulte os documentos de auditoria e o histórico Git para decisões anteriores.

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
