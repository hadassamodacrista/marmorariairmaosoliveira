"use server";

import { revalidatePath } from "next/cache";
import { saveMaterial, deleteMaterial, type MaterialInput } from "@/lib/data/materiais";
import { runAction } from "@/lib/action-result";

export async function salvarMaterialAction(data: MaterialInput) {
  return runAction(async () => {
    const id = await saveMaterial(data);
    revalidatePath("/materiais");
    revalidatePath("/orcamentos/novo");
    return id;
  });
}

export async function excluirMaterialAction(id: string) {
  return runAction(async () => {
    await deleteMaterial(id);
    revalidatePath("/materiais");
  });
}
