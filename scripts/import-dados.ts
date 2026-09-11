/**
 * scripts/import-dados.ts
 *
 * Importa o JSON exportado da planilha antiga (ver exportar-dados.gs) para
 * o banco Postgres (Neon ou o banco local de dev).
 *
 * Uso:
 *   1. Rode `exportarDadosParaMigracao()` no projeto antigo do Apps Script.
 *   2. Baixe o arquivo gerado e salve como scripts/dados-exportados.json
 *      (mesma pasta deste script).
 *   3. Rode o schema no banco de destino, se ainda não rodou:
 *        DATABASE_URL="postgres://..." npm run db:push
 *   4. Rode a importação:
 *        DATABASE_URL="postgres://..." npm run migrate:import
 *      (sem DATABASE_URL, importa para o banco local de desenvolvimento)
 *
 * É seguro rodar mais de uma vez: cada tabela é limpa antes de reinserir
 * (a não ser que você passe --sem-limpar).
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { sql } from "drizzle-orm";
import {
  db,
  config,
  clientes,
  materiais,
  tiposPeca,
  tiposServico,
  fornecedores,
  contasPagar,
  orcamentos,
  itensOrcamento,
  parcelasOrcamento,
} from "../src/db/client";

const ARQUIVO = join(__dirname, "dados-exportados.json");
const LIMPAR_ANTES = !process.argv.includes("--sem-limpar");

function paraISO(v: unknown): string {
  if (!v) return "";
  const texto = String(v).trim();
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const d = new Date(texto);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function paraTimestamp(v: unknown): Date {
  if (!v) return new Date();
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? new Date() : d;
}

function paraBool(v: unknown): boolean {
  return String(v).trim().toLowerCase() === "sim" || v === true;
}

function paraNum(v: unknown): string {
  const n = parseFloat(String(v ?? "0").replace(",", "."));
  return Number.isFinite(n) ? String(n) : "0";
}

type Registro = Record<string, unknown>;

async function main() {
  if (!existsSync(ARQUIVO)) {
    console.error(`Arquivo não encontrado: ${ARQUIVO}`);
    console.error("Rode exportarDadosParaMigracao() no Apps Script antigo, baixe o JSON e salve como scripts/dados-exportados.json");
    process.exit(1);
  }

  const dados = JSON.parse(readFileSync(ARQUIVO, "utf-8")) as {
    config: Record<string, string>;
    clientes: Registro[];
    materiais: Registro[];
    tiposPeca: Registro[];
    tiposServico: Registro[];
    fornecedores: Registro[];
    contasPagar: Registro[];
    orcamentos: (Registro & { itens: Registro[]; parcelas_detalhe: Registro[] })[];
  };

  if (LIMPAR_ANTES) {
    console.log("Limpando tabelas antes de importar...");
    await db.delete(itensOrcamento);
    await db.delete(parcelasOrcamento);
    await db.delete(orcamentos);
    await db.delete(contasPagar);
    await db.delete(fornecedores);
    await db.delete(materiais);
    await db.delete(tiposPeca);
    await db.delete(tiposServico);
    await db.delete(clientes);
    await db.delete(config);
  }

  console.log("Config...");
  for (const [chave, valor] of Object.entries(dados.config || {})) {
    await db.insert(config).values({ chave, valor: String(valor ?? "") });
  }

  console.log(`Clientes (${dados.clientes?.length || 0})...`);
  for (const c of dados.clientes || []) {
    await db.insert(clientes).values({
      id: String(c.id),
      nome: String(c.nome || ""),
      telefone: String(c.telefone || ""),
      email: String(c.email || ""),
      endereco: String(c.endereco || ""),
      cidade: String(c.cidade || ""),
      criadoEm: paraTimestamp(c.criadoEm),
    });
  }

  console.log(`Materiais (${dados.materiais?.length || 0})...`);
  for (const m of dados.materiais || []) {
    await db.insert(materiais).values({
      id: String(m.id),
      tipo: String(m.tipo || ""),
      descricao: String(m.descricao || ""),
      precoM2: paraNum(m.precoM2),
      ativo: paraBool(m.ativo),
      criadoEm: paraTimestamp(m.criadoEm),
    });
  }

  console.log(`Tipos de peça (${dados.tiposPeca?.length || 0})...`);
  for (const t of dados.tiposPeca || []) {
    await db.insert(tiposPeca).values({
      id: String(t.id),
      nome: String(t.nome || ""),
      unidade: String(t.unidade || "m²"),
      ativo: paraBool(t.ativo),
      criadoEm: paraTimestamp(t.criadoEm),
    });
  }

  console.log(`Tipos de serviço (${dados.tiposServico?.length || 0})...`);
  for (const t of dados.tiposServico || []) {
    await db.insert(tiposServico).values({
      id: String(t.id),
      nome: String(t.nome || ""),
      ativo: paraBool(t.ativo),
      criadoEm: paraTimestamp(t.criadoEm),
    });
  }

  console.log(`Fornecedores (${dados.fornecedores?.length || 0})...`);
  for (const f of dados.fornecedores || []) {
    await db.insert(fornecedores).values({
      id: String(f.id),
      nome: String(f.nome || ""),
      tipo: String(f.tipo || "outro"),
      documento: String(f.documento || ""),
      telefone: String(f.telefone || ""),
      email: String(f.email || ""),
      observacoes: String(f.observacoes || ""),
      ativo: paraBool(f.ativo),
      criadoEm: paraTimestamp(f.criadoEm),
    });
  }

  console.log(`Contas a pagar (${dados.contasPagar?.length || 0})...`);
  for (const c of dados.contasPagar || []) {
    await db.insert(contasPagar).values({
      id: String(c.id),
      fornecedorId: c.fornecedorId ? String(c.fornecedorId) : null,
      fornecedorNome: String(c.fornecedorNome || ""),
      descricao: String(c.descricao || ""),
      categoria: String(c.categoria || "outro"),
      orcamentoId: c.orcamentoId ? String(c.orcamentoId) : null,
      valor: paraNum(c.valor),
      emitidoEm: paraISO(c.emitidoEm),
      venceEm: paraISO(c.venceEm),
      pagoEm: paraISO(c.pagoEm) || null,
      status: String(c.status || "pendente"),
      formaPagamento: String(c.formaPagamento || ""),
      observacoes: String(c.observacoes || ""),
      criadoEm: paraTimestamp(c.criadoEm),
      atualizadoEm: paraTimestamp(c.atualizadoEm),
    });
  }

  console.log(`Orçamentos (${dados.orcamentos?.length || 0})...`);
  let maiorNumero = 0;
  for (const o of dados.orcamentos || []) {
    const numero = parseInt(String(o.numero || 0), 10) || 0;
    maiorNumero = Math.max(maiorNumero, numero);

    await db.insert(orcamentos).values({
      id: String(o.id),
      numero,
      clienteId: o.clienteId ? String(o.clienteId) : null,
      clienteNome: String(o.clienteNome || ""),
      status: String(o.status || "aberto"),
      observacoes: String(o.observacoes || ""),
      validade: paraISO(o.validade),
      token: String(o.token || ""),
      pdfId: null, // PDF antigo ficava no Drive; gere um novo pelo sistema
      total: paraNum(o.total),
      subtotalItens: paraNum(o.subtotalItens),
      maoDeObra: paraNum(o.maoDeObra),
      frete: paraNum(o.frete),
      descontoPct: paraNum(o.descontoPct),
      formaPagamento: String(o.formaPagamento || ""),
      parcelado: paraBool(o.parcelado),
      parcelas: parseInt(String(o.parcelas || 1), 10) || 1,
      valorPago: paraNum(o.valorPago),
      saldoRestante: paraNum(o.saldoRestante),
      financeiroAtualizadoEm: o.financeiroAtualizadoEm ? paraTimestamp(o.financeiroAtualizadoEm) : null,
      dataPagamento: paraISO(o.dataPagamento),
      aceiteEm: o.aceiteEm ? paraTimestamp(o.aceiteEm) : null,
      aceiteNome: String(o.aceiteNome || ""),
      aceiteDocumento: String(o.aceiteDocumento || ""),
      criadoEm: paraTimestamp(o.criadoEm),
      atualizadoEm: paraTimestamp(o.atualizadoEm),
    });

    let ordem = 0;
    for (const item of o.itens || []) {
      await db.insert(itensOrcamento).values({
        id: String(item.id),
        orcamentoId: String(o.id),
        ordem: ordem++,
        ambiente: String(item.ambiente || ""),
        tipoPecaNome: String(item.tipoPecaNome || ""),
        tipoServicoNome: String(item.tipoServicoNome || ""),
        materialTipo: "",
        materialDesc: String(item.materialDesc || ""),
        comprimento: paraNum(item.comprimento),
        largura: paraNum(item.largura),
        profundidade: paraNum(item.profundidade),
        quantidade: paraNum(item.quantidade || 1),
        precoM2: paraNum(item.precoM2),
        areaM2: paraNum(item.areaM2),
        valorItem: paraNum(item.valorItem),
        observacao: String(item.observacao || ""),
      });
    }

    for (const p of o.parcelas_detalhe || []) {
      await db.insert(parcelasOrcamento).values({
        id: String(p.id),
        orcamentoId: String(o.id),
        numero: parseInt(String(p.numero || 1), 10) || 1,
        dataPagamento: paraISO(p.dataPagamento),
        valor: paraNum(p.valor),
        formaPagamento: String(p.formaPagamento || ""),
        status: String(p.status || "pendente"),
        criadoEm: paraTimestamp(p.criadoEm),
        atualizadoEm: paraTimestamp(p.atualizadoEm),
      });
    }
  }

  if (maiorNumero > 0) {
    console.log(`Ajustando a numeração de orçamentos para continuar depois de #${maiorNumero}...`);
    await db.execute(sql`select setval('orcamento_numero_seq', ${maiorNumero})`);
  }

  console.log("Importação concluída!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
