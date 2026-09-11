"use client";

import { useState, useTransition } from "react";
import { salvarFornecedorAction, excluirFornecedorAction } from "./actions";
import { confirmar, toast } from "@/lib/ui-client";
import { tratarResultado } from "@/lib/use-action-result";

type Fornecedor = {
  id: string;
  nome: string;
  tipo: string;
  documento: string | null;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
};

const TIPOS: [string, string][] = [
  ["chapa", "Chapas / mármore"],
  ["insumo", "Insumos"],
  ["servico", "Serviços de terceiros"],
  ["outro", "Outro"],
];

function rotuloTipo(tipo: string) {
  return TIPOS.find((t) => t[0] === tipo)?.[1] || tipo;
}

export default function FornecedoresClient({ initial }: { initial: Fornecedor[] }) {
  const [editando, setEditando] = useState<Fornecedor | "novo" | null>(null);
  const [pending, startTransition] = useTransition();
  const editandoObj = editando && editando !== "novo" ? editando : null;

  function salvar(formData: FormData) {
    const dados = {
      id: editandoObj?.id || null,
      nome: String(formData.get("nome") || ""),
      tipo: String(formData.get("tipo") || "outro"),
      documento: String(formData.get("documento") || ""),
      telefone: String(formData.get("telefone") || ""),
      email: String(formData.get("email") || ""),
      observacoes: String(formData.get("observacoes") || ""),
    };
    startTransition(async () => {
      const r = await salvarFornecedorAction(dados);
      if (tratarResultado(r, "Fornecedor salvo!")) setEditando(null);
    });
  }

  function excluir(id: string) {
    if (!confirmar("Excluir/inativar este fornecedor?")) return;
    startTransition(async () => {
      const r = await excluirFornecedorAction(id);
      if (!r.ok) { toast(r.error, "danger"); return; }
      toast(r.data === "inativado" ? "Fornecedor inativado (possui contas vinculadas)" : "Fornecedor excluído");
    });
  }

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Fornecedores
      </h4>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={() => setEditando("novo")}>
          <i className="bi bi-plus-lg me-1" />
          Novo Fornecedor
        </button>
      </div>

      {editando && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-bold">{editandoObj ? "Editar Fornecedor" : "Novo Fornecedor"}</div>
          <div className="card-body">
            <form action={salvar} key={editandoObj ? editandoObj.id : "novo"}>
              <div className="row g-2">
                <div className="col-md-5">
                  <label className="form-label">Nome *</label>
                  <input name="nome" className="form-control" defaultValue={editandoObj?.nome || ""} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tipo</label>
                  <select name="tipo" className="form-select" defaultValue={editandoObj?.tipo || "chapa"}>
                    {TIPOS.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">CNPJ / CPF</label>
                  <input name="documento" className="form-control" defaultValue={editandoObj?.documento || ""} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Telefone</label>
                  <input name="telefone" className="form-control" defaultValue={editandoObj?.telefone || ""} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" className="form-control" defaultValue={editandoObj?.email || ""} />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Observações</label>
                  <input name="observacoes" className="form-control" defaultValue={editandoObj?.observacoes || ""} />
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
                <th>Tipo</th>
                <th>Documento</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {initial.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    Nenhum fornecedor cadastrado
                  </td>
                </tr>
              )}
              {initial.map((f) => (
                <tr key={f.id}>
                  <td>{f.nome}</td>
                  <td>{rotuloTipo(f.tipo)}</td>
                  <td>{f.documento || "—"}</td>
                  <td>{f.telefone || "—"}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setEditando(f)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(f.id)}>
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
