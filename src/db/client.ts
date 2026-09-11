// Sem "server-only" aqui de propósito: este módulo também é importado
// pelo script de seed (rodado fora do Next.js, via tsx). Nenhum componente
// cliente deve importar "@/db/client" diretamente — só server actions,
// route handlers e scripts.
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";

// Dois modos, mesmo dialeto (Postgres) e mesmo schema Drizzle:
//  - Produção (Vercel): DATABASE_URL aponta pro Neon -> driver serverless.
//  - Desenvolvimento local: sem DATABASE_URL -> banco Postgres embutido
//    (PGlite), gravado em ./.pglite-data. Não precisa Docker nem instalar
//    Postgres na máquina.
//
// A conexão é criada de forma preguiçosa (só na primeira consulta de
// verdade, via Proxy) — não na importação do módulo. Isso evita que os
// vários processos paralelos do `next build` (fase "collecting page data")
// tentem abrir o mesmo arquivo do PGlite ao mesmo tempo, o que trava o
// WASM dele. Em produção (Neon) isso é só uma otimização; em dev local é
// necessário para o build não sujar o log com erros inofensivos.
//
// Usa require() (não import) de propósito: assim o pacote que não está em
// uso (PGlite em produção, driver do Neon em dev) nem entra no bundle. Os
// tipos acima são "import type" — apagados na compilação.

type AppDatabase = NeonHttpDatabase<typeof schema> | PgliteDatabase<typeof schema>;

function criarConexao(): AppDatabase {
  if (process.env.DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/neon-http");
    const sql = neon(process.env.DATABASE_URL);
    return drizzle(sql, { schema });
  }

  // Sem DATABASE_URL: em dev local isso é intencional (banco PGlite).
  // Na Vercel (ou qualquer ambiente serverless) o sistema de arquivos é
  // somente leitura, então tentar criar o PGlite aqui só ia falhar com um
  // erro confuso — falha com uma mensagem clara em vez disso.
  if (process.env.VERCEL) {
    throw new Error(
      "DATABASE_URL não está configurada nesta implantação da Vercel. " +
        "Verifique em Project Settings → Environment Variables se DATABASE_URL " +
        "está marcada para o ambiente Production (e Preview, se usar), e faça um " +
        "novo Redeploy depois de salvar."
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require("@electric-sql/pglite");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/pglite");
  const client = new PGlite(path.join(process.cwd(), ".pglite-data"));
  return drizzle(client, { schema });
}

let conexao: AppDatabase | null = null;
function obterConexao(): AppDatabase {
  if (!conexao) conexao = criarConexao();
  return conexao;
}

export const db: AppDatabase = new Proxy({} as AppDatabase, {
  get(_target, prop, _receiver) {
    const real = obterConexao() as unknown as Record<string | symbol, unknown>;
    const valor = real[prop];
    return typeof valor === "function" ? valor.bind(real) : valor;
  },
});

export * from "./schema";
