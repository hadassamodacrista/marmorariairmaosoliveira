import { getClientes } from "@/lib/data/clientes";
import { getMateriais } from "@/lib/data/materiais";
import { getTiposPeca, getTiposServico } from "@/lib/data/tipos";
import OrcamentoForm from "../orcamento-form";

export const dynamic = "force-dynamic";

export default async function NovoOrcamentoPage() {
  const [clientes, materiais, tiposPeca, tiposServico] = await Promise.all([
    getClientes(),
    getMateriais(),
    getTiposPeca(),
    getTiposServico(),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <OrcamentoForm
      clientesIniciais={clientes}
      materiais={materiais}
      tiposPeca={tiposPeca}
      tiposServico={tiposServico}
      orcamento={null}
      baseUrl={baseUrl}
    />
  );
}
