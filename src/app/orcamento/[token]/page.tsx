import type { Metadata } from "next";
import { getOrcamentoPorToken } from "@/lib/data/orcamentos";
import { getConfig } from "@/lib/data/config";
import { moeda, numeroPt, dataBR } from "@/lib/format";
import { calcularAreaItem, calcularValorItem, calcularTotais, num } from "@/lib/calc";
import AceiteBox from "./aceite-box";
import PrintPdfButtons from "./print-pdf-buttons";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const orc = await getOrcamentoPorToken(token);
  return { title: orc ? `Orçamento #${String(orc.numero).padStart(4, "0")}` : "Orçamento" };
}

export default async function OrcamentoPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [orc, config] = await Promise.all([getOrcamentoPorToken(token), getConfig()]);

  if (!orc) {
    return (
      <div className="container py-5 text-center">
        <div className="display-1 text-danger">⚠</div>
        <h2 className="mt-3">Link inválido</h2>
        <p className="text-muted">Orçamento não encontrado ou link inválido.</p>
      </div>
    );
  }

  const cliente = orc.cliente;
  const itens = orc.itens;
  const temProfundidade = itens.some((i) => num(i.profundidade) > 0);

  const totais = calcularTotais({
    itens: itens.map((i) => ({
      comprimento: num(i.comprimento),
      largura: num(i.largura),
      profundidade: num(i.profundidade),
      quantidade: num(i.quantidade) || 1,
      precoM2: num(i.precoM2),
    })),
    frete: num(orc.frete),
    descontoPct: num(orc.descontoPct),
  });
  const totalSalvo = num(orc.total);
  const totalFinal = totalSalvo || totais.total;

  return (
    <div className="orcamento-card">
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <span className="text-muted small">
          <i className="bi bi-eye me-1" />
          Visualização do orçamento
        </span>
        <PrintPdfButtons orcamentoId={orc.id} token={orc.token} />
      </div>

      <div className="header-empresa d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <div className="empresa-nome">{config.empresa_nome || "Marmoraria"}</div>
          <div className="empresa-info mt-1">
            {config.empresa_endereco && (
              <>
                {config.empresa_endereco}
                <br />
              </>
            )}
            {config.empresa_tel && <>📞 {config.empresa_tel}</>}
            {config.empresa_email && <>  ✉ {config.empresa_email}</>}
            {config.empresa_cnpj && (
              <>
                <br />
                CNPJ: {config.empresa_cnpj}
              </>
            )}
          </div>
        </div>
        <div className="text-end">
          <div className="numero-orc">ORÇAMENTO</div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#1a1a2e" }}>#{String(orc.numero).padStart(4, "0")}</div>
          <div className="text-muted small">Data: {dataBR(orc.criadoEm)}</div>
          {orc.validade && <div className="text-muted small">Válido até: {dataBR(orc.validade)}</div>}
        </div>
      </div>

      <div className="section-title">Dados do Cliente</div>
      <div className="cliente-info mb-4">
        <div className="row">
          <div className="col-sm-6">
            <div className="fw-bold fs-5">{orc.clienteNome || "—"}</div>
            {cliente?.telefone && <div className="text-muted">📞 {cliente.telefone}</div>}
            {cliente?.email && <div className="text-muted">✉ {cliente.email}</div>}
          </div>
          <div className="col-sm-6">
            {cliente?.endereco && (
              <div className="text-muted">
                📍 {cliente.endereco}
                {cliente.cidade ? `, ${cliente.cidade}` : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-title">Itens do Orçamento</div>
      <div className="table-responsive mb-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Ambiente</th>
              <th>Tipo de Peça</th>
              <th>Tipo de Serviço</th>
              <th>Material</th>
              <th className="text-center">Comp.(m)</th>
              <th className="text-center">Larg.(m)</th>
              {temProfundidade && <th className="text-center">Prof.(m)</th>}
              <th className="text-center">Qtd</th>
              <th className="text-center">{temProfundidade ? "Área/Vol." : "Área(m²)"}</th>
              <th className="text-center">{temProfundidade ? "Valor unit." : "Valor m²"}</th>
              <th className="text-end">Valor</th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 && (
              <tr>
                <td colSpan={temProfundidade ? 11 : 10} className="text-center text-muted py-3">
                  Nenhum item
                </td>
              </tr>
            )}
            {itens.map((item, i) => {
              const temProf = num(item.profundidade) > 0;
              const unidade = temProf ? "m³" : "m²";
              const calc = {
                comprimento: num(item.comprimento),
                largura: num(item.largura),
                profundidade: num(item.profundidade),
                quantidade: num(item.quantidade) || 1,
                precoM2: num(item.precoM2),
              };
              const area = calcularAreaItem(calc);
              const valor = calcularValorItem(calc);
              return (
                <tr key={item.id} className={i % 2 === 0 ? "table-light" : ""}>
                  <td>{item.ambiente || "—"}</td>
                  <td>{item.tipoPecaNome || ""}</td>
                  <td>{item.tipoServicoNome || "—"}</td>
                  <td>{item.materialDesc || ""}</td>
                  <td className="text-center">{numeroPt(item.comprimento, 2, 2)}</td>
                  <td className="text-center">{numeroPt(item.largura, 2, 2)}</td>
                  {temProfundidade && <td className="text-center">{temProf ? numeroPt(item.profundidade, 2, 2) : "—"}</td>}
                  <td className="text-center">{item.quantidade || 1}</td>
                  <td className="text-center">
                    {numeroPt(area, 4, 4)} {unidade}
                  </td>
                  <td className="text-center">{moeda(item.precoM2)}</td>
                  <td className="text-end fw-bold">{moeda(valor)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mb-4">
        <div className="total-box">
          <div className="d-flex justify-content-between gap-5 small">
            <span>Subtotal dos itens</span>
            <span>{moeda(totais.subtotalItens)}</span>
          </div>
          {totais.frete > 0 && (
            <div className="d-flex justify-content-between gap-5 small mt-1">
              <span>Frete</span>
              <span>{moeda(totais.frete)}</span>
            </div>
          )}
          {totais.descontoPct > 0 && (
            <div className="d-flex justify-content-between gap-5 small mt-1">
              <span>Desconto ({numeroPt(totais.descontoPct, 0, 2)}%)</span>
              <span>- {moeda(totais.descontoValor)}</span>
            </div>
          )}
          <hr className="border-light opacity-50 my-2" />
          <div className="text-white-50 small mb-1">VALOR TOTAL DO ORÇAMENTO</div>
          <div className="total-valor">{moeda(totalFinal)}</div>
        </div>
      </div>

      {(orc.observacoes || config.orcamento_obs) && (
        <>
          <div className="section-title">Observações</div>
          <div className="obs-box mb-4">{orc.observacoes || config.orcamento_obs}</div>
        </>
      )}

      <AceiteBox token={orc.token} status={orc.status} aceiteEm={orc.aceiteEm} aceiteNome={orc.aceiteNome} />

      {orc.aceiteEm && (
        <div
          className="mt-4 p-3 text-center"
          style={{ border: "1px dashed #b7e0c1", borderRadius: 8, background: "#f3fbf5", color: "#14612e" }}
        >
          <strong>✔ Orçamento aprovado digitalmente pelo cliente</strong>
          <br />
          <span style={{ fontSize: ".85rem" }}>
            {orc.aceiteNome}
            {orc.aceiteDocumento ? ` — ${orc.aceiteDocumento}` : ""}
          </span>
        </div>
      )}

      <div className="mt-5 pt-4 border-top text-center text-muted small">
        {config.empresa_nome} — {config.empresa_tel}
        <br />
        Obrigado pela preferência!
      </div>
    </div>
  );
}
