"use server";

import { revalidatePath } from "next/cache";
import { saveCliente, deleteCliente, type ClienteInput } from "@/lib/data/clientes";
import { runAction } from "@/lib/action-result";

export async function salvarClienteAction(data: ClienteInput) {
  return runAction(async () => {
    const id = await saveCliente(data);
    revalidatePath("/clientes");
    revalidatePath("/orcamentos/novo");
    return id;
  });
}

export async function excluirClienteAction(id: string) {
  return runAction(async () => {
    await deleteCliente(id);
    revalidatePath("/clientes");
  });
}
