export function moeda(v: unknown): string {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  const num = Number.isFinite(n) ? Math.round(((n as number) + Number.EPSILON) * 100) / 100 : 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function numeroPt(v: unknown, casasMin = 2, casasMax = 4): string {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  const num = Number.isFinite(n) ? (n as number) : 0;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: casasMin, maximumFractionDigits: casasMax });
}

/** Aceita 'YYYY-MM-DD', ISO completo ou Date; devolve 'YYYY-MM-DD' ou ''. */
export function paraISODate(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const texto = String(v).trim();
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const d = new Date(texto);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY' */
export function dataBR(v: unknown): string {
  const iso = paraISODate(v);
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

export function dataHoraBR(v: unknown): string {
  if (!v) return "—";
  const d = v instanceof Date ? v : new Date(String(v));
  if (isNaN(d.getTime())) return String(v);
  return (
    d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) +
    " às " +
    d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })
  );
}

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}
