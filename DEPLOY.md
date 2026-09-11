# Publicar em produção (GitHub + Vercel + Neon)

Tudo nos planos gratuitos. Você precisa de conta no GitHub, na Vercel e na
Neon — como envolve login/senha nessas contas, essa parte é sua; o resto eu
deixei pronto.

---

## 1. Colocar o projeto no GitHub

```bash
git init                       # se ainda não fez
git add -A
git commit -m "Sistema web da marmoraria"
```

Crie um repositório vazio em https://github.com/new (pode ser privado) e
depois:

```bash
git remote add origin https://github.com/SEU_USUARIO/marmoraria-web.git
git branch -M main
git push -u origin main
```

---

## 2. Criar o banco no Neon

1. Crie uma conta em https://neon.tech (dá pra entrar com o GitHub)
2. **New Project** → nome "marmoraria" → região mais próxima (ex.: US East, não tem região Brasil ainda)
3. Copie a **Connection string** (algo como `postgres://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require`)

Guarde essa string — é o valor de `DATABASE_URL`.

### Criar as tabelas no Neon

Na sua máquina, na pasta do projeto:

```bash
DATABASE_URL="cole-a-connection-string-aqui" npm run db:push
```

(No Windows PowerShell: `$env:DATABASE_URL="..."; npm run db:push`)

Isso cria todas as tabelas no banco novo. Depois, se for começar do zero
(sem importar dados antigos — veja seção 5), rode também:

```bash
DATABASE_URL="cole-a-connection-string-aqui" npm run db:seed
```

---

## 3. Publicar na Vercel

1. Crie uma conta em https://vercel.com (entre com o GitHub — mais fácil)
2. **Add New… → Project** → selecione o repositório `marmoraria-web`
3. Em **Environment Variables**, adicione:

| Nome | Valor |
|---|---|
| `DATABASE_URL` | a connection string do Neon |
| `SESSION_SECRET` | uma string aleatória longa — gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL` | o e-mail que você vai usar pra logar |
| `ADMIN_PASSWORD_HASH` | veja como gerar logo abaixo |
| `NEXT_PUBLIC_BASE_URL` | a URL que a Vercel vai te dar, ex. `https://marmoraria-web.vercel.app` (dá pra editar depois de criar) |

Opcional — um segundo login, só pra quem dá suporte (não precisa saber a
senha do cliente pra entrar e ajudar):

| Nome | Valor |
|---|---|
| `SUPPORT_EMAIL` | seu e-mail de suporte |
| `SUPPORT_PASSWORD_HASH` | gere do mesmo jeito que o `ADMIN_PASSWORD_HASH`, com uma senha diferente |

4. Clique **Deploy**.

### Gerando o `ADMIN_PASSWORD_HASH`

Em vez de guardar sua senha em texto puro nas variáveis de ambiente da
Vercel, gere um hash:

```bash
node -e "require('bcryptjs').hash(process.argv[1], 10).then(console.log)" "SuaSenhaForte123"
```

Copie o resultado (começa com `$2a$` ou `$2b$`) para `ADMIN_PASSWORD_HASH`.
Não defina `ADMIN_PASSWORD` em produção se usar o hash.

### Depois do primeiro deploy

Volte em **Environment Variables**, corrija `NEXT_PUBLIC_BASE_URL` para a
URL real que a Vercel gerou (necessário para o link do orçamento e a
mensagem de WhatsApp ficarem corretos) e clique **Redeploy**.

---

## 4. Testar

1. Abra a URL da Vercel → tela de login → entre com `ADMIN_EMAIL` + a senha
   que você hasheou.
2. Cadastre um material, um cliente, crie um orçamento de teste.
3. Gere o PDF e a lista de corte.
4. Copie o link público (botão WhatsApp) e abra numa aba anônima — deve
   mostrar o orçamento e o bloco de aprovação.

---

## 5. Migração de dados (se você já usa o sistema antigo)

1. Abra o projeto **antigo** no editor do Apps Script (o que tem `db.gs`, `Code.gs`...).
2. Crie um arquivo novo, cole o conteúdo de `scripts/exportar-dados.gs` deste projeto.
3. No editor, selecione a função `exportarDadosParaMigracao` e clique ▶ Executar.
4. Autorize se pedir. Ao terminar, veja em **Execuções** (ou `Logger`) o link do arquivo `marmoraria-export.json` gerado no seu Drive.
5. Baixe esse arquivo e salve como `scripts/dados-exportados.json` neste projeto (`marmoraria-web`).
6. Rode a importação **contra o banco do Neon**:

```bash
DATABASE_URL="cole-a-connection-string-aqui" npm run migrate:import
```

Isso importa clientes, materiais, tipos, fornecedores, contas a pagar e
todos os orçamentos (com itens e parcelas), preservando os IDs e a
numeração dos orçamentos. Pode rodar de novo se precisar corrigir algo — ele
limpa as tabelas antes de reimportar (a não ser que você rode com
`--sem-limpar`).

**O que não migra automaticamente:**
- **Logo da empresa** — antes era um arquivo do Google Drive; agora é uma
  URL de imagem. Hospede a logo em algum lugar (seu site, um serviço de
  imagens) e cole o link em Configurações → "URL da logo".
- **PDFs já gerados** — ficam no Drive antigo; o sistema novo gera PDF na
  hora, sob demanda, então não precisa migrá-los.
7. Depois de importar, apague o arquivo `exportar-dados.gs` do projeto
   antigo (ele só precisa rodar uma vez).

---

## Domínio próprio (opcional)

Na Vercel: **Settings → Domains** do projeto → adicione seu domínio e siga
as instruções de DNS. Lembre de atualizar `NEXT_PUBLIC_BASE_URL` depois.

---

## Sobre o plano gratuito da Vercel

O plano **Hobby** da Vercel é, pelos termos de uso, para projetos pessoais
e não-comerciais. Um sistema financeiro da sua empresa é uso comercial —
na prática muita gente usa o Hobby para ferramentas internas pequenas sem
problema, mas o correto conforme os termos é o plano **Pro** (a partir de
US$20/mês) se quiser ficar 100% dentro das regras. O Neon não tem essa
restrição no plano gratuito.

---

## Atualizações futuras

Qualquer alteração de código: `git push` na branch `main` — a Vercel
publica uma nova versão sozinha. Para mudar o schema do banco depois de
editar `src/db/schema.ts`, rode `DATABASE_URL="..." npm run db:push`
apontando pro Neon antes (ou depois) do deploy.
