export function normalizarTelefoneWhatsapp(telefone: string | null | undefined): string {
  let d = String(telefone || "").replace(/\D/g, "");
  if (!d) return "";
  d = d.replace(/^0+/, "");
  if (d.length <= 11 && !d.startsWith("55")) d = "55" + d;
  return d;
}

export function linkWhatsappOrcamento(opts: {
  telefone: string | null | undefined;
  clienteNome: string;
  numero: number;
  totalFormatado: string;
  urlPublica: string;
}): string {
  const primeiroNome = String(opts.clienteNome || "").trim().split(/\s+/)[0] || "";
  const msg =
    `Olá ${primeiroNome}!\n\n` +
    `Segue o seu orçamento #${String(opts.numero).padStart(4, "0")} no valor de ${opts.totalFormatado}.\n\n` +
    `Acesse pelo link abaixo para visualizar, aprovar e baixar o PDF:\n${opts.urlPublica}\n\n` +
    `Qualquer dúvida, estou à disposição!`;
  const fone = normalizarTelefoneWhatsapp(opts.telefone);
  return `https://wa.me/${fone}?text=${encodeURIComponent(msg)}`;
}
