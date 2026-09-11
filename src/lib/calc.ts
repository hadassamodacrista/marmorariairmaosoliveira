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
