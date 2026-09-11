"use server";

import { revalidatePath } from "next/cache";
import { saveConfig } from "@/lib/data/config";
import { runAction } from "@/lib/action-result";

export async function salvarConfigAction(data: Record<string, string>) {
  return runAction(async () => {
    await saveConfig(data);
    revalidatePath("/configuracoes");
    revalidatePath("/dashboard");
  });
}
