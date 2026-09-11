import { getOrcamentosFinanceiro } from "@/lib/data/financeiro";
import FinanceiroReceberClient from "./financeiro-receber-client";

export const dynamic = "force-dynamic";

export default async function FinanceiroReceberPage() {
  const orcamentos = await getOrcamentosFinanceiro();
  return <FinanceiroReceberClient initial={orcamentos} />;
}
