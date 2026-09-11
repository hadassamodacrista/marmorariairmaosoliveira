import { notFound } from "next/navigation";
import { getOrcamento } from "@/lib/data/orcamentos";
import { getClientes } from "@/lib/data/clientes";
import { getMateriais } from "@/lib/data/materiais";
import { getTiposPeca, getTiposServico } from "@/lib/data/tipos";
import OrcamentoForm from "../orcamento-form";

export const dynamic = "force-dynamic";

export default async function EditarOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orcamento, clientes, materiais, tiposPeca, tiposServico] = await Promise.all([
    getOrcamento(id),
    getClientes(),
    getMateriais(),
    getTiposPeca(),
    getTiposServico(),
  ]);

  if (!orcamento) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <OrcamentoForm
      clientesIniciais={clientes}
      materiais={materiais}
      tiposPeca={tiposPeca}
      tiposServico={tiposServico}
      baseUrl={baseUrl}
      orcamento={{
        id: orcamento.id,
        numero: orcamento.numero,
        token: orcamento.token,
        clienteId: orcamento.clienteId,
        status: orcamento.status,
        observacoes: orcamento.observacoes,
        validade: orcamento.validade,
        frete: orcamento.frete,
        descontoPct: orcamento.descontoPct,
        aceiteEm: orcamento.aceiteEm,
        aceiteNome: orcamento.aceiteNome,
        aceiteDocumento: orcamento.aceiteDocumento,
        itens: orcamento.itens.map((i) => ({
          ambiente: i.ambiente,
          tipoPecaNome: i.tipoPecaNome,
          tipoServicoNome: i.tipoServicoNome,
          materialDesc: i.materialDesc,
          materialTipo: i.materialTipo,
          comprimento: i.comprimento,
          largura: i.largura,
          profundidade: i.profundidade,
          quantidade: i.quantidade,
          precoM2: i.precoM2,
        })),
      }}
    />
  );
}
