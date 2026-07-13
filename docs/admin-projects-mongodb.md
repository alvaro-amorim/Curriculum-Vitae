# Admin de projetos com MongoDB

Esta fase move a camada editorial dos projetos para o MongoDB Atlas sem remover o catálogo estático versionado.

## Segurança do catálogo público

O portfólio continua funcional mesmo se o banco estiver temporariamente indisponível:

- sem documentos no MongoDB, `/projetos` usa `src/content/projects.ts`;
- erro de conexão mantém o catálogo estático;
- JSON publicado inválido não substitui um projeto estático válido;
- documento `published` substitui o projeto estático com o mesmo slug;
- documento `draft` ou `archived` oculta o slug correspondente;
- um novo documento `published` adiciona um novo case ao catálogo;
- a Home permanece versionada nesta fase.

Toda leitura e escrita do MongoDB acontece no servidor. A URI nunca é enviada ao navegador.

## Coleções

```txt
portfolio_projects
portfolio_project_revisions
```

Os índices são criados por:

```bash
npm run mongodb:setup
```

## Importação inicial

A importação é aditiva: apenas slugs ausentes são criados. Edições administrativas existentes nunca são sobrescritas.

Pelo terminal local:

```bash
npm run mongodb:import-projects
```

Pelo painel:

```txt
/admin/projects
→ Importar projetos ausentes
```

## Estados editoriais

### Draft

Permanece disponível no Admin, mas não aparece publicamente.

### Published

Substitui o fallback estático do mesmo slug ou adiciona um novo projeto.

### Archived

Permanece no histórico administrativo e deixa de aparecer publicamente.

## Rotas administrativas

```txt
/admin/projects
/admin/projects/new
/admin/projects/[slug]
```

## APIs protegidas

```txt
GET    /api/admin/projects
POST   /api/admin/projects
GET    /api/admin/projects/[slug]
PUT    /api/admin/projects/[slug]
DELETE /api/admin/projects/[slug]
POST   /api/admin/projects/import
```

As mutações exigem sessão administrativa válida, validação de mesma origem e conteúdo aprovado pelo schema Zod.

`DELETE` arquiva o projeto; não remove o documento definitivamente.

## Histórico

Criação, publicação, atualização e arquivamento geram documentos em `portfolio_project_revisions`.

O editor exibe as revisões recentes. A restauração automática por um clique fica para uma fase posterior, após definir regras de conflito e auditoria.

## Autenticação

A persistência de projetos e do Arcade já usa MongoDB. A autenticação administrativa ainda usa Supabase Auth temporariamente e será migrada em uma etapa separada.
