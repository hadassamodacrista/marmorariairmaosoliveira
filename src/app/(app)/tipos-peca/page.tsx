import { getTiposPeca } from "@/lib/data/tipos";
import TiposPecaClient from "./tipos-peca-client";

export const dynamic = "force-dynamic";

export default async function TiposPecaPage() {
  const tipos = await getTiposPeca();
  return <TiposPecaClient initial={tipos} />;
}
