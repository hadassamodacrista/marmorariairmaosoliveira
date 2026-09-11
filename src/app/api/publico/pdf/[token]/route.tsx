import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getOrcamentoPorToken } from "@/lib/data/orcamentos";
import { getConfig } from "@/lib/data/config";
import { montarPropsOrcamentoPdf, buscarLogoDataUri } from "@/lib/pdf/build";
import OrcamentoDocument from "@/lib/pdf/OrcamentoDocument";

export const runtime = "nodejs";

// Rota pública (sem login) — o mesmo PDF do orçamento, acessível pelo token
// do link enviado ao cliente. Fica na lista de rotas públicas do middleware.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [orc, config] = await Promise.all([getOrcamentoPorToken(token), getConfig()]);
  if (!orc) return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });

  const logoDataUri = await buscarLogoDataUri(config.empresa_logo_url);
  const props = montarPropsOrcamentoPdf(orc, config, logoDataUri);
  const buffer = await renderToBuffer(<OrcamentoDocument {...props} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orcamento-${String(orc.numero).padStart(4, "0")}.pdf"`,
    },
  });
}
