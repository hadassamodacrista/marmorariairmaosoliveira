import { getContasPagar } from "@/lib/data/contasPagar";
import { getFornecedores } from "@/lib/data/fornecedores";
import ContasPagarClient from "./contas-pagar-client";

export const dynamic = "force-dynamic";

export default async function ContasPagarPage() {
  const [contas, fornecedores] = await Promise.all([getContasPagar(), getFornecedores()]);
  return <ContasPagarClient initial={contas} fornecedores={fornecedores} />;
}
