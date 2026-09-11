import { getFluxoCaixa } from "@/lib/data/fluxoCaixa";
import { moeda, dataBR } from "@/lib/format";
import { rotuloCategoriaPagar } from "@/lib/constants";

export const dynamic = "force-dynamic";

function moedaCurta(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1000) return (v < 0 ? "-" : "") + "R$ " + (abs / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "k";
  return moeda(v);
}

function mesAno(m: string) {
  const [ano, mes] = m.split("-");
  const nomes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${nomes[parseInt(mes, 10) - 1] || mes}/${ano.slice(2)}`;
}

export default async function FluxoCaixaPage({ searchParams }: { searchParams: Promise<{ de?: string; ate?: string }> }) {
  const { de, ate } = await searchParams;
  const fluxo = await getFluxoCaixa({ de, ate });
  const r = fluxo.resumo;
  const maxMes = Math.max(1, ...fluxo.porMes.map((m) => Math.max(m.entradas, m.saidas)));

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Fluxo de Caixa
      </h4>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <form className="row g-2 align-items-end" method="get">
            <div className="col-auto">
              <label className="form-label small mb-1">De</label>
              <input type="date" name="de" defaultValue={r.de} className="form-control form-control-sm" />
            </div>
            <div className="col-auto">
              <label className="form-label small mb-1">Até</label>
              <input type="date" name="ate" defaultValue={r.ate} className="form-control form-control-sm" />
            </div>
            <div className="col-auto">
              <button className="btn btn-sm btn-primary">Aplicar</button>
            </div>
          </form>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Entradas realizadas</div>
            <div className="fw-bold fs-5 text-success">{moeda(r.entradasRealizadas)}</div>
            <div className="text-muted small">previsto +{moeda(r.entradasPrevistas)}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Saídas realizadas</div>
            <div className="fw-bold fs-5 text-danger">{moeda(r.saidasRealizadas)}</div>
            <div className="text-muted small">previsto +{moeda(r.saidasPrevistas)}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Saldo realizado</div>
            <div className={`fw-bold fs-5 ${r.saldoRealizado >= 0 ? "text-success" : "text-danger"}`}>{moeda(r.saldoRealizado)}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small">Saldo previsto no período</div>
            <div className={`fw-bold fs-5 ${r.saldoPrevisto >= 0 ? "text-success" : "text-danger"}`}>{moeda(r.saldoPrevisto)}</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-bold">Por mês</div>
            <div className="card-body">
              {fluxo.porMes.length ? (
                <>
                  <div className="d-flex align-items-end gap-3" style={{ height: 160 }}>
                    {fluxo.porMes.map((m) => (
                      <div key={m.mes} className="text-center flex-fill">
                        <div className="d-flex align-items-end justify-content-center gap-1" style={{ height: 120 }}>
                          <div
                            title={`Entradas ${moeda(m.entradas)}`}
                            style={{ width: 14, background: "#198754", borderRadius: "3px 3px 0 0", height: `${Math.round((m.entradas / maxMes) * 100)}%` }}
                          />
                          <div
                            title={`Saídas ${moeda(m.saidas)}`}
                            style={{ width: 14, background: "#dc3545", borderRadius: "3px 3px 0 0", height: `${Math.round((m.saidas / maxMes) * 100)}%` }}
                          />
                        </div>
                        <div className="small text-muted mt-1">{mesAno(m.mes)}</div>
                        <div className={`small fw-bold ${m.saldo >= 0 ? "text-success" : "text-danger"}`}>{moedaCurta(m.saldo)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="small text-muted mt-2">
                    <span className="badge bg-success">&nbsp;</span> entradas &nbsp;
                    <span className="badge bg-danger">&nbsp;</span> saídas
                  </div>
                </>
              ) : (
                <div className="text-muted">Sem lançamentos no período.</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-bold">Saídas por categoria</div>
            <div className="card-body">
              {fluxo.porCategoria.length ? (
                fluxo.porCategoria.map((c) => (
                  <div key={c.categoria} className="d-flex justify-content-between border-bottom py-1">
                    <span>{rotuloCategoriaPagar(c.categoria)}</span>
                    <span className="fw-bold">{moeda(c.valor)}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted">Nenhuma saída no período.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-3">
        <div className="card-header bg-white fw-bold">Lançamentos do período ({fluxo.lancamentos.length})</div>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Origem</th>
                <th>Descrição</th>
                <th className="text-end">Valor</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {fluxo.lancamentos.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Nada no período
                  </td>
                </tr>
              )}
              {fluxo.lancamentos.map((l, i) => (
                <tr key={i}>
                  <td>{dataBR(l.data)}</td>
                  <td>{l.tipo === "entrada" ? <span className="text-success">Entrada</span> : <span className="text-danger">Saída</span>}</td>
                  <td>{l.origem}</td>
                  <td>{l.descricao}</td>
                  <td className={`text-end fw-bold ${l.tipo === "entrada" ? "text-success" : "text-danger"}`}>
                    {l.tipo === "saida" ? "- " : ""}
                    {moeda(l.valor)}
                  </td>
                  <td>
                    {l.realizado ? <span className="badge bg-success">Realizado</span> : <span className="badge bg-warning text-dark">Previsto</span>}
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
