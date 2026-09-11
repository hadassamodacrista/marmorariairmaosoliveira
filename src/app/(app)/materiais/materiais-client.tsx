"use client";

import { useState, useTransition } from "react";
import { salvarMaterialAction, excluirMaterialAction } from "./actions";
import { confirmar } from "@/lib/ui-client";
import { tratarResultado } from "@/lib/use-action-result";
import { moeda } from "@/lib/format";

type Material = { id: string; tipo: string | null; descricao: string; precoM2: string };

export default function MateriaisClient({ initial }: { initial: Material[] }) {
  const [editando, setEditando] = useState<Material | "novo" | null>(null);
  const [pending, startTransition] = useTransition();
  const editandoObj = editando && editando !== "novo" ? editando : null;

  function salvar(formData: FormData) {
    const dados = {
      id: editandoObj?.id || null,
      tipo: String(formData.get("tipo") || ""),
      descricao: String(formData.get("descricao") || ""),
      precoM2: String(formData.get("precoM2") || "0"),
    };
    startTransition(async () => {
      const r = await salvarMaterialAction(dados);
      if (tratarResultado(r, "Material salvo!")) setEditando(null);
    });
  }

  function excluir(id: string) {
    if (!confirmar("Desativar este material?")) return;
    startTransition(async () => {
      const r = await excluirMaterialAction(id);
      tratarResultado(r, "Material desativado");
    });
  }

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Materiais
      </h4>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={() => setEditando("novo")}>
          <i className="bi bi-plus-lg me-1" />
          Novo Material
        </button>
      </div>

      {editando && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-bold">{editandoObj ? "Editar Material" : "Novo Material"}</div>
          <div className="card-body">
            <form action={salvar} key={editandoObj ? editandoObj.id : "novo"}>
              <div className="row g-2">
                <div className="col-md-3">
                  <label className="form-label">Tipo *</label>
                  <input
                    name="tipo"
                    className="form-control"
                    placeholder="Ex.: Mármore, Granito, Quartzito..."
                    defaultValue={editandoObj?.tipo || ""}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Descrição (cor/modelo) *</label>
                  <input
                    name="descricao"
                    className="form-control"
                    placeholder="Ex: Mármore Branco Carrara"
                    defaultValue={editandoObj?.descricao || ""}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Preço por m² (R$) *</label>
                  <input
                    name="precoM2"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    defaultValue={editandoObj?.precoM2 || ""}
                    required
                  />
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
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Preço/m²</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {initial.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Nenhum material cadastrado
                  </td>
                </tr>
              )}
              {initial.map((m) => (
                <tr key={m.id}>
                  <td>{m.tipo || ""}</td>
                  <td>{m.descricao}</td>
                  <td className="fw-bold">{moeda(m.precoM2)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setEditando(m)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(m.id)}>
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
