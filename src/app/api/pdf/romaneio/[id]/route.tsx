import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getOrcamento } from "@/lib/data/orcamentos";
import { montarPropsRomaneio } from "@/lib/pdf/build";
import RomaneioDocument from "@/lib/pdf/RomaneioDocument";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orc = await getOrcamento(id);
  if (!orc) return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });

  const props = montarPropsRomaneio(orc);
  const buffer = await renderToBuffer(<RomaneioDocument {...props} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="romaneio-${String(orc.numero).padStart(4, "0")}.pdf"`,
    },
  });
}
