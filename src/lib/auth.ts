import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE, criarToken, verificarToken } from "./jwt";

/**
 * Login por variáveis de ambiente — sem tabela de usuários, sem banco.
 * Suporta até dois logins fixos por implantação:
 *   - ADMIN_EMAIL / ADMIN_PASSWORD_HASH (ou ADMIN_PASSWORD)   -> o cliente, dia a dia
 *   - SUPPORT_EMAIL / SUPPORT_PASSWORD_HASH (ou SUPPORT_PASSWORD) -> você, suporte
 * O login de suporte é opcional: só é considerado se SUPPORT_EMAIL estiver
 * definido. Os dois têm o mesmo nível de acesso (não há papéis/permissões
 * nesta versão) — a vantagem é você não precisar saber a senha do cliente
 * para entrar e ajudar.
 */
type ParDeCredenciais = { email: string; hash?: string; plano?: string };

function paresConfigurados(): ParDeCredenciais[] {
  const pares: ParDeCredenciais[] = [];

  const emailAdmin = String(process.env.ADMIN_EMAIL || "").trim();
  if (emailAdmin) {
    pares.push({ email: emailAdmin, hash: process.env.ADMIN_PASSWORD_HASH, plano: process.env.ADMIN_PASSWORD });
  }

  const emailSuporte = String(process.env.SUPPORT_EMAIL || "").trim();
  if (emailSuporte) {
    pares.push({ email: emailSuporte, hash: process.env.SUPPORT_PASSWORD_HASH, plano: process.env.SUPPORT_PASSWORD });
  }

  return pares;
}

export async function verificarCredenciais(email: string, senha: string): Promise<boolean> {
  const emailInformado = String(email || "").trim().toLowerCase();

  for (const par of paresConfigurados()) {
    if (par.email.toLowerCase() !== emailInformado) continue;
    if (par.hash) return bcrypt.compare(senha, par.hash);
    if (par.plano) return senha === par.plano;
  }

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
