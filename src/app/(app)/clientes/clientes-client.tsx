"use client";

import { useMemo, useState, useTransition } from "react";
import { salvarClienteAction, excluirClienteAction } from "./actions";
import { confirmar } from "@/lib/ui-client";
import { tratarResultado } from "@/lib/use-action-result";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
};

export default function ClientesClient({ initial }: { initial: Cliente[] }) {
  const [editando, setEditando] = useState<Cliente | "novo" | null>(null);
  const [busca, setBusca] = useState("");
  const [pending, startTransition] = useTransition();

  const filtrados = useMemo(
    () => initial.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase())),
    [initial, busca]
  );

  function salvar(formData: FormData) {
    const dados = {
      id: editando && editando !== "novo" ? editando.id : null,
      nome: String(formData.get("nome") || ""),
      telefone: String(formData.get("telefone") || ""),
      email: String(formData.get("email") || ""),
      endereco: String(formData.get("endereco") || ""),
      cidade: String(formData.get("cidade") || ""),
    };
    startTransition(async () => {
      const r = await salvarClienteAction(dados);
      if (tratarResultado(r, "Cliente salvo!")) setEditando(null);
    });
  }

  function excluir(id: string) {
    if (!confirmar("Excluir este cliente?")) return;
    startTransition(async () => {
      const r = await excluirClienteAction(id);
      tratarResultado(r, "Cliente excluído");
    });
  }

  const editandoObj = editando && editando !== "novo" ? editando : null;

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Clientes
      </h4>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: 300 }}>
          <span className="input-group-text">
            <i className="bi bi-search" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setEditando("novo")}>
          <i className="bi bi-person-plus me-1" />
          Novo Cliente
        </button>
      </div>

      {editando && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white fw-bold">{editandoObj ? "Editar Cliente" : "Novo Cliente"}</div>
          <div className="card-body">
            <form action={salvar} key={editandoObj ? editandoObj.id : "novo"}>
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="form-label">Nome *</label>
                  <input name="nome" className="form-control" defaultValue={editandoObj?.nome || ""} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Telefone</label>
                  <input name="telefone" className="form-control" defaultValue={editandoObj?.telefone || ""} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" className="form-control" defaultValue={editandoObj?.email || ""} />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Endereço</label>
                  <input name="endereco" className="form-control" defaultValue={editandoObj?.endereco || ""} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Cidade/UF</label>
                  <input name="cidade" className="form-control" defaultValue={editandoObj?.cidade || ""} />
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
                <th>Telefone</th>
                <th>Email</th>
                <th>Cidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    Nenhum cliente cadastrado
                  </td>
                </tr>
              )}
              {filtrados.map((c) => (
                <tr key={c.id}>
                  <td>{c.nome}</td>
                  <td>{c.telefone || "—"}</td>
                  <td>{c.email || "—"}</td>
                  <td>{c.cidade || "—"}</td>
                  <td>
                    <div className="d-flex gap-1">
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
