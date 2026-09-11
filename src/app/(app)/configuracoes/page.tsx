import { getConfig } from "@/lib/data/config";
import ConfiguracoesClient from "./configuracoes-client";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const config = await getConfig();
  return <ConfiguracoesClient config={config} />;
}
