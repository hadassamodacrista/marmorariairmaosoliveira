"use client";

import { useState, useTransition } from "react";
import { salvarTipoPecaAction, excluirTipoPecaAction } from "./actions";
import { confirmar } from "@/lib/ui-client";
import { tratarResultado } from "@/lib/use-action-result";

type Tipo = { id: string; nome: string; unidade: string };

export default function TiposPecaClient({ initial }: { initial: Tipo[] }) {
  const [editando, setEditando] = useState<Tipo | "novo" | null>(null);
  const [pending, startTransition] = useTransition();
  const editandoObj = editando && editando !== "novo" ? editando : null;

  function salvar(formData: FormData) {
    const dados = {
      id: editandoObj?.id || null,
      nome: String(formData.get("nome") || ""),
      unidade: String(formData.get("unidade") || "m²"),
    };
    startTransition(async () => {
      const r = await salvarTipoPecaAction(dados);
      if (tratarResultado(r, "Tipo de peça salvo!")) setEditando(null);
    });
  }

  function excluir(id: string) {
    if (!confirmar("Desativar este tipo de peça?")) return;
    startTransition(async () => {
      const r = await excluirTipoPecaAction(id);
      tratarResultado(r, "Tipo desativado");
    });
  }

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Tipos de Peça
      </h4>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={() => setEditando("novo")}>
          <i className="bi bi-plus-lg me-1" />
          Novo Tipo de Peça
        </button>
      </div>

      {editando && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-bold">{editandoObj ? "Editar Tipo de Peça" : "Novo Tipo de Peça"}</div>
          <div className="card-body">
            <form action={salvar} key={editandoObj ? editandoObj.id : "novo"}>
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="form-label">Nome *</label>
                  <input name="nome" className="form-control" defaultValue={editandoObj?.nome || ""} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Unidade</label>
                  <input name="unidade" className="form-control" placeholder="m², ml, un" defaultValue={editandoObj?.unidade || "m²"} />
                </div>
                <div className="col-12 d-flex gap-2 mt-2">
                  <button type="submit" className="btn btn-primary" disabled={pending}>
                    Salvar
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditando(null)}>
                    Cancelar
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
                <th>Nome</th>
                <th>Unidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {initial.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4">
                    Nenhum tipo cadastrado
                  </td>
                </tr>
              )}
              {initial.map((t) => (
                <tr key={t.id}>
                  <td>{t.nome}</td>
                  <td>{t.unidade || "m²"}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setEditando(t)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(t.id)}>
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
