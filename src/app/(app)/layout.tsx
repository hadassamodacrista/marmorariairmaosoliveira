import { getConfig } from "@/lib/data/config";
import { getSessao } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [config, sessao] = await Promise.all([getConfig(), getSessao()]);

  return (
    <>
      <Sidebar empresaNome={config.empresa_nome || "Marmoraria"} />
      <div id="main">
        <Topbar email={sessao?.email || ""} />
        <div className="content">{children}</div>
      </div>
    </>
  );
}
