import "server-only";
import { getOrcamentosFinanceiro, getParcelasOrcamento } from "./financeiro";
import { getContasPagar } from "./contasPagar";
import { arredonda2, num } from "@/lib/calc";
import { hojeISO, paraISODate } from "@/lib/format";

type Lancamento = {
  data: string;
  tipo: "entrada" | "saida";
  realizado: boolean;
  origem: string;
  descricao: string;
  categoria: string;
  valor: number;
};

function primeiroDiaMesISO(offsetMeses: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMeses);
  return d.toISOString().slice(0, 10);
}

function ultimoDiaMesISO(offsetMeses: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMeses + 1);
  d.setDate(0);
  return d.toISOString().slice(0, 10);
}

function valorPrevistoParcela(orc: { total: unknown; parcelas: unknown }, numeroParcela: number): number {
  const total = arredonda2(num(orc.total));
  const qtd = Math.max(parseInt(String(orc.parcelas || 1), 10), 1);
  const base = arredonda2(total / qtd);
  return numeroParcela >= qtd ? Math.max(total - base * (qtd - 1), 0) : base;
}

export async function getFluxoCaixa(opts: { de?: string; ate?: string } = {}) {
  const hoje = hojeISO();
  const de = opts.de || primeiroDiaMesISO(-2);
  const ate = opts.ate || ultimoDiaMesISO(3);

  const lancamentos: Lancamento[] = [];

  const orcamentosFechados = await getOrcamentosFinanceiro();
  const mapaOrc = new Map(orcamentosFechados.map((o: { id: string }) => [o.id, o]));
  const parcelas = await getParcelasOrcamento();
  const orcComParcelas = new Set<string>();

  for (const p of parcelas) {
    const orc = mapaOrc.get(p.orcamentoId) as Record<string, unknown> | undefined;
    if (!orc) continue;
    orcComParcelas.add(p.orcamentoId);
    const paga = String(p.status || "").toLowerCase() === "paga";
    const valor = paga ? num(p.valor) : valorPrevistoParcela(orc as never, p.numero);
    if (!valor) continue;
    const data =
      paraISODate(p.dataPagamento) ||
      (paga ? paraISODate((orc as { financeiroAtualizadoEm?: Date | string | null }).financeiroAtualizadoEm) : "") ||
      hoje;
    lancamentos.push({
      data,
      tipo: "entrada",
      realizado: paga,
      origem: "Orçamento #" + String((orc as { numero: number }).numero).padStart(4, "0"),
      descricao: `${(orc as { clienteNome?: string }).clienteNome || "Cliente"} — parcela ${p.numero}`,
      categoria: "recebimento",
      valor: arredonda2(valor),
    });
  }

  for (const orc of orcamentosFechados) {
    if (orcComParcelas.has(orc.id)) continue;
    const total = num(orc.total);
    const pago = num(orc.valorPago);
    if (pago > 0) {
      lancamentos.push({
        data: paraISODate(orc.dataPagamento) || paraISODate(orc.financeiroAtualizadoEm) || hoje,
        tipo: "entrada",
        realizado: true,
        origem: "Orçamento #" + String(orc.numero).padStart(4, "0"),
        descricao: `${orc.clienteNome || "Cliente"} — recebido`,
        categoria: "recebimento",
        valor: arredonda2(pago),
      });
    }
    const saldo = Math.max(total - pago, 0);
    if (saldo > 0) {
      lancamentos.push({
        data: paraISODate(orc.dataPagamento) || hoje,
        tipo: "entrada",
        realizado: false,
        origem: "Orçamento #" + String(orc.numero).padStart(4, "0"),
        descricao: `${orc.clienteNome || "Cliente"} — a receber`,
        categoria: "recebimento",
        valor: arredonda2(saldo),
      });
    }
  }

  for (const c of await getContasPagar()) {
    if (c.status === "cancelado") continue;
    const realizado = c.status === "pago";
    lancamentos.push({
      data: realizado ? c.pagoEm || c.venceEm || hoje : c.venceEm || c.emitidoEm || hoje,
      tipo: "saida",
      realizado,
      origem: c.fornecedorNome || "Fornecedor",
      descricao: c.descricao,
      categoria: c.categoria || "outro",
      valor: arredonda2(num(c.valor)),
    });
  }

  const periodo = lancamentos.filter((l) => l.data >= de && l.data <= ate).sort((a, b) => a.data.localeCompare(b.data));

  const soma = (f: (l: Lancamento) => boolean) => arredonda2(periodo.filter(f).reduce((s, l) => s + l.valor, 0));

  const resumo = {
    de,
    ate,
    entradasRealizadas: soma((l) => l.tipo === "entrada" && l.realizado),
    entradasPrevistas: soma((l) => l.tipo === "entrada" && !l.realizado),
    saidasRealizadas: soma((l) => l.tipo === "saida" && l.realizado),
    saidasPrevistas: soma((l) => l.tipo === "saida" && !l.realizado),
    saldoRealizado: 0,
    saldoPrevisto: 0,
  };
  resumo.saldoRealizado = arredonda2(resumo.entradasRealizadas - resumo.saidasRealizadas);
  resumo.saldoPrevisto = arredonda2(
    resumo.entradasRealizadas + resumo.entradasPrevistas - resumo.saidasRealizadas - resumo.saidasPrevistas
  );

  const meses: Record<string, { mes: string; entradas: number; saidas: number }> = {};
  for (const l of periodo) {
    const m = l.data.slice(0, 7);
    meses[m] = meses[m] || { mes: m, entradas: 0, saidas: 0 };
    if (l.tipo === "entrada") meses[m].entradas += l.valor;
    else meses[m].saidas += l.valor;
  }
  const porMes = Object.keys(meses)
    .sort()
    .map((k) => ({
      mes: k,
      entradas: arredonda2(meses[k].entradas),
      saidas: arredonda2(meses[k].saidas),
      saldo: arredonda2(meses[k].entradas - meses[k].saidas),
    }));

  const cats: Record<string, number> = {};
  for (const l of periodo.filter((x) => x.tipo === "saida")) cats[l.categoria] = (cats[l.categoria] || 0) + l.valor;
  const porCategoria = Object.keys(cats)
    .map((k) => ({ categoria: k, valor: arredonda2(cats[k]) }))
    .sort((a, b) => b.valor - a.valor);

  return { resumo, lancamentos: periodo, porMes, porCategoria };
}
