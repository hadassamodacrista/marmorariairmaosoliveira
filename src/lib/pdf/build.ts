import "server-only";
import { calcularAreaItem, calcularValorItem, calcularTotais, num } from "@/lib/calc";
import { dataBR, dataHoraBR } from "@/lib/format";
import type { ConfigMap } from "@/lib/data/config";
import type { OrcamentoPdfProps } from "./OrcamentoDocument";
import type { RomaneioPdfProps } from "./RomaneioDocument";

// Mesmo shape retornado por getOrcamento()/getOrcamentoPorToken() em
// src/lib/data/orcamentos.ts (orçamento + itens + cliente).
type OrcamentoComItens = {
  numero: number;
  clienteNome: string | null;
  criadoEm: Date | string;
  validade: string | null;
  observacoes: string | null;
  frete: string;
  descontoPct: string;
  total: string;
  aceiteEm: Date | string | null;
  aceiteNome: string | null;
  aceiteDocumento: string | null;
  cliente: { telefone: string | null; email: string | null; endereco: string | null; cidade: string | null } | null;
  itens: {
    ambiente: string | null;
    tipoPecaNome: string | null;
    tipoServicoNome: string | null;
    materialDesc: string | null;
    comprimento: string;
    largura: string;
    profundidade: string;
    quantidade: string;
    precoM2: string;
  }[];
};

function itensCalculados(orc: OrcamentoComItens) {
  return orc.itens.map((i) => {
    const base = {
      comprimento: num(i.comprimento),
      largura: num(i.largura),
      profundidade: num(i.profundidade),
      quantidade: num(i.quantidade) || 1,
      precoM2: num(i.precoM2),
    };
    return {
      ambiente: i.ambiente || "—",
      tipoPecaNome: i.tipoPecaNome || "—",
      tipoServicoNome: i.tipoServicoNome || "—",
      materialDesc: i.materialDesc || "—",
      comprimento: base.comprimento,
      largura: base.largura,
      profundidade: base.profundidade,
      quantidade: base.quantidade,
      precoM2: base.precoM2,
      areaM2: calcularAreaItem(base),
      valorItem: calcularValorItem(base),
    };
  });
}

export function montarPropsOrcamentoPdf(orc: OrcamentoComItens, config: ConfigMap, logoDataUri?: string): OrcamentoPdfProps {
  const itens = itensCalculados(orc);
  const totais = calcularTotais({
    itens: itens.map((i) => ({ comprimento: i.comprimento, largura: i.largura, profundidade: i.profundidade, quantidade: i.quantidade, precoM2: i.precoM2 })),
    frete: num(orc.frete),
    descontoPct: num(orc.descontoPct),
  });
  const totalSalvo = num(orc.total);

  return {
    logoDataUri,
    empresaNome: config.empresa_nome || "Marmoraria",
    empresaEndereco: config.empresa_endereco || "",
    empresaTel: config.empresa_tel || "",
    empresaEmail: config.empresa_email || "",
    empresaCnpj: config.empresa_cnpj || "",
    numero: orc.numero,
    clienteNome: orc.clienteNome || "—",
    clienteTelefone: orc.cliente?.telefone || "",
    clienteEmail: orc.cliente?.email || "",
    clienteEndereco: orc.cliente?.endereco || "",
    clienteCidade: orc.cliente?.cidade || "",
    criadoEmFormatado: dataBR(orc.criadoEm),
    validadeFormatada: orc.validade ? dataBR(orc.validade) : "",
    itens,
    subtotalItens: totais.subtotalItens,
    frete: totais.frete,
    descontoPct: totais.descontoPct,
    descontoValor: totais.descontoValor,
    total: totalSalvo || totais.total,
    observacoes: orc.observacoes || config.orcamento_obs || "",
    aceite: orc.aceiteEm
      ? { nome: orc.aceiteNome || "", documento: orc.aceiteDocumento || "", dataHoraFormatada: dataHoraBR(orc.aceiteEm) }
      : null,
  };
}

export function montarPropsRomaneio(orc: OrcamentoComItens): RomaneioPdfProps {
  const itens = itensCalculados(orc);
  return {
    numero: orc.numero,
    clienteNome: orc.clienteNome || "—",
    clienteEndereco: orc.cliente?.endereco || "",
    clienteCidade: orc.cliente?.cidade || "",
    dataFormatada: dataBR(orc.criadoEm),
    itens: itens.map((i) => ({
      ambiente: i.ambiente,
      tipoPecaNome: i.tipoPecaNome,
      tipoServicoNome: i.tipoServicoNome,
      materialDesc: i.materialDesc,
      comprimento: i.comprimento,
      largura: i.largura,
      profundidade: i.profundidade,
      quantidade: i.quantidade,
      areaM2: i.areaM2,
    })),
    observacoes: orc.observacoes || "",
  };
}

/** Busca a logo (se configurada) e devolve como data URI, sem derrubar o PDF se falhar. */
export async function buscarLogoDataUri(url: string | undefined): Promise<string | undefined> {
  if (!url) return undefined;
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const tipo = res.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${tipo};base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}
