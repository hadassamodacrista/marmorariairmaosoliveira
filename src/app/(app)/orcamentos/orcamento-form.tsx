"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { calcularAreaItem, calcularValorItem, calcularTotais, num } from "@/lib/calc";
import { moeda, numeroPt } from "@/lib/format";
import { toast } from "@/lib/ui-client";
import { salvarOrcamentoAction } from "./actions";
import { salvarClienteAction } from "../clientes/actions";
import { linkWhatsappOrcamento } from "@/lib/whatsapp";

type Cliente = { id: string; nome: string; telefone: string | null };
type Material = { id: string; tipo: string | null; descricao: string; precoM2: string };
type TipoSimples = { id: string; nome: string };

export type ItemInicial = {
  ambiente: string | null;
  tipoPecaNome: string | null;
  tipoServicoNome: string | null;
  materialDesc: string | null;
  materialTipo: string | null;
  comprimento: string;
  largura: string;
  profundidade: string;
  quantidade: string;
  precoM2: string;
};

export type OrcamentoInicial = {
  id: string;
  numero: number;
  token: string;
  clienteId: string | null;
  status: string;
  observacoes: string | null;
  validade: string | null;
  frete: string;
  descontoPct: string;
  itens: ItemInicial[];
  aceiteEm: string | Date | null;
  aceiteNome: string | null;
  aceiteDocumento: string | null;
};

type LinhaItem = {
  key: string;
  ambiente: string;
  tipoPecaNome: string;
  tipoServicoNome: string;
  materialDesc: string;
  materialTipo: string;
  precoM2: string;
  comprimento: string;
  largura: string;
  profundidade: string;
  quantidade: string;
};

let contador = 0;
function novaChave() {
  contador += 1;
  return `item-${Date.now()}-${contador}`;
}

function linhaVazia(): LinhaItem {
  return {
    key: novaChave(),
    ambiente: "",
    tipoPecaNome: "",
    tipoServicoNome: "",
    materialDesc: "",
    materialTipo: "",
    precoM2: "0",
    comprimento: "",
    largura: "",
    profundidade: "",
    quantidade: "1",
  };
}

export default function OrcamentoForm({
  clientesIniciais,
  materiais,
  tiposPeca,
  tiposServico,
  orcamento,
  baseUrl,
}: {
  clientesIniciais: Cliente[];
  materiais: Material[];
  tiposPeca: TipoSimples[];
  tiposServico: TipoSimples[];
  orcamento: OrcamentoInicial | null;
  baseUrl: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [clientes, setClientes] = useState(clientesIniciais);
  const [clienteId, setClienteId] = useState(orcamento?.clienteId || "");
  const [status, setStatus] = useState(orcamento?.status || "aberto");
  const [validade, setValidade] = useState(orcamento?.validade || "");
  const [observacoes, setObservacoes] = useState(orcamento?.observacoes || "");
  const [frete, setFrete] = useState(orcamento?.frete && orcamento.frete !== "0" ? orcamento.frete : "");
  const [descontoPct, setDescontoPct] = useState(
    orcamento?.descontoPct && orcamento.descontoPct !== "0" ? orcamento.descontoPct : ""
  );
  const [mostrarNovoCliente, setMostrarNovoCliente] = useState(false);

  const [itens, setItens] = useState<LinhaItem[]>(() => {
    if (orcamento && orcamento.itens.length > 0) {
      return orcamento.itens.map((i) => ({
        key: novaChave(),
        ambiente: i.ambiente || "",
        tipoPecaNome: i.tipoPecaNome || "",
        tipoServicoNome: i.tipoServicoNome || "",
        materialDesc: i.materialDesc || "",
        materialTipo: i.materialTipo || "",
        precoM2: i.precoM2 || "0",
        comprimento: i.comprimento || "",
        largura: i.largura || "",
        profundidade: i.profundidade || "",
        quantidade: i.quantidade || "1",
      }));
    }
    return [linhaVazia()];
  });

  function atualizarItem(key: string, campo: keyof LinhaItem, valor: string) {
    setItens((atual) => atual.map((it) => (it.key === key ? { ...it, [campo]: valor } : it)));
  }

  function selecionarMaterial(key: string, descricao: string) {
    const material = materiais.find((m) => m.descricao === descricao);
    setItens((atual) =>
      atual.map((it) =>
        it.key === key
          ? { ...it, materialDesc: descricao, materialTipo: material?.tipo || "", precoM2: material?.precoM2 || "0" }
          : it
      )
    );
  }

  function adicionarItem() {
    setItens((atual) => [...atual, linhaVazia()]);
  }

  function removerItem(key: string) {
    setItens((atual) => atual.filter((it) => it.key !== key));
  }

  const itensCalc = useMemo(
    () =>
      itens.map((it) => {
        const base = {
          comprimento: num(it.comprimento),
          largura: num(it.largura),
          profundidade: num(it.profundidade),
          quantidade: num(it.quantidade) || 1,
          precoM2: num(it.precoM2),
        };
        return { ...it, area: calcularAreaItem(base), valor: calcularValorItem(base), temProf: base.profundidade > 0 };
      }),
    [itens]
  );

  const totais = useMemo(
    () =>
      calcularTotais({
        itens: itensCalc.map((i) => ({
          comprimento: num(i.comprimento),
          largura: num(i.largura),
          profundidade: num(i.profundidade),
          quantidade: num(i.quantidade) || 1,
          precoM2: num(i.precoM2),
        })),
        frete: num(frete),
        descontoPct: num(descontoPct),
      }),
    [itensCalc, frete, descontoPct]
  );

  function salvarNovoCliente(formData: FormData) {
    const nome = String(formData.get("nome") || "").trim();
    if (!nome) {
      toast("Nome é obrigatório", "danger");
      return;
    }
    startTransition(async () => {
      const r = await salvarClienteAction({
        nome,
        telefone: String(formData.get("telefone") || ""),
        email: String(formData.get("email") || ""),
        endereco: String(formData.get("endereco") || ""),
        cidade: String(formData.get("cidade") || ""),
      });
      if (!r.ok) {
        toast(r.error, "danger");
        return;
      }
      setClientes((atual) => [...atual, { id: r.data, nome, telefone: String(formData.get("telefone") || "") }]);
      setClienteId(r.data);
      setMostrarNovoCliente(false);
      toast("Cliente cadastrado!");
    });
  }

  function salvarOrcamento() {
    if (!clienteId) {
      toast("Selecione um cliente", "danger");
      return;
    }
    const clienteNome = clientes.find((c) => c.id === clienteId)?.nome || "";
    const itensValidos = itens.filter((it) => it.materialDesc);
    if (itensValidos.length === 0) {
      toast("Adicione pelo menos um item com material selecionado", "danger");
      return;
    }

    startTransition(async () => {
      const r = await salvarOrcamentoAction({
        id: orcamento?.id || null,
        clienteId,
        clienteNome,
        status,
        observacoes,
        validade,
        frete: frete || 0,
        descontoPct: descontoPct || 0,
        itens: itensValidos.map((it) => ({
          ambiente: it.ambiente,
          tipoPecaNome: it.tipoPecaNome,
          tipoServicoNome: it.tipoServicoNome,
          materialTipo: it.materialTipo,
          materialDesc: it.materialDesc,
          comprimento: it.comprimento,
          largura: it.largura,
          profundidade: it.profundidade,
          quantidade: it.quantidade,
          precoM2: it.precoM2,
        })),
      });
      if (!r.ok) {
        toast(r.error, "danger");
        return;
      }
      toast("Orçamento salvo com sucesso!");
      router.push("/orcamentos");
      router.refresh();
    });
  }

  const clienteSelecionado = clientes.find((c) => c.id === clienteId);
  const urlPublica = orcamento ? `${baseUrl}/orcamento/${orcamento.token}` : "";
  const linkWpp = orcamento
    ? linkWhatsappOrcamento({
        telefone: clienteSelecionado?.telefone,
        clienteNome: clienteSelecionado?.nome || "",
        numero: orcamento.numero,
        totalFormatado: moeda(totais.total),
        urlPublica,
      })
    : "";

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        {orcamento ? `Editar Orçamento #${String(orcamento.numero).padStart(4, "0")}` : "Novo Orçamento"}
      </h4>

      {orcamento?.aceiteEm && (
        <div className="alert alert-success d-flex align-items-center gap-2">
          <i className="bi bi-patch-check-fill fs-4" />
          <div>
            <strong>Aprovado digitalmente pelo cliente</strong>
            <br />
            <span className="small">
              {orcamento.aceiteNome}
              {orcamento.aceiteDocumento ? ` — doc. ${orcamento.aceiteDocumento}` : ""} em{" "}
              {new Date(orcamento.aceiteEm).toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Cliente <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <select className="form-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
                  <option value="">Selecionar cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setMostrarNovoCliente((v) => !v)}
                  title="Novo cliente"
                >
                  <i className="bi bi-person-plus" />
                </button>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Validade do orçamento</label>
              <input type="date" className="form-control" value={validade} onChange={(e) => setValidade(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {["aberto", "aprovado", "recusado", "executado"].map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {mostrarNovoCliente && (
              <div className="col-12">
                <div className="card bg-light border-0">
                  <div className="card-body">
                    <div className="fw-bold mb-2">Novo cliente rápido</div>
                    <form action={salvarNovoCliente}>
                      <div className="row g-2">
                        <div className="col-md-3">
                          <input className="form-control" name="nome" placeholder="Nome *" required />
                        </div>
                        <div className="col-md-3">
                          <input className="form-control" name="telefone" placeholder="Telefone" />
                        </div>
                        <div className="col-md-3">
                          <input className="form-control" name="email" type="email" placeholder="Email" />
                        </div>
                        <div className="col-md-3">
                          <input className="form-control" name="endereco" placeholder="Endereço" />
                        </div>
                        <div className="col-md-3">
                          <input className="form-control" name="cidade" placeholder="Cidade/UF" />
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                          <button className="btn btn-primary" type="submit" disabled={pending}>
                            Salvar cliente
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="col-12">
              <label className="form-label fw-semibold">Observações</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Observações para o cliente..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 fw-bold">Itens do Orçamento</h6>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={adicionarItem}>
              <i className="bi bi-plus-lg me-1" />
              Adicionar Item
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 110 }}>Ambiente</th>
                  <th>Tipo de Peça</th>
                  <th>Tipo de Serviço</th>
                  <th>Material</th>
                  <th style={{ width: 90 }}>Comp. (m)</th>
                  <th style={{ width: 90 }}>Larg. (m)</th>
                  <th style={{ width: 90 }}>Prof. (m)</th>
                  <th style={{ width: 70 }}>Qtd</th>
                  <th style={{ width: 110 }}>Área/Vol.</th>
                  <th style={{ width: 110 }}>Valor</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {itensCalc.map((it) => (
                  <tr key={it.key}>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        placeholder="opcional"
                        value={it.ambiente}
                        onChange={(e) => atualizarItem(it.key, "ambiente", e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={it.tipoPecaNome}
                        onChange={(e) => atualizarItem(it.key, "tipoPecaNome", e.target.value)}
                      >
                        <option value="">Selecionar...</option>
                        {tiposPeca.map((t) => (
                          <option key={t.id} value={t.nome}>
                            {t.nome}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={it.tipoServicoNome}
                        onChange={(e) => atualizarItem(it.key, "tipoServicoNome", e.target.value)}
                      >
                        <option value="">Selecionar...</option>
                        {tiposServico.map((t) => (
                          <option key={t.id} value={t.nome}>
                            {t.nome}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={it.materialDesc}
                        onChange={(e) => selecionarMaterial(it.key, e.target.value)}
                      >
                        <option value="">Selecionar...</option>
                        {materiais.map((m) => (
                          <option key={m.id} value={m.descricao}>
                            {m.descricao} — R${m.precoM2}/m²
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control form-control-sm"
                        value={it.comprimento}
                        onChange={(e) => atualizarItem(it.key, "comprimento", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control form-control-sm"
                        value={it.largura}
                        onChange={(e) => atualizarItem(it.key, "largura", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="opcional"
                        className="form-control form-control-sm"
                        value={it.profundidade}
                        onChange={(e) => atualizarItem(it.key, "profundidade", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        className="form-control form-control-sm"
                        value={it.quantidade}
                        onChange={(e) => atualizarItem(it.key, "quantidade", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        readOnly
                        className="form-control form-control-sm bg-light"
                        value={`${numeroPt(it.area, 4, 4)} ${it.temProf ? "m³" : "m²"}`}
                      />
                    </td>
                    <td>
                      <input readOnly className="form-control form-control-sm bg-light fw-bold" value={moeda(it.valor)} />
                    </td>
                    <td>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removerItem(it.key)}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-light">
                  <td colSpan={9} className="text-end fw-bold">
                    SUBTOTAL ITENS
                  </td>
                  <td className="fw-bold">{moeda(totais.subtotalItens)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="row g-3 mb-3 mt-2">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Frete (R$)</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={frete}
                onChange={(e) => setFrete(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Desconto (%)</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                min="0"
                max="100"
                placeholder="0"
                value={descontoPct}
                onChange={(e) => setDescontoPct(e.target.value)}
              />
            </div>
            <div className="col-md-4 d-flex flex-column justify-content-end">
              <label className="form-label fw-semibold mb-1">Total Geral</label>
              <div className="fw-bold text-danger fs-5">{moeda(totais.total)}</div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 justify-content-end mt-3">
            <button type="button" className="btn btn-outline-secondary" onClick={() => router.push("/orcamentos")}>
              <i className="bi bi-x-lg me-1" />
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={salvarOrcamento} disabled={pending}>
              <i className="bi bi-save me-1" />
              Salvar Orçamento
            </button>
            {orcamento && (
              <>
                <a
                  className="btn btn-outline-success"
                  href={`/api/pdf/orcamento/${orcamento.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="bi bi-file-pdf me-1" />
                  PDF do orçamento
                </a>
                <a className="btn btn-outline-dark" href={`/api/pdf/romaneio/${orcamento.id}`} target="_blank" rel="noreferrer">
                  <i className="bi bi-rulers me-1" />
                  Lista de corte
                </a>
                <a className="btn btn-success" href={linkWpp} target="_blank" rel="noreferrer">
                  <i className="bi bi-whatsapp me-1" />
                  WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
