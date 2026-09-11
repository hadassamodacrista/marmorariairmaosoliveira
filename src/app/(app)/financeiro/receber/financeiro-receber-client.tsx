"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { moeda, dataBR } from "@/lib/format";
import { num, arredonda2 } from "@/lib/calc";
import { toast } from "@/lib/ui-client";
import { salvarFinanceiroAction } from "./actions";
import { FORMAS_PAGAMENTO, rotuloFormaPagamento } from "@/lib/constants";

type Parcela = { numero: number; dataPagamento: string | null; valor: string; formaPagamento: string | null; status: string };
export type OrcFinanceiro = {
  id: string;
  numero: number;
  clienteNome: string | null;
  total: string;
  valorPago: string;
  saldoRestante: string;
  formaPagamento: string | null;
  parcelado: boolean;
  parcelas: number;
  dataPagamento: string | null;
  atualizadoEm: string | Date;
  parcelasDetalhe: Parcela[];
};

function saldoFinanceiro(o: OrcFinanceiro) {
  const saldo = num(o.saldoRestante);
  return Number.isFinite(saldo) ? saldo : Math.max(num(o.total) - num(o.valorPago), 0);
}

function valorPrevistoParcela(total: number, qtd: number, indice: number) {
  const base = arredonda2(total / qtd);
  return indice === qtd - 1 ? Math.max(total - base * (qtd - 1), 0) : base;
}

export default function FinanceiroReceberClient({ initial }: { initial: OrcFinanceiro[] }) {
  const sorted = useMemo(
    () => [...initial].sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime()),
    [initial]
  );
  const [selecionadoId, setSelecionadoId] = useState("");
  const selecionado = sorted.find((o) => o.id === selecionadoId) || null;

  const totalFechado = sorted.reduce((s, o) => s + num(o.total), 0);
  const totalPago = sorted.reduce((s, o) => s + num(o.valorPago), 0);
  const totalSaldo = sorted.reduce((s, o) => s + saldoFinanceiro(o), 0);

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Contas a Receber
      </h4>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Total fechado</div>
            <div className="fw-bold fs-4">{moeda(totalFechado)}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Total recebido</div>
            <div className="fw-bold fs-4 text-success">{moeda(totalPago)}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Total a receber</div>
            <div className="fw-bold fs-4 text-danger">{moeda(totalSaldo)}</div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white fw-bold">Selecionar orçamento fechado</div>
        <div className="card-body">
          {sorted.length ? (
            <select className="form-select" value={selecionadoId} onChange={(e) => setSelecionadoId(e.target.value)}>
              <option value="">Selecione um orçamento aprovado ou executado...</option>
              {sorted.map((o) => (
                <option key={o.id} value={o.id}>
                  #{String(o.numero).padStart(4, "0")} — {o.clienteNome || "Sem cliente"} — {moeda(o.total)}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-muted">Nenhum orçamento fechado encontrado. Altere o status de um orçamento para Aprovado ou Executado.</div>
          )}
        </div>
      </div>

      {selecionado && <ControleFinanceiro key={selecionado.id} orcamento={selecionado} onSelecionar={setSelecionadoId} />}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-bold">Controle dos orçamentos fechados</div>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Próxima data prevista</th>
                <th>Orçamento</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Saldo</th>
                <th>Pagamento</th>
                <th>Parcelamento</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-muted py-4">
                    Nenhum orçamento fechado
                  </td>
                </tr>
              )}
              {sorted.map((o) => (
                <tr key={o.id}>
                  <td>{o.dataPagamento ? dataBR(o.dataPagamento) : "—"}</td>
                  <td>
                    <strong>#{String(o.numero).padStart(4, "0")}</strong>
                  </td>
                  <td>{o.clienteNome || "—"}</td>
                  <td className="fw-bold">{moeda(o.total)}</td>
                  <td className="text-success">{moeda(o.valorPago)}</td>
                  <td className="text-danger fw-bold">{moeda(saldoFinanceiro(o))}</td>
                  <td>{rotuloFormaPagamento(o.formaPagamento)}</td>
                  <td>{o.parcelado ? `${o.parcelas || 2}x` : "À vista"}</td>
                  <td>{saldoFinanceiro(o) <= 0 ? <span className="badge bg-success">Quitado</span> : <span className="badge bg-warning text-dark">Pendente</span>}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setSelecionadoId(o.id)}>
                      Controlar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ControleFinanceiro({ orcamento, onSelecionar }: { orcamento: OrcFinanceiro; onSelecionar: (id: string) => void }) {
  const [parcelado, setParcelado] = useState(orcamento.parcelado ? "sim" : "nao");
  const [qtdTexto, setQtdTexto] = useState(String(Math.max(orcamento.parcelas || 2, 2)));
  const [forma, setForma] = useState(orcamento.formaPagamento || "");
  const [pending, startTransition] = useTransition();

  const qtd = parcelado === "sim" ? Math.max(parseInt(qtdTexto || "2", 10) || 2, 2) : 1;
  const total = num(orcamento.total);

  const [linhas, setLinhas] = useState<{ dataPagamento: string; valor: string; forma: string; status: string }[]>(() =>
    montarLinhasIniciais(orcamento, qtd, total)
  );

  useEffect(() => {
    setLinhas((atual) => {
      const copia = atual.slice(0, qtd);
      while (copia.length < qtd) {
        copia.push({ dataPagamento: "", valor: "", forma: forma, status: "pendente" });
      }
      return copia;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qtd]);

  const resumo = useMemo(() => {
    let pago = 0;
    const linhasComPendente = linhas.map((l, indice) => {
      const previsto = valorPrevistoParcela(total, qtd, indice);
      const valor = num(l.valor);
      const pendente = l.status === "paga" ? Math.max(previsto - valor, 0) : previsto;
      if (l.status === "paga") pago += valor;
      return { previsto, pendente };
    });
    return { pago: arredonda2(pago), saldo: arredonda2(Math.max(total - pago, 0)), linhasComPendente };
  }, [linhas, total, qtd]);

  function atualizarLinha(indice: number, campo: "dataPagamento" | "valor" | "forma" | "status", valor: string) {
    setLinhas((atual) => atual.map((l, i) => (i === indice ? { ...l, [campo]: valor } : l)));
  }

  function salvar() {
    startTransition(async () => {
      const detalhe = linhas.map((l, indice) => ({
        numero: indice + 1,
        dataPagamento: l.dataPagamento,
        valor: l.valor || "0",
        formaPagamento: l.forma || forma,
        status: l.status,
      }));
      const dataPagamento =
        detalhe.filter((d) => d.status !== "paga" && d.dataPagamento).map((d) => d.dataPagamento).sort()[0] || "";

      const r = await salvarFinanceiroAction({
        id: orcamento.id,
        formaPagamento: forma,
        parcelado: parcelado === "sim",
        parcelas: qtd,
        parcelasDetalhe: detalhe,
        dataPagamento,
      });
      if (!r.ok) {
        toast(r.error, "danger");
        return;
      }
      toast("Controle financeiro salvo!");
      onSelecionar(orcamento.id);
    });
  }

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white fw-bold">Controle financeiro — Orçamento #{String(orcamento.numero).padStart(4, "0")}</div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Total do orçamento</label>
            <div className="form-control bg-light">{moeda(total)}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label">Meio de pagamento</label>
            <select className="form-select" value={forma} onChange={(e) => setForma(e.target.value)}>
              {FORMAS_PAGAMENTO.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Foi parcelado?</label>
            <select className="form-select" value={parcelado} onChange={(e) => setParcelado(e.target.value)}>
              <option value="nao">Não — à vista</option>
              <option value="sim">Sim</option>
            </select>
          </div>
          {parcelado === "sim" && (
            <div className="col-md-4">
              <label className="form-label">Quantidade de parcelas</label>
              <input
                type="number"
                min={2}
                step={1}
                className="form-control"
                value={qtdTexto}
                onChange={(e) => setQtdTexto(e.target.value)}
              />
            </div>
          )}

          <div className="col-12">
            <label className="form-label">Parcelas e datas previstas</label>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Parcela</th>
                    <th>Valor previsto</th>
                    <th>Data prevista de pagamento</th>
                    <th>Valor pago</th>
                    <th>Pendente</th>
                    <th>Forma</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l, indice) => (
                    <tr key={indice}>
                      <td>
                        <strong>
                          {indice + 1}/{qtd}
                        </strong>
                      </td>
                      <td>{moeda(resumo.linhasComPendente[indice]?.previsto || 0)}</td>
                      <td>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={l.dataPagamento}
                          onChange={(e) => atualizarLinha(indice, "dataPagamento", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="form-control form-control-sm"
                          placeholder="0,00"
                          value={l.valor}
                          onChange={(e) => atualizarLinha(indice, "valor", e.target.value)}
                        />
                      </td>
                      <td>{moeda(resumo.linhasComPendente[indice]?.pendente || 0)}</td>
                      <td>
                        <select className="form-select form-select-sm" value={l.forma} onChange={(e) => atualizarLinha(indice, "forma", e.target.value)}>
                          {FORMAS_PAGAMENTO.map(([v, txt]) => (
                            <option key={v} value={v}>
                              {txt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={l.status}
                          onChange={(e) => atualizarLinha(indice, "status", e.target.value)}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="paga">Paga</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="form-text">
              Informe a data prevista e escolha o status de cada parcela. Só as parcelas marcadas como Paga entram no total recebido.
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Total pago até agora</label>
            <div className="form-control bg-light">{moeda(resumo.pago)}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label">Saldo restante</label>
            <div className="form-control bg-light fw-bold text-danger">{moeda(resumo.saldo)}</div>
          </div>

          <div className="col-12 d-flex gap-2 justify-content-end">
            <button className="btn btn-primary" onClick={salvar} disabled={pending}>
              <i className="bi bi-save me-1" />
              Salvar controle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function montarLinhasIniciais(orcamento: OrcFinanceiro, qtd: number, total: number) {
  if (orcamento.parcelasDetalhe.length) {
    return orcamento.parcelasDetalhe.slice(0, qtd).map((p) => ({
      dataPagamento: p.dataPagamento || "",
      valor: p.valor && p.valor !== "0" ? String(p.valor) : "",
      forma: p.formaPagamento || "",
      status: p.status || "pendente",
    }));
  }
  return Array.from({ length: qtd }, (_, indice) => ({
    dataPagamento: indice === 0 ? orcamento.dataPagamento || "" : "",
    valor: indice === 0 && num(orcamento.valorPago) > 0 ? String(orcamento.valorPago) : "",
    forma: orcamento.formaPagamento || "",
    status: "pendente",
  }));
}
