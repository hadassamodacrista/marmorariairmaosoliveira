"use server";

import { revalidatePath } from "next/cache";
import { saveFinanceiro, type SalvarFinanceiroInput } from "@/lib/data/financeiro";
import { runAction } from "@/lib/action-result";

export async function salvarFinanceiroAction(data: SalvarFinanceiroInput) {
  return runAction(async () => {
    await saveFinanceiro(data);
    revalidatePath("/financeiro/receber");
    revalidatePath("/financeiro/fluxo");
    revalidatePath("/dashboard");
  });
}
