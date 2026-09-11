"use server";

import { redirect } from "next/navigation";
import { verificarCredenciais, criarSessao } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "");
  const senha = String(formData.get("senha") || "");
  const next = String(formData.get("next") || "/dashboard");

  const ok = await verificarCredenciais(email, senha);
  if (!ok) {
    return { error: "E-mail ou senha inválidos." };
  }

  await criarSessao(email);
  redirect(next.startsWith("/") ? next : "/dashboard");
}
