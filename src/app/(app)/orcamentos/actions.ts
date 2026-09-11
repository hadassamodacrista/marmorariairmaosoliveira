"use server";

import { revalidatePath } from "next/cache";
import { deleteOrcamento, saveOrcamento, type OrcamentoInput } from "@/lib/data/orcamentos";
import { runAction } from "@/lib/action-result";

export async function excluirOrcamentoAction(id: string) {
  return runAction(async () => {
    await deleteOrcamento(id);
    revalidatePath("/orcamentos");
    revalidatePath("/dashboard");
  });
}

export async function salvarOrcamentoAction(data: OrcamentoInput) {
  return runAction(async () => {
    const id = await saveOrcamento(data);
    revalidatePath("/orcamentos");
    revalidatePath("/dashboard");
    revalidatePath(`/orcamentos/${id}`);
    return id;
  });
}
