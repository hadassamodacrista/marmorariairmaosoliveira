import "server-only";
import { db, orcamentos, itensOrcamento, clientes, parcelasOrcamento } from "@/db/client";
import { desc, eq } from "drizzle-orm";
import { newId, newToken } from "@/lib/ids";
import { calcularAreaItem, calcularTotais, num } from "@/lib/calc";
import { getConfig, proximoNumeroOrcamento } from "./config";

export type ItemInput = {
  ambiente?: string;
  tipoPecaNome?: string;
  tipoServicoNome?: string;
  materialTipo?: string;
  materialDesc?: string;
  comprimento: number | string;
  largura: number | string;
  profundidade?: number | string;
  quantidade: number | string;
  precoM2: number | string;
  observacao?: string;
};

export type OrcamentoInput = {
  id?: string | null;
  clienteId: string;
  clienteNome: string;
  status?: string;
  observacoes?: string;
  validade?: string;
  frete?: number | string;
  descontoPct?: number | string;
  itens: ItemInput[];
};

export async function getOrcamentos() {
  return db.select().from(orcamentos).orderBy(desc(orcamentos.criadoEm));
}

async function montarItens(orcamentoId: string) {
  const linhas = await db.select().from(itensOrcamento).where(eq(itensOrcamento.orcamentoId, orcamentoId));
  return linhas.sort((a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem);
}

export async function getOrcamento(id: string) {
  const linhas = await db.select().from(orcamentos).where(eq(orcamentos.id, id));
  const orc = linhas[0];
  if (!orc) return null;
  const itens = await montarItens(id);
  const cliente = orc.clienteId ? (await db.select().from(clientes).where(eq(clientes.id, orc.clienteId)))[0] ?? null : null;
  return { ...orc, itens, cliente };
}

export async function getOrcamentoPorToken(token: string) {
  const linhas = await db.select().from(orcamentos).where(eq(orcamentos.token, token));
  const orc = linhas[0];
  if (!orc) return null;
  const itens = await montarItens(orc.id);
  const cliente = orc.clienteId ? (await db.select().from(clientes).where(eq(clientes.id, orc.clienteId)))[0] ?? null : null;
  return { ...orc, itens, cliente };
}

function paraItensCalc(itens: ItemInput[]) {
  return itens.map((i) => ({
    comprimento: num(i.comprimento),
    largura: num(i.largura),
    profundidade: num(i.profundidade),
    quantidade: num(i.quantidade) || 1,
    precoM2: num(i.precoM2),
  }));
}

export async function saveOrcamento(data: OrcamentoInput): Promise<string> {
  const clienteId = String(data.clienteId || "").trim();
  if (!clienteId) throw new Error("Selecione um cliente");
  const itensEntrada = data.itens || [];
  if (itensEntrada.length === 0) throw new Error("Adicione pelo menos um item");

  const totais = calcularTotais({
    itens: paraItensCalc(itensEntrada),
    frete: num(data.frete),
    descontoPct: num(data.descontoPct),
  });

  if (data.id) {
    const atualRows = await db.select().from(orcamentos).where(eq(orcamentos.id, data.id));
    const atual = atualRows[0];
    if (!atual) throw new Error("Orçamento não encontrado");

    const valorPago = num(atual.valorPago);
    const saldoRestante = Math.max(totais.total - valorPago, 0);

    await db
      .update(orcamentos)
      .set({
        clienteId,
        clienteNome: data.clienteNome,
        status: data.status || "aberto",
        observacoes: data.observacoes || "",
        validade: data.validade || "",
        total: String(totais.total),
        subtotalItens: String(totais.subtotalItens),
        frete: String(totais.frete),
        descontoPct: String(totais.descontoPct),
        saldoRestante: String(Math.round(saldoRestante * 100) / 100),
        atualizadoEm: new Date(),
      })
      .where(eq(orcamentos.id, data.id));

    await db.delete(itensOrcamento).where(eq(itensOrcamento.orcamentoId, data.id));
    await inserirItens(data.id, itensEntrada);

    return data.id;
  }

  const config = await getConfig();
  const id = newId();
  const token = newToken();
  const numero = await proximoNumeroOrcamento();
  const validade = data.validade || calcularValidadePadrao(parseInt(config.orcamento_validade || "30", 10));

  await db.insert(orcamentos).values({
    id,
    numero,
    clienteId,
    clienteNome: data.clienteNome,
    status: "aberto",
    observacoes: data.observacoes || "",
    validade,
    token,
    total: String(totais.total),
    subtotalItens: String(totais.subtotalItens),
    frete: String(totais.frete),
    descontoPct: String(totais.descontoPct),
    valorPago: "0",
    saldoRestante: String(totais.total),
  });

  await inserirItens(id, itensEntrada);
  return id;
}

async function inserirItens(orcamentoId: string, itens: ItemInput[]) {
  let ordem = 0;
  for (const item of itens) {
    const calc = { comprimento: num(item.comprimento), largura: num(item.largura), profundidade: num(item.profundidade), quantidade: num(item.quantidade) || 1, precoM2: num(item.precoM2) };
    const area = calcularAreaItem(calc);
    const valor = Math.round(area * calc.precoM2 * 100) / 100;
    await db.insert(itensOrcamento).values({
      id: newId(),
      orcamentoId,
      ordem: ordem++,
      ambiente: item.ambiente || "",
      tipoPecaNome: item.tipoPecaNome || "",
      tipoServicoNome: item.tipoServicoNome || "",
      materialTipo: item.materialTipo || "",
      materialDesc: item.materialDesc || "",
      comprimento: String(calc.comprimento),
      largura: String(calc.largura),
      profundidade: String(calc.profundidade),
      quantidade: String(calc.quantidade),
      precoM2: String(calc.precoM2),
      areaM2: String(area),
      valorItem: String(valor),
      observacao: item.observacao || "",
    });
  }
}

export async function deleteOrcamento(id: string) {
  await db.delete(itensOrcamento).where(eq(itensOrcamento.orcamentoId, id));
  await db.delete(parcelasOrcamento).where(eq(parcelasOrcamento.orcamentoId, id));
  await db.delete(orcamentos).where(eq(orcamentos.id, id));
  return true;
}

export async function updateStatusOrcamento(id: string, status: string) {
  await db.update(orcamentos).set({ status, atualizadoEm: new Date() }).where(eq(orcamentos.id, id));
  return true;
}

function calcularValidadePadrao(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}
