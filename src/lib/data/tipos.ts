import "server-only";
import { db, tiposPeca, tiposServico } from "@/db/client";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/ids";

// ── Tipos de Peça ──

export async function getTiposPeca() {
  return db.select().from(tiposPeca).where(eq(tiposPeca.ativo, true));
}

export async function saveTipoPeca(data: { id?: string | null; nome: string; unidade?: string }) {
  const nome = String(data.nome || "").trim();
  if (!nome) throw new Error("Informe o nome do tipo de peça");
  const unidade = data.unidade || "m²";

  if (data.id) {
    await db.update(tiposPeca).set({ nome, unidade }).where(eq(tiposPeca.id, data.id));
    return data.id;
  }
  const id = newId();
  await db.insert(tiposPeca).values({ id, nome, unidade, ativo: true });
  return id;
}

export async function deleteTipoPeca(id: string) {
  await db.update(tiposPeca).set({ ativo: false }).where(eq(tiposPeca.id, id));
  return true;
}

// ── Tipos de Serviço ──

export async function getTiposServico() {
  return db.select().from(tiposServico).where(eq(tiposServico.ativo, true));
}

export async function saveTipoServico(data: { id?: string | null; nome: string }) {
  const nome = String(data.nome || "").trim();
  if (!nome) throw new Error("Informe o nome do tipo de serviço");

  if (data.id) {
    await db.update(tiposServico).set({ nome }).where(eq(tiposServico.id, data.id));
    return data.id;
  }
  const id = newId();
  await db.insert(tiposServico).values({ id, nome, ativo: true });
  return id;
}

export async function deleteTipoServico(id: string) {
  await db.update(tiposServico).set({ ativo: false }).where(eq(tiposServico.id, id));
  return true;
}
