import { getTiposServico } from "@/lib/data/tipos";
import TiposServicoClient from "./tipos-servico-client";

export const dynamic = "force-dynamic";

export default async function TiposServicoPage() {
  const tipos = await getTiposServico();
  return <TiposServicoClient initial={tipos} />;
}
