"use client";

import { useMemo, useState, useTransition } from "react";
import { moeda, dataBR, paraISODate, hojeISO } from "@/lib/format";
import { num, parseValorBR } from "@/lib/calc";
import { confirmar } from "@/lib/ui-client";
import { tratarResultado } from "@/lib/use-action-result";
import { CATEGORIAS_PAGAR_UI, rotuloCategoriaPagar, FORMAS_PAGAMENTO } from "@/lib/constants";
import { salvarContaPagarAction, excluirContaPagarAction, pagarContaPagarAction, reabrirContaPagarAction } from "./actions";

type Fornecedor = { id: string; nome: string };
export type ContaPagar = {
  id: string;
  fornecedorId: string | null;
  fornecedorNome: string;
  descricao: string;
  categoria: string;
  orcamentoId: string | null;
  valor: number;
  emitidoEm: string | null;
  venceEm: string | null;
  pagoEm: string | null;
  status: string;
  formaPagamento: string | null;
  observacoes: string | null;
  atrasada: boolean;
};

export default function ContasPagarClient({ initial, fornecedores }: { initial: ContaPagar[]; fornecedores: Fornecedor[] }) {
  const [filtro, setFiltro] = useState<"" | "pendente" | "pago">("");
  const [editando, setEditando] = useState<ContaPagar | "novo" | null>(null);
  const [pending, startTransition] = useTransition();

  const contas = useMemo(() => (filtro ? initial.filter((c) => c.status === filtro) : initial), [initial, filtro]);

  const hoje = hojeISO();
  const abertas = initial.filter((c) => c.status === "pendente");
  const vencidas = abertas.filter((c) => c.venceEm && c.venceEm < hoje);
  const inicioMes = hoje.slice(0, 7);
  const pagasMes = initial.filter((c) => c.status === "pago" && (c.pagoEm || "").slice(0, 7) === inicioMes);
  const soma = (arr: ContaPagar[]) => arr.reduce((s, c) => s + c.valor, 0);

  const editandoObj = editando && editando !== "novo" ? editando : null;

  function salvar(formData: FormData) {
    const dados = {
      id: editandoObj?.id || null,
      descricao: String(formData.get("descricao") || ""),
      valor: String(parseValorBR(formData.get("valor"))),
      categoria: String(formData.get("categoria") || "outro"),
      fornecedorId: String(formData.get("fornecedorId") || ""),
      fornecedorNome: String(formData.get("fornecedorNome") || ""),
      orcamentoId: String(formData.get("orcamentoId") || ""),
      emitidoEm: String(formData.get("emitidoEm") || ""),
      venceEm: String(formData.get("venceEm") || ""),
      pagoEm: String(formData.get("pagoEm") || ""),
      formaPagamento: String(formData.get("formaPagamento") || ""),
      observacoes: String(formData.get("observacoes") || ""),
    };
    startTransition(async () => {
      const r = await salvarContaPagarAction(dados);
      if (tratarResultado(r, "Conta salva!")) setEditando(null);
    });
  }

  function excluir(id: string) {
    if (!confirmar("Excluir esta conta a pagar?")) return;
    startTransition(async () => {
      const r = await excluirContaPagarAction(id);
      tratarResultado(r, "Conta excluída");
    });
  }

  function pagar(id: string) {
    const data = window.prompt("Data do pagamento (AAAA-MM-DD):", hoje);
    if (data === null) return;
    startTransition(async () => {
      const r = await pagarContaPagarAction(id, { pagoEm: data || hoje });
      tratarResultado(r, "Conta baixada como paga!");
    });
  }

  function reabrir(id: string) {
    startTransition(async () => {
      const r = await reabrirContaPagarAction(id);
      tratarResultado(r, "Conta reaberta");
    });
  }

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Contas a Pagar
      </h4>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Em aberto</div>
            <div className="fw-bold fs-5 text-danger">{moeda(soma(abertas))}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Vencidas</div>
            <div className={`fw-bold fs-5 ${vencidas.length ? "text-danger" : "text-muted"}`}>{moeda(soma(vencidas))}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Pagas no mês</div>
            <div className="fw-bold fs-5 text-success">{moeda(soma(pagasMes))}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Lançamentos</div>
            <div className="fw-bold fs-5">{initial.length}</div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div className="btn-group btn-group-sm">
          {(
            [
              ["", "Todas"],
              ["pendente", "Em aberto"],
              ["pago", "Pagas"],
            ] as const
          ).map(([v, l]) => (
            <button key={v} className={`btn btn-${filtro === v ? "primary" : "outline-primary"}`} onClick={() => setFiltro(v)}>
              {l}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setEditando("novo")}>
          <i className="bi bi-plus-lg me-1" />
          Nova Conta
        </button>
      </div>

      {editando && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-bold">{editandoObj ? "Editar Conta" : "Nova Conta a Pagar"}</div>
          <div className="card-body">
            <form action={salvar} key={editandoObj ? editandoObj.id : "novo"}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Descrição *</label>
                  <input
                    name="descricao"
                    className="form-control"
                    placeholder="Ex.: Chapa Branco Siena 2,90x1,90"
                    defaultValue={editandoObj?.descricao || ""}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Valor (R$) *</label>
                  <input
                    name="valor"
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    placeholder="0,00"
                    defaultValue={editandoObj ? String(editandoObj.valor).replace(".", ",") : ""}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Categoria</label>
                  <select name="categoria" className="form-select" defaultValue={editandoObj?.categoria || "chapa"}>
                    {CATEGORIAS_PAGAR_UI.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fornecedor</label>
                  <select name="fornecedorId" className="form-select" defaultValue={editandoObj?.fornecedorId || ""}>
                    <option value="">— Selecionar / avulso —</option>
                    {fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">ou nome do fornecedor</label>
                  <input
                    name="fornecedorNome"
                    className="form-control"
                    placeholder="se não estiver no cadastro"
                    defaultValue={!editandoObj?.fornecedorId ? editandoObj?.fornecedorNome || "" : ""}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Vincular ao orçamento (nº)</label>
                  <input name="orcamentoId" className="form-control" placeholder="opcional" defaultValue={editandoObj?.orcamentoId || ""} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Emissão</label>
                  <input name="emitidoEm" type="date" className="form-control" defaultValue={paraISODate(editandoObj?.emitidoEm)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Vencimento</label>
                  <input name="venceEm" type="date" className="form-control" defaultValue={paraISODate(editandoObj?.venceEm)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Pago em</label>
                  <input name="pagoEm" type="date" className="form-control" defaultValue={paraISODate(editandoObj?.pagoEm)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Forma de pagamento</label>
                  <select name="formaPagamento" className="form-select" defaultValue={editandoObj?.formaPagamento || ""}>
                    {FORMAS_PAGAMENTO.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Observações</label>
                  <input name="observacoes" className="form-control" defaultValue={editandoObj?.observacoes || ""} />
                </div>
                <div className="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditando(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={pending}>
                    <i className="bi bi-save me-1" />
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Vencimento</th>
                <th>Fornecedor</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th className="text-end">Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {contas.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Nenhuma conta lançada
                  </td>
                </tr>
              )}
              {contas.map((c) => (
                <tr key={c.id} className={c.atrasada ? "table-danger" : ""}>
                  <td>{c.venceEm ? dataBR(c.venceEm) : "—"}</td>
                  <td>{c.fornecedorNome || "—"}</td>
                  <td>
                    {c.descricao}
                    {c.orcamentoId && <span className="badge bg-light text-dark border ms-1">OS vinculada</span>}
                  </td>
                  <td>
                    <span className="badge bg-secondary bg-opacity-25 text-dark">{rotuloCategoriaPagar(c.categoria)}</span>
                  </td>
                  <td className="text-end fw-bold">{moeda(c.valor)}</td>
                  <td>
                    {c.status === "pago" ? (
                      <span className="badge bg-success">Paga</span>
                    ) : c.status === "cancelado" ? (
                      <span className="badge bg-secondary">Cancelada</span>
                    ) : c.atrasada ? (
                      <span className="badge bg-danger">Vencida</span>
                    ) : (
                      <span className="badge bg-warning text-dark">A pagar</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      {c.status === "pendente" ? (
                        <button className="btn btn-sm btn-success" title="Marcar como paga" onClick={() => pagar(c.id)}>
                          <i className="bi bi-check-lg" />
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-outline-secondary" title="Reabrir" onClick={() => reabrir(c.id)}>
                          <i className="bi bi-arrow-counterclockwise" />
                        </button>
                      )}
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setEditando(c)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(c.id)}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
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
