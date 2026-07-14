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
project_media_assets
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
POST   /api/admin/media/signature
POST   /api/admin/media/register
POST   /api/admin/media/rollback
DELETE /api/admin/media/[id]
```

As mutações exigem sessão administrativa válida, validação de mesma origem e conteúdo aprovado pelo schema Zod.

`DELETE` arquiva o projeto; não remove o documento definitivamente.

## Mídias dos projetos

O Admin usa Cloudinary para armazenar binários e MongoDB para registrar metadados, vínculo com o projeto, função e ordem. Documentos de projeto não armazenam arquivos binários nem base64.

Fluxo de upload:

1. Admin autenticado solicita uma assinatura em `/api/admin/media/signature`.
2. O servidor valida sessão, mesma origem, slug, MIME e tamanho.
3. O navegador envia o arquivo diretamente para Cloudinary.
4. O navegador envia o resultado sanitizado para `/api/admin/media/register`.
5. O backend valida assinatura, URL HTTPS, formato, tamanho, pasta esperada e registra `project_media_assets`.
6. Se o registro falhar após upload bem-sucedido, o cliente solicita rollback protegido em `/api/admin/media/rollback`.
7. Ao salvar o projeto, o backend sincroniza `visuals.logo`, `visuals.logoAlt`, `visuals.thumbnail`, `visuals.heroImage`, `visuals.gallery`, `visuals.alt` e `visuals.status`.

Limites:

- imagens: `image/jpeg`, `image/png`, `image/webp`, `image/avif` até 10 MB;
- no máximo 20 imagens por projeto;
- no máximo uma logo ativa por projeto;
- pasta Cloudinary fixa: `portfolio-os/projects/{projectSlug}/`.

Funções:

- `logo`: logo real do projeto, exibida em tiles e cards;
- `thumbnail`: capa do card público;
- `hero`: hero do case;
- `gallery`: galeria ordenada;
- `unassigned`: mídia cadastrada, mas ainda não usada publicamente.

Alt PT/EN é obrigatório para publicar imagens usadas como logo, thumbnail, hero ou galeria.

## Exclusão de mídia

A exclusão valida que o asset pertence ao projeto e usa somente o `publicId` persistido no MongoDB. URLs arbitrárias enviadas pelo cliente não são usadas para apagar assets.

Em caso de falha no Cloudinary, o registro local não é marcado como deletado e a resposta retorna erro sanitizado. Em sucesso, o projeto remove referências ao asset, uma revisão é criada e o documento em `project_media_assets` recebe `deletedAt`.

## Histórico

Criação, publicação, atualização e arquivamento geram documentos em `portfolio_project_revisions`.

O editor exibe as revisões recentes. A restauração automática por um clique fica para uma fase posterior, após definir regras de conflito e auditoria.

## Autenticação

A persistência de projetos, Arcade e autenticação administrativa usa MongoDB. As APIs administrativas exigem sessão válida em `admin_sessions`, e as mutações continuam protegidas por validação de mesma origem.
