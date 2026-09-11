"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { excluirOrcamentoAction } from "./actions";
import BotaoExcluir from "@/components/BotaoExcluir";
import StatusBadge from "@/components/StatusBadge";
import { moeda, dataBR } from "@/lib/format";
import { linkWhatsappOrcamento } from "@/lib/whatsapp";

export type OrcamentoLinha = {
  id: string;
  numero: number;
  clienteNome: string | null;
  criadoEm: string | Date;
  validade: string | null;
  total: string;
  status: string;
  token: string;
  aceiteEm: string | Date | null;
  telefoneCliente: string | null;
};

export default function OrcamentosClient({ initial, baseUrl }: { initial: OrcamentoLinha[]; baseUrl: string }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(
    () => initial.filter((o) => (o.clienteNome || "").toLowerCase().includes(busca.toLowerCase())),
    [initial, busca]
  );

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Orçamentos
      </h4>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: 300 }}>
          <span className="input-group-text">
            <i className="bi bi-search" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Link href="/orcamentos/novo" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1" />
          Novo Orçamento
        </Link>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>N°</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Validade</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Nenhum orçamento encontrado
                  </td>
                </tr>
              )}
              {filtrados.map((o) => {
                const urlPublica = `${baseUrl}/orcamento/${o.token}`;
                const linkWpp = linkWhatsappOrcamento({
                  telefone: o.telefoneCliente,
                  clienteNome: o.clienteNome || "",
                  numero: o.numero,
                  totalFormatado: moeda(o.total),
                  urlPublica,
                });
                return (
                  <tr key={o.id}>
                    <td>
                      <strong>#{String(o.numero).padStart(4, "0")}</strong>
                    </td>
                    <td>{o.clienteNome || "—"}</td>
                    <td>{dataBR(o.criadoEm)}</td>
                    <td>{o.validade ? dataBR(o.validade) : "—"}</td>
                    <td className="fw-bold text-danger">{moeda(o.total)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                      {o.aceiteEm && <i className="bi bi-patch-check-fill text-success ms-1" title="Aprovado pelo cliente" />}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link href={`/orcamentos/${o.id}`} className="btn btn-sm btn-outline-primary" title="Ver/Editar">
                          <i className="bi bi-pencil" />
                        </Link>
                        <a
                          className="btn btn-sm btn-outline-success"
                          title="PDF do orçamento (cliente)"
                          href={`/api/pdf/orcamento/${o.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <i className="bi bi-file-pdf" />
                        </a>
                        <a
                          className="btn btn-sm btn-outline-dark"
                          title="Lista de corte (fábrica)"
                          href={`/api/pdf/romaneio/${o.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <i className="bi bi-rulers" />
                        </a>
                        <a className="btn btn-sm btn-success" title="Enviar WhatsApp" href={linkWpp} target="_blank" rel="noreferrer">
                          <i className="bi bi-whatsapp" />
                        </a>
                        <BotaoExcluir
                          mensagemConfirmacao="Excluir este orçamento? Esta ação não pode ser desfeita."
                          mensagemSucesso="Orçamento excluído"
                          acao={() => excluirOrcamentoAction(o.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
