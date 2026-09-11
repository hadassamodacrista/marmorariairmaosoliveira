import { defineConfig } from "drizzle-kit";

// Sem DATABASE_URL -> aplica o schema no banco local (PGlite, pasta
// ./.pglite-data). Com DATABASE_URL -> aplica no Postgres real (Neon).
export default process.env.DATABASE_URL
  ? defineConfig({
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dialect: "postgresql",
      dbCredentials: { url: process.env.DATABASE_URL },
    })
  : defineConfig({
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dialect: "postgresql",
      driver: "pglite",
      dbCredentials: { url: "./.pglite-data" },
    });
