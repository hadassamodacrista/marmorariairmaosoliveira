"use server";

import { revalidatePath } from "next/cache";
import { saveTipoPeca, deleteTipoPeca } from "@/lib/data/tipos";
import { runAction } from "@/lib/action-result";

export async function salvarTipoPecaAction(data: { id?: string | null; nome: string; unidade?: string }) {
  return runAction(async () => {
    const id = await saveTipoPeca(data);
    revalidatePath("/tipos-peca");
    revalidatePath("/orcamentos/novo");
    return id;
  });
}

export async function excluirTipoPecaAction(id: string) {
  return runAction(async () => {
    await deleteTipoPeca(id);
    revalidatePath("/tipos-peca");
  });
}
