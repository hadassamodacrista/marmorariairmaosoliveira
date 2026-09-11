// Mesma lógica de cálculo do sistema anterior (Apps Script), só que em
// TypeScript: área/volume por item, valor do item, e totais do orçamento.

export type ItemCalc = {
  comprimento: number;
  largura: number;
  profundidade?: number;
  quantidade: number;
  precoM2: number;
};

export function arredonda2(v: number): number {
  return Number.isFinite(v) ? Math.round((v + Number.EPSILON) * 100) / 100 : 0;
}

export function calcularAreaItem(item: ItemCalc): number {
  const { comprimento, largura, profundidade = 0, quantidade } = item;
  const base = profundidade > 0 ? comprimento * largura * profundidade : comprimento * largura;
  return Math.round(base * quantidade * 10000) / 10000;
}

export function calcularValorItem(item: ItemCalc): number {
  const area = calcularAreaItem(item);
  return arredonda2(area * (item.precoM2 || 0));
}

export function calcularTotais(opts: {
  itens: ItemCalc[];
  frete?: number;
  descontoPct?: number;
}) {
  const subtotalItens = arredonda2(opts.itens.reduce((s, i) => s + calcularValorItem(i), 0));
  const frete = opts.frete || 0;
  const descontoPct = opts.descontoPct || 0;
  const totalAntesDesc = subtotalItens + frete;
  const descontoValor = arredonda2((totalAntesDesc * descontoPct) / 100);
  const total = arredonda2(totalAntesDesc - descontoValor);
  return { subtotalItens, frete, descontoPct, descontoValor, totalAntesDesc, total };
}

export function num(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Para campos de texto livre onde a pessoa digita no formato brasileiro
 * (ex.: "11.206,58" ou "1206,58"), diferente dos campos <input type="number">
 * (que o navegador sempre entrega em "1206.58", ponto decimal, sem separador
 * de milhar). Usar num() direto nesses campos de texto livre corta o valor
 * no primeiro caractere inválido: parseFloat("11.206,58") vira 11.206, não
 * 11206.58. Use esta função em qualquer <input type="text" inputMode="decimal">
 * de valor monetário; NÃO use em campos <input type="number"> (esses já vêm
 * certos do navegador e passar por aqui quebraria "2.5" -> 25).
 */
export function parseValorBR(v: unknown): number {
  const texto = String(v ?? "").trim().replace(/\s/g, "");
  if (!texto) return 0;
  const normalizado =
    texto.includes(",") && texto.includes(".")
      ? texto.replace(/\./g, "").replace(",", ".") // "11.206,58" -> "11206.58"
      : texto.replace(",", "."); // "1206,58" -> "1206.58" ; "1206.58" seguia certo
  const n = parseFloat(normalizado);
  return Number.isFinite(n) ? n : 0;
}
