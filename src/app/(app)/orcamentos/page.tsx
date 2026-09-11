import { getOrcamentos } from "@/lib/data/orcamentos";
import { getClientes } from "@/lib/data/clientes";
import OrcamentosClient from "./orcamentos-client";

export const dynamic = "force-dynamic";

export default async function OrcamentosPage() {
  const [orcamentos, clientes] = await Promise.all([getOrcamentos(), getClientes()]);
  const mapaTelefone = new Map(clientes.map((c) => [c.id, c.telefone]));

  const linhas = [...orcamentos]
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .map((o) => ({
      id: o.id,
      numero: o.numero,
      clienteNome: o.clienteNome,
      criadoEm: o.criadoEm,
      validade: o.validade,
      total: o.total,
      status: o.status,
      token: o.token,
      aceiteEm: o.aceiteEm,
      telefoneCliente: mapaTelefone.get(o.clienteId || "") || null,
    }));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return <OrcamentosClient initial={linhas} baseUrl={baseUrl} />;
}
