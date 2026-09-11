export const FORMAS_PAGAMENTO: [string, string][] = [
  ["", "Não informado"],
  ["pix", "PIX"],
  ["dinheiro", "Dinheiro"],
  ["cartao", "Cartão"],
  ["transferencia", "Transferência"],
  ["boleto", "Boleto"],
  ["outro", "Outro"],
];

export function rotuloFormaPagamento(forma: string | null | undefined): string {
  return FORMAS_PAGAMENTO.find((f) => f[0] === forma)?.[1] || "Não informado";
}

export const CATEGORIAS_PAGAR_UI: [string, string][] = [
  ["chapa", "Chapa / mármore"],
  ["insumo", "Insumo"],
  ["servico_terceiro", "Serviço de terceiro"],
  ["despesa_fixa", "Despesa fixa"],
  ["imposto", "Imposto"],
  ["frete", "Frete"],
  ["outro", "Outro"],
];

export function rotuloCategoriaPagar(categoria: string | null | undefined): string {
  return CATEGORIAS_PAGAR_UI.find((c) => c[0] === categoria)?.[1] || "Outro";
}
