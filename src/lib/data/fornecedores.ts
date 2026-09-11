import "server-only";
import { db, fornecedores, contasPagar } from "@/db/client";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/ids";

export type FornecedorInput = {
  id?: string | null;
  nome: string;
  tipo?: string;
  documento?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
};

export async function getFornecedores(incluirInativos = false) {
  const linhas = await db.select().from(fornecedores);
  return incluirInativos ? linhas : linhas.filter((f: { ativo: boolean }) => f.ativo);
}

export async function saveFornecedor(data: FornecedorInput) {
  const nome = String(data.nome || "").trim();
  if (!nome) throw new Error("Informe o nome do fornecedor");

  const valores = {
    nome,
    tipo: data.tipo || "outro",
    documento: data.documento || "",
    telefone: data.telefone || "",
    email: data.email || "",
    observacoes: data.observacoes || "",
  };

  if (data.id) {
    await db.update(fornecedores).set(valores).where(eq(fornecedores.id, data.id));
    return data.id;
  }
  const id = newId();
  await db.insert(fornecedores).values({ id, ...valores, ativo: true });
  return id;
}

export async function deleteFornecedor(id: string): Promise<"inativado" | "excluido"> {
  const vinculadas = await db.select().from(contasPagar).where(eq(contasPagar.fornecedorId, id));
  if (vinculadas.length > 0) {
    await db.update(fornecedores).set({ ativo: false }).where(eq(fornecedores.id, id));
    return "inativado";
  }
  await db.delete(fornecedores).where(eq(fornecedores.id, id));
  return "excluido";
}
