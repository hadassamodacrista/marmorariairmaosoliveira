import "server-only";
import { db, config } from "@/db/client";
import { sql } from "drizzle-orm";

export type ConfigMap = Record<string, string>;

export async function getConfig(): Promise<ConfigMap> {
  const linhas = await db.select().from(config);
  const mapa: ConfigMap = {};
  for (const l of linhas) if (l.chave) mapa[l.chave] = l.valor ?? "";
  return mapa;
}

export async function saveConfig(updates: Record<string, string>) {
  for (const [chave, valor] of Object.entries(updates)) {
    await db
      .insert(config)
      .values({ chave, valor })
      .onConflictDoUpdate({ target: config.chave, set: { valor } });
  }
  return true;
}

export async function proximoNumeroOrcamento(): Promise<number> {
  const res = await db.execute(sql`select nextval('orcamento_numero_seq') as numero`);
  // O formato de retorno varia entre o driver do Neon (HTTP) e o PGlite;
  // cobre os dois formatos possíveis (array direto ou { rows: [...] }).
  const linhas = (Array.isArray(res) ? res : res.rows) as Array<{ numero: string | number }>;
  return Number(linhas[0].numero);
}
