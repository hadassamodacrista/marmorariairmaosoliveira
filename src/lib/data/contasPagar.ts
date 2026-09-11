import "server-only";
import { db, contasPagar, fornecedores } from "@/db/client";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/ids";
import { arredonda2, num, parseValorBR } from "@/lib/calc";
import { paraISODate, hojeISO } from "@/lib/format";

export const CATEGORIAS_PAGAR = ["chapa", "insumo", "servico_terceiro", "despesa_fixa", "imposto", "frete", "outro"] as const;

export type ContaPagarInput = {
  id?: string | null;
  fornecedorId?: string;
  fornecedorNome?: string;
  descricao: string;
  categoria?: string;
  orcamentoId?: string;
  valor: number | string;
  emitidoEm?: string;
  venceEm?: string;
  pagoEm?: string;
  status?: string;
  formaPagamento?: string;
  observacoes?: string;
};

function normalizarStatus(c: { status: string; pagoEm: string | null }) {
  if (c.status === "cancelado") return "cancelado";
  if (c.status === "pago" || c.pagoEm) return "pago";
  return "pendente";
}

export async function getContasPagar(filtro?: { status?: string; categoria?: string }) {
  const mapaFornecedor: Record<string, string> = {};
  for (const f of await db.select().from(fornecedores)) mapaFornecedor[f.id] = f.nome;

  let contas = (await db.select().from(contasPagar)).map((c: typeof contasPagar.$inferSelect) => {
    const status = normalizarStatus(c);
    return {
      ...c,
      valor: num(c.valor),
      status,
      fornecedorNome: c.fornecedorNome || mapaFornecedor[c.fornecedorId || ""] || "—",
      atrasada: status === "pendente" && !!c.venceEm && c.venceEm < hojeISO(),
    };
  });

  if (filtro?.status) contas = contas.filter((c) => c.status === filtro.status);
  if (filtro?.categoria) contas = contas.filter((c) => c.categoria === filtro.categoria);

  return contas.sort((a, b) => String(a.venceEm || "9999").localeCompare(String(b.venceEm || "9999")));
}

export async function saveContaPagar(data: ContaPagarInput) {
  const descricao = String(data.descricao || "").trim();
  if (!descricao) throw new Error("Informe a descrição da conta");
  const valor = parseValorBR(data.valor);
  if (!(valor > 0)) throw new Error("Informe um valor válido");

  const emitidoEm = paraISODate(data.emitidoEm) || hojeISO();
  const venceEm = paraISODate(data.venceEm) || emitidoEm;
  const pagoEm = paraISODate(data.pagoEm);
  const status = pagoEm ? "pago" : String(data.status || "").toLowerCase() === "cancelado" ? "cancelado" : "pendente";

  let fornecedorNome = String(data.fornecedorNome || "").trim();
  if (data.fornecedorId && !fornecedorNome) {
    const rows = await db.select().from(fornecedores).where(eq(fornecedores.id, data.fornecedorId));
    fornecedorNome = rows[0]?.nome || "";
  }

  const categoria = (CATEGORIAS_PAGAR as readonly string[]).includes(String(data.categoria)) ? String(data.categoria) : "outro";

  const valores = {
    fornecedorId: data.fornecedorId || null,
    fornecedorNome,
    descricao,
    categoria,
    orcamentoId: data.orcamentoId || null,
    valor: String(valor),
    emitidoEm,
    venceEm,
    pagoEm: pagoEm || null,
    status,
    formaPagamento: data.formaPagamento || "",
    observacoes: data.observacoes || "",
    atualizadoEm: new Date(),
  };

  if (data.id) {
    await db.update(contasPagar).set(valores).where(eq(contasPagar.id, data.id));
    return data.id;
  }
  const id = newId();
  await db.insert(contasPagar).values({ id, ...valores });
  return id;
}

export async function pagarContaPagar(id: string, dados: { pagoEm?: string; formaPagamento?: string }) {
  const pagoEm = paraISODate(dados.pagoEm) || hojeISO();
  await db
    .update(contasPagar)
    .set({
      pagoEm,
      status: "pago",
      formaPagamento: dados.formaPagamento || undefined,
      atualizadoEm: new Date(),
    })
    .where(eq(contasPagar.id, id));
  return true;
}

export async function reabrirContaPagar(id: string) {
  await db.update(contasPagar).set({ pagoEm: null, status: "pendente", atualizadoEm: new Date() }).where(eq(contasPagar.id, id));
  return true;
}

export async function deleteContaPagar(id: string) {
  await db.delete(contasPagar).where(eq(contasPagar.id, id));
  return true;
}

export async function getPainelContasPagar() {
  const hoje = hojeISO();
  const limite30 = new Date();
  limite30.setDate(limite30.getDate() + 30);
  const limite30ISO = limite30.toISOString().slice(0, 10);

  const abertas = (await getContasPagar({ status: "pendente" }));
  const soma = (arr: typeof abertas) => arredonda2(arr.reduce((s, c) => s + num(c.valor), 0));

  return {
    total: soma(abertas),
    vencidas: soma(abertas.filter((c) => c.venceEm && c.venceEm < hoje)),
    proximos30: soma(abertas.filter((c) => c.venceEm && c.venceEm >= hoje && c.venceEm <= limite30ISO)),
    quantidade: abertas.length,
  };
}
