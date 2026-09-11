import { db, config, tiposPeca } from "./client";
import { newId } from "../lib/ids";

async function seed() {
  const existentes = await db.select().from(config);
  if (existentes.length === 0) {
    console.log("Semeando configuração padrão...");
    await db.insert(config).values([
      { chave: "empresa_nome", valor: "Marmoraria Exemplo" },
      { chave: "empresa_cnpj", valor: "00.000.000/0001-00" },
      { chave: "empresa_tel", valor: "(00) 00000-0000" },
      { chave: "empresa_email", valor: "contato@marmoraria.com.br" },
      { chave: "empresa_endereco", valor: "Rua Exemplo, 100 — Cidade/UF" },
      { chave: "empresa_logo_url", valor: "" },
      { chave: "orcamento_validade", valor: "30" },
      {
        chave: "orcamento_obs",
        valor: "Orçamento válido por 30 dias. Não inclui frete ou instalação de terceiros.",
      },
      { chave: "proximo_numero", valor: "1" },
    ]);
  }

  const tipos = await db.select().from(tiposPeca);
  if (tipos.length === 0) {
    console.log("Semeando tipos de peça padrão...");
    const padrao = ["Bancada", "Tampo", "Pia", "Rodapé", "Soleira", "Escada", "Peitoril", "Pingadeira", "Revestimento"];
    await db.insert(tiposPeca).values(padrao.map((nome) => ({ id: newId(), nome, unidade: "m²" })));
  }

  console.log("Seed concluído.");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
