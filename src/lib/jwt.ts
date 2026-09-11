import { SignJWT, jwtVerify } from "jose";

// Usado tanto no middleware (Edge runtime) quanto no servidor (Node),
// por isso não importa nada Node-only aqui (sem bcrypt, sem next/headers).

export const SESSION_COOKIE = "marmoraria_session";

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET não configurado. Defina uma string aleatória longa no .env.local."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function criarToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verificarToken(token: string | undefined | null): Promise<{ email: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
