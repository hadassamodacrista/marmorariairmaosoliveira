import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE, criarToken, verificarToken } from "./jwt";

/**
 * Login de administrador único (definido por variáveis de ambiente).
 * Sem cadastro de usuário, sem banco: é assim mesmo para "só eu" —
 * ver DEPLOY.md para trocar depois por múltiplos usuários se precisar.
 */
export async function verificarCredenciais(email: string, senha: string): Promise<boolean> {
  const emailConfig = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const emailOk = emailConfig.length > 0 && String(email || "").trim().toLowerCase() === emailConfig;
  if (!emailOk) return false;

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compare(senha, hash);

  const plano = process.env.ADMIN_PASSWORD;
  if (plano) return senha === plano;

  return false;
}

export async function criarSessao(email: string) {
  const token = await criarToken(email);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function encerrarSessao() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessao() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verificarToken(token);
}

export async function exigirSessao() {
  const sessao = await getSessao();
  if (!sessao) throw new Error("Sessão expirada. Faça login novamente.");
  return sessao;
}
