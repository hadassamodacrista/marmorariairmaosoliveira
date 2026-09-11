import "server-only";
import { db, materiais } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { newId } from "@/lib/ids";

export type MaterialInput = {
  id?: string | null;
  tipo: string;
  descricao: string;
  precoM2: number | string;
};

export async function getMateriais() {
  return db.select().from(materiais).where(eq(materiais.ativo, true));
}

export async function saveMaterial(data: MaterialInput) {
  const descricao = String(data.descricao || "").trim();
  if (!descricao) throw new Error("Informe a descrição do material");
  const preco = parseFloat(String(data.precoM2 || 0).replace(",", "."));

  if (data.id) {
    await db
      .update(materiais)
      .set({ tipo: data.tipo, descricao, precoM2: String(preco) })
      .where(eq(materiais.id, data.id));
    return data.id;
  }

  const id = newId();
  await db.insert(materiais).values({ id, tipo: data.tipo, descricao, precoM2: String(preco), ativo: true });
  return id;
}

export async function deleteMaterial(id: string) {
  // desativa (mantém histórico de orçamentos que já usaram este material)
  await db.update(materiais).set({ ativo: false }).where(and(eq(materiais.id, id)));
  return true;
}
