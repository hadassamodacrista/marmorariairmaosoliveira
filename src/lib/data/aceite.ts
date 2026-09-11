import "server-only";
import { db, orcamentos, aceitesOrcamento } from "@/db/client";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/ids";
import { updateStatusOrcamento } from "./orcamentos";
import { dataHoraBR } from "@/lib/format";

export type AceiteInput = {
  token: string;
  acao?: "aprovar" | "recusar";
  nome: string;
  documento?: string;
  observacao?: string;
  userAgent?: string;
  ip?: string;
};

export async function registrarAceite(data: AceiteInput) {
  const nome = String(data.nome || "").trim();
  if (nome.length < 3) throw new Error("Informe seu nome completo para confirmar.");

  const evento = data.acao === "recusar" ? "recusou" : "aceitou";

  const rows = await db.select().from(orcamentos).where(eq(orcamentos.token, data.token));
  const orc = rows[0];
  if (!orc) throw new Error("Orçamento não encontrado. Confira o link recebido.");
  if (orc.aceiteEm) {
    throw new Error(`Este orçamento já foi respondido em ${dataHoraBR(orc.aceiteEm)}.`);
  }

  const agora = new Date();
  await db
    .update(orcamentos)
    .set({
      aceiteEm: agora,
      aceiteNome: nome,
      aceiteDocumento: data.documento || "",
      aceiteIp: data.ip || "",
      aceiteUserAgent: (data.userAgent || "").slice(0, 300),
    })
    .where(eq(orcamentos.id, orc.id));

  await updateStatusOrcamento(orc.id, evento === "aceitou" ? "aprovado" : "recusado");

  await db.insert(aceitesOrcamento).values({
    id: newId(),
    orcamentoId: orc.id,
    numero: orc.numero,
    evento,
    nome,
    documento: data.documento || "",
    observacao: data.observacao || "",
    userAgent: (data.userAgent || "").slice(0, 300),
    ip: data.ip || "",
    em: agora,
  });

  return { ok: true, evento, em: agora.toISOString(), nome, numero: orc.numero };
}

export async function getAceitesOrcamento(orcamentoId: string) {
  return db.select().from(aceitesOrcamento).where(eq(aceitesOrcamento.orcamentoId, orcamentoId));
}
