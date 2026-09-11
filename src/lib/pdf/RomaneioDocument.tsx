import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PDF_COR_TEXTO, PDF_COR_ESCURA, PDF_MARGEM } from "./theme";

export type ItemRomaneio = {
  ambiente: string;
  tipoPecaNome: string;
  tipoServicoNome: string;
  materialDesc: string;
  comprimento: number;
  largura: number;
  profundidade: number;
  quantidade: number;
  areaM2: number;
};

export type RomaneioPdfProps = {
  numero: number;
  clienteNome: string;
  clienteEndereco?: string;
  clienteCidade?: string;
  dataFormatada: string;
  itens: ItemRomaneio[];
  observacoes?: string;
};

const s = StyleSheet.create({
  page: { padding: PDF_MARGEM, fontSize: 9, color: PDF_COR_TEXTO, fontFamily: "Helvetica" },
  titulo: { fontSize: 16, fontWeight: 700, color: PDF_COR_ESCURA, textAlign: "center" },
  sub: { fontSize: 9, color: PDF_COR_TEXTO, textAlign: "center", marginTop: 6 },
  hr: { borderBottomWidth: 1, borderBottomColor: "#cccccc", marginVertical: 8 },
  materialTitulo: { fontSize: 11, fontWeight: 700, color: PDF_COR_ESCURA, marginTop: 10 },
  materialSub: { fontSize: 8, color: "#555555", marginBottom: 4 },
  tabela: { borderWidth: 1, borderColor: "#dddddd" },
  linhaHeader: { flexDirection: "row", backgroundColor: PDF_COR_ESCURA },
  celulaHeader: { color: "#ffffff", fontSize: 8, fontWeight: 700, padding: 3, borderRightWidth: 1, borderRightColor: "#33334d" },
  linha: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#eeeeee" },
  linhaPar: { backgroundColor: "#f7f7f9" },
  celula: { fontSize: 9, padding: 3, borderRightWidth: 1, borderRightColor: "#eeeeee" },
  celulaDestaque: { fontSize: 9, fontWeight: 700, padding: 3, borderRightWidth: 1, borderRightColor: "#eeeeee" },
  totalGeral: { fontSize: 12, fontWeight: 700, color: PDF_COR_ESCURA, textAlign: "right", marginTop: 10 },
  obsTitulo: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  assinatura: { fontSize: 9, marginTop: 20 },
});

function numeroPt(v: number, casas = 2) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: Math.max(casas, 4) });
}
function fmtInt(v: number) {
  return String(Math.round(v));
}

export default function RomaneioDocument(p: RomaneioPdfProps) {
  const temVolume = p.itens.some((i) => i.profundidade > 0);

  const cols = temVolume
    ? [{ w: "5%" }, { w: "16%" }, { w: "13%" }, { w: "16%" }, { w: "12%" }, { w: "12%" }, { w: "10%" }, { w: "8%" }, { w: "8%" }]
    : [{ w: "5%" }, { w: "18%" }, { w: "15%" }, { w: "17%" }, { w: "13%" }, { w: "13%" }, { w: "9%" }, { w: "10%" }];

  const header = temVolume
    ? ["Nº", "Ambiente", "Peça", "Serviço", "Comp (m)", "Larg (m)", "Prof (m)", "Qtd", "Área"]
    : ["Nº", "Ambiente", "Peça", "Serviço", "Comp (m)", "Larg (m)", "Qtd", "Área"];

  const grupos = new Map<string, ItemRomaneio[]>();
  for (const item of p.itens) {
    const chave = item.materialDesc || "—";
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(item);
  }

  let totalPecas = 0;
  let totalArea = 0;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.titulo}>LISTA DE CORTE / ROMANEIO</Text>
        <Text style={s.sub}>
          Orçamento #{String(p.numero).padStart(4, "0")}   ·   {p.clienteNome}   ·   {p.dataFormatada}
        </Text>
        {(p.clienteEndereco || p.clienteCidade) && (
          <Text style={s.sub}>Local da obra: {[p.clienteEndereco, p.clienteCidade].filter(Boolean).join(" — ")}</Text>
        )}
        <View style={s.hr} />

        {[...grupos.entries()].map(([material, itens]) => {
          const areaMat = itens.reduce((s2, i) => s2 + i.areaM2, 0);
          const qtdMat = itens.reduce((s2, i) => s2 + i.quantidade, 0);
          totalPecas += qtdMat;
          totalArea += areaMat;

          return (
            <View key={material} wrap={false}>
              <Text style={s.materialTitulo}>MATERIAL: {material}</Text>
              <Text style={s.materialSub}>
                {fmtInt(qtdMat)} peça(s)   ·   {numeroPt(areaMat, 2)} m² no total
              </Text>
              <View style={s.tabela}>
                <View style={s.linhaHeader}>
                  {header.map((h, i) => (
                    <Text key={i} style={[s.celulaHeader, { width: cols[i].w }]}>
                      {h}
                    </Text>
                  ))}
                </View>
                {itens.map((item, idx) => {
                  const temProf = item.profundidade > 0;
                  const unidade = temProf ? "m³" : "m²";
                  const base = [
                    String(idx + 1),
                    item.ambiente || "—",
                    item.tipoPecaNome || "—",
                    item.tipoServicoNome || "—",
                    numeroPt(item.comprimento),
                    numeroPt(item.largura),
                  ];
                  if (temVolume) base.push(temProf ? numeroPt(item.profundidade) : "—");
                  base.push(fmtInt(item.quantidade));
                  base.push(`${numeroPt(item.areaM2, 4)} ${unidade}`);
                  return (
                    <View key={idx} style={[s.linha, idx % 2 === 0 ? s.linhaPar : {}]}>
                      {base.map((v, i) => (
                        <Text key={i} style={[i === 4 || i === 5 ? s.celulaDestaque : s.celula, { width: cols[i].w }]}>
                          {v}
                        </Text>
                      ))}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={s.hr} />
        <Text style={s.totalGeral}>
          TOTAL: {fmtInt(totalPecas)} peça(s)   ·   {numeroPt(totalArea, 2)} m²
        </Text>

        {p.observacoes && (
          <>
            <View style={s.hr} />
            <Text style={s.obsTitulo}>OBSERVAÇÕES</Text>
            <Text style={{ fontSize: 9 }}>{p.observacoes}</Text>
          </>
        )}

        <Text style={s.assinatura}>Conferido por: ______________________________      Data: ____/____/______</Text>
      </Page>
    </Document>
  );
}
