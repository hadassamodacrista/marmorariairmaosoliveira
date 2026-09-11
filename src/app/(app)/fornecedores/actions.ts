"use server";

import { revalidatePath } from "next/cache";
import { saveFornecedor, deleteFornecedor, type FornecedorInput } from "@/lib/data/fornecedores";
import { runAction } from "@/lib/action-result";

export async function salvarFornecedorAction(data: FornecedorInput) {
  return runAction(async () => {
    const id = await saveFornecedor(data);
    revalidatePath("/fornecedores");
    revalidatePath("/financeiro/pagar");
    return id;
  });
}

export async function excluirFornecedorAction(id: string) {
  return runAction(async () => {
    const resultado = await deleteFornecedor(id);
    revalidatePath("/fornecedores");
    return resultado;
  });
}
