"use server";

import { revalidatePath } from "next/cache";
import { saveTipoServico, deleteTipoServico } from "@/lib/data/tipos";
import { runAction } from "@/lib/action-result";

export async function salvarTipoServicoAction(data: { id?: string | null; nome: string }) {
  return runAction(async () => {
    const id = await saveTipoServico(data);
    revalidatePath("/tipos-servico");
    revalidatePath("/orcamentos/novo");
    return id;
  });
}

export async function excluirTipoServicoAction(id: string) {
  return runAction(async () => {
    await deleteTipoServico(id);
    revalidatePath("/tipos-servico");
  });
}
