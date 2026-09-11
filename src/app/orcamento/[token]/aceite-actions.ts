"use server";

import { headers } from "next/headers";
import { registrarAceite } from "@/lib/data/aceite";
import { runAction } from "@/lib/action-result";

export async function registrarAceiteAction(input: {
  token: string;
  acao: "aprovar" | "recusar";
  nome: string;
  documento?: string;
  observacao?: string;
  userAgent?: string;
}) {
  return runAction(async () => {
    const h = await headers();
    // Vantagem sobre o Apps Script: aqui dá pra capturar o IP de verdade.
    const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "";
    return registrarAceite({ ...input, ip });
  });
}
