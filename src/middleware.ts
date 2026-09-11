import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verificarToken } from "@/lib/jwt";

// Rotas acessíveis sem login: a tela de login, a página pública do
// orçamento (link enviado ao cliente) e o PDF público correspondente.
function ehRotaPublica(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/orcamento/") ||
    pathname.startsWith("/api/publico/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ehRotaPublica(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sessao = await verificarToken(token);

  if (!sessao) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
