# Marmoraria — Orçamentos (versão web)

Sistema de orçamentos, aceite digital do cliente e financeiro (contas a
receber, contas a pagar, fluxo de caixa) para marmoraria. Reescrita do
sistema que rodava em Google Apps Script, agora em **Next.js + Postgres**,
pronta para hospedar de graça em **Vercel + Neon**, versionada no **GitHub**.

## Stack

- **Next.js 16** (App Router, TypeScript) — front-end e back-end no mesmo projeto
- **Postgres via [Neon](https://neon.tech)** (produção) — em desenvolvimento roda um banco local embutido (PGlite), sem precisar instalar nada
- **Drizzle ORM** — schema e queries (`src/db/schema.ts`)
- **Login** — sessão em cookie assinado (JWT), um usuário administrador definido por variável de ambiente
- **@react-pdf/renderer** — gera o PDF do orçamento e a lista de corte direto em código, sem depender de Google Docs
- **Bootstrap 5** (via CDN) — mesmo visual do sistema anterior

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # ajuste ADMIN_EMAIL / ADMIN_PASSWORD se quiser
npm run db:push              # cria as tabelas no banco local
npm run db:seed              # configuração padrão + tipos de peça
npm run dev
```

Acesse http://localhost:3000 — login com o `ADMIN_EMAIL`/`ADMIN_PASSWORD` do
`.env.local` (padrão de exemplo no `.env.example`).

Sem `DATABASE_URL` configurada, os dados ficam num banco local (pasta
`.pglite-data/`, ignorada pelo git) — pode apagar essa pasta a qualquer
momento para "zerar" o ambiente de testes.

## Estrutura

```
src/
  db/            schema Drizzle + cliente do banco (Neon ou local)
  lib/
    data/        acesso a dados por entidade (clientes, orçamentos, financeiro...)
    pdf/         geração dos PDFs (react-pdf)
    auth.ts      login / sessão
  app/
    login/
    (app)/       páginas internas (protegidas por login): dashboard,
                 orçamentos, financeiro, cadastros, configurações
    orcamento/[token]/   página pública do orçamento + aceite digital
    api/pdf/...  rotas que geram os PDFs (protegidas)
    api/publico/pdf/[token]  PDF público (sem login), pelo link do cliente
scripts/
  exportar-dados.gs   cole no projeto antigo (Apps Script) para exportar os dados
  import-dados.ts     importa o JSON exportado para este banco
```

## Publicar (Vercel + Neon + GitHub)

Veja o passo a passo completo em [DEPLOY.md](./DEPLOY.md).

## Migrar os dados do sistema antigo (planilha)

Veja a seção "Migração de dados" em [DEPLOY.md](./DEPLOY.md).
