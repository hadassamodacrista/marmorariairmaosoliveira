import Link from "next/link";
import { getOrcamentos } from "@/lib/data/orcamentos";
import { getOrcamentosFinanceiro } from "@/lib/data/financeiro";
import { getPainelContasPagar } from "@/lib/data/contasPagar";
import { moeda, dataBR } from "@/lib/format";
import { num } from "@/lib/calc";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [orcamentos, financeiro, painelPagar] = await Promise.all([
    getOrcamentos(),
    getOrcamentosFinanceiro(),
    getPainelContasPagar(),
  ]);

  const total = orcamentos.length;
  const abertos = orcamentos.filter((o) => o.status === "aberto").length;
  const fechados = orcamentos.filter((o) => ["aprovado", "executado"].includes(o.status)).length;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const fechadoMes = orcamentos
    .filter((o) => ["aprovado", "executado"].includes(o.status) && new Date(o.criadoEm) >= inicioMes)
    .reduce((s, o) => s + num(o.total), 0);

  const aReceber = financeiro.reduce((s: number, o) => {
    const saldo = num(o.saldoRestante);
    return s + (Number.isFinite(saldo) ? saldo : Math.max(num(o.total) - num(o.valorPago), 0));
  }, 0);

  const ultimos = [...orcamentos].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()).slice(0, 5);

  const previsao = aReceber - painelPagar.total;

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Dashboard
      </h4>

      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-file-earmark-text" />
              </div>
              <div>
                <div className="fw-bold fs-4">{total}</div>
                <div className="text-muted small">Total de Orçamentos</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon bg-warning bg-opacity-10 text-warning">
                <i className="bi bi-hourglass-split" />
              </div>
              <div>
                <div className="fw-bold fs-4">{abertos}</div>
                <div className="text-muted small">Em Aberto</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon bg-success bg-opacity-10 text-success">
                <i className="bi bi-check-circle" />
              </div>
              <div>
                <div className="fw-bold fs-4">{fechados}</div>
                <div className="text-muted small">Fechados</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-graph-up-arrow" />
              </div>
              <div>
                <div className="fw-bold fs-5">{moeda(fechadoMes)}</div>
                <div className="text-muted small">Fechado no mês</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4">
          <Link href="/financeiro/receber" className="text-decoration-none">
            <div className="card stat-card p-3">
              <div className="text-muted small">A receber (orçamentos fechados)</div>
              <div className="fw-bold fs-4 text-success">{moeda(aReceber)}</div>
            </div>
          </Link>
        </div>
        <div className="col-sm-6 col-lg-4">
          <Link href="/financeiro/pagar" className="text-decoration-none">
            <div className="card stat-card p-3">
              <div className="text-muted small">
                A pagar em aberto{" "}
                {painelPagar.vencidas > 0 && <span className="badge bg-danger ms-1">{moeda(painelPagar.vencidas)} vencido</span>}
              </div>
              <div className="fw-bold fs-4 text-danger">{moeda(painelPagar.total)}</div>
            </div>
          </Link>
        </div>
        <div className="col-sm-6 col-lg-4">
          <Link href="/financeiro/fluxo" className="text-decoration-none">
            <div className="card stat-card p-3">
              <div className="text-muted small">Previsão a receber − a pagar</div>
              <div className={`fw-bold fs-4 ${previsao >= 0 ? "text-success" : "text-danger"}`}>{moeda(previsao)}</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <strong>Últimos Orçamentos</strong>
          <Link href="/orcamentos" className="btn btn-sm btn-outline-primary">
            Ver todos
          </Link>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>N°</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ultimos.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Nenhum orçamento ainda
                  </td>
                </tr>
              )}
              {ultimos.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="fw-bold">#{String(o.numero).padStart(4, "0")}</span>
                  </td>
                  <td>{o.clienteNome || "—"}</td>
                  <td>{dataBR(o.criadoEm)}</td>
                  <td className="fw-bold">{moeda(o.total)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td>
                    <Link href={`/orcamentos/${o.id}`} className="btn btn-sm btn-outline-secondary">
                      <i className="bi bi-eye" />
                    </Link>
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
