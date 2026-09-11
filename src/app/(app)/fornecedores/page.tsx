import { getFornecedores } from "@/lib/data/fornecedores";
import FornecedoresClient from "./fornecedores-client";

export const dynamic = "force-dynamic";

export default async function FornecedoresPage() {
  const fornecedores = await getFornecedores();
  return <FornecedoresClient initial={fornecedores} />;
}
