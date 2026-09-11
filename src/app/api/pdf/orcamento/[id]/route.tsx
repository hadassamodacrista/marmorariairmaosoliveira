import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getOrcamento } from "@/lib/data/orcamentos";
import { getConfig } from "@/lib/data/config";
import { montarPropsOrcamentoPdf, buscarLogoDataUri } from "@/lib/pdf/build";
import OrcamentoDocument from "@/lib/pdf/OrcamentoDocument";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orc, config] = await Promise.all([getOrcamento(id), getConfig()]);
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
