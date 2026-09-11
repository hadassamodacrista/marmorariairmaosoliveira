import "server-only";
import { db, orcamentos, parcelasOrcamento } from "@/db/client";
import { eq, inArray } from "drizzle-orm";
import { newId } from "@/lib/ids";
import { num } from "@/lib/calc";

export async function getOrcamentosFinanceiro() {
  const todos = await db.select().from(orcamentos);
  const fechados = todos.filter((o) => ["aprovado", "executado"].includes(o.status));
  if (fechados.length === 0) return [];

  const ids = fechados.map((o) => o.id);
  const parcelas = await db.select().from(parcelasOrcamento).where(inArray(parcelasOrcamento.orcamentoId, ids));

  return fechados.map((o) => ({
    ...o,
    parcelasDetalhe: parcelas.filter((p) => p.orcamentoId === o.id),
  }));
}

export async function getParcelasOrcamento(orcamentoId?: string) {
  if (orcamentoId) {
    return db.select().from(parcelasOrcamento).where(eq(parcelasOrcamento.orcamentoId, orcamentoId));
  }
  return db.select().from(parcelasOrcamento);
}

export type ParcelaInput = {
  numero: number;
  dataPagamento?: string;
  valor: number | string;
  formaPagamento?: string;
  status?: string;
};

export type SalvarFinanceiroInput = {
  id: string;
  formaPagamento?: string;
  parcelado?: boolean | string;
  parcelas?: number | string;
  parcelasDetalhe?: ParcelaInput[];
  dataPagamento?: string;
};

export async function saveFinanceiro(data: SalvarFinanceiroInput) {
  const linhas = await db.select().from(orcamentos).where(eq(orcamentos.id, data.id));
  const registro = linhas[0];
  if (!registro) throw new Error("Orçamento não encontrado");
  if (!["aprovado", "executado"].includes(registro.status)) {
    throw new Error("Somente orçamentos fechados podem entrar no financeiro");
  }

  const parcelado = data.parcelado === true || String(data.parcelado).toLowerCase() === "sim";
  const qtdParcelas = parcelado ? parseInt(String(data.parcelas || 0), 10) : 1;
  if (parcelado && (!Number.isFinite(qtdParcelas) || qtdParcelas < 2)) {
    throw new Error("Informe pelo menos 2 parcelas");
  }

  const total = num(registro.total);
  const detalhe = Array.isArray(data.parcelasDetalhe) ? data.parcelasDetalhe : [];
  if (detalhe.length && detalhe.length !== qtdParcelas) {
    throw new Error("O detalhe deve conter todas as parcelas do orçamento");
  }

  const somaDetalhe = detalhe.reduce(
    (soma, item) => (String(item.status || "").toLowerCase() === "paga" ? soma + num(item.valor) : soma),
    0
  );
  const valorPago = detalhe.length ? Math.round(somaDetalhe * 100) / 100 : 0;

  if (valorPago > total) throw new Error("O valor pago não pode ser maior que o total");

  const saldoRestante = Math.round((total - valorPago) * 100) / 100;
  const dataPagamento =
    detalhe
      .filter((i) => String(i.status || "").toLowerCase() !== "paga" && i.dataPagamento)
      .map((i) => i.dataPagamento!)
      .sort()[0] || data.dataPagamento || "";

  await db
    .update(orcamentos)
    .set({
      formaPagamento: data.formaPagamento || "",
      parcelado,
      parcelas: qtdParcelas,
      valorPago: String(valorPago),
      saldoRestante: String(saldoRestante),
      financeiroAtualizadoEm: new Date(),
      dataPagamento,
    })
    .where(eq(orcamentos.id, data.id));

  if (detalhe.length) {
    await db.delete(parcelasOrcamento).where(eq(parcelasOrcamento.orcamentoId, data.id));
    for (const item of detalhe) {
      await db.insert(parcelasOrcamento).values({
        id: newId(),
        orcamentoId: data.id,
        numero: item.numero,
        dataPagamento: item.dataPagamento || "",
        valor: String(num(item.valor)),
        formaPagamento: item.formaPagamento || data.formaPagamento || "",
        status: String(item.status || "pendente").toLowerCase() === "paga" ? "paga" : "pendente",
      });
    }
  }

  return true;
}
