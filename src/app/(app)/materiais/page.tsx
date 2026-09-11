import { getMateriais } from "@/lib/data/materiais";
import MateriaisClient from "./materiais-client";

export const dynamic = "force-dynamic";

export default async function MateriaisPage() {
  const materiais = await getMateriais();
  return <MateriaisClient initial={materiais} />;
}
