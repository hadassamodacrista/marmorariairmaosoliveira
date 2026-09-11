import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O PGlite (banco local de desenvolvimento) carrega um binário WASM via
  // caminho relativo ao próprio pacote. Empacotado pelo Turbopack/webpack
  // esse caminho quebra ("File URL path must be absolute"); deixando o
  // pacote "externo" ele é apenas `require()`ado direto do node_modules,
  // do jeito que funciona nos scripts (tsx) e em produção não entra no
  // bundle mesmo (só é importado quando não há DATABASE_URL).
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
