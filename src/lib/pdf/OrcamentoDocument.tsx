import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { PDF_COR_TEXTO, PDF_COR_DESTAQUE, PDF_COR_ESCURA, PDF_MARGEM } from "./theme";

export type ItemPdf = {
  ambiente: string;
  tipoPecaNome: string;
  tipoServicoNome: string;
  materialDesc: string;
  comprimento: number;
  largura: number;
  profundidade: number;
  quantidade: number;
  precoM2: number;
  areaM2: number;
  valorItem: number;
};

export type OrcamentoPdfProps = {
  logoDataUri?: string;
  empresaNome: string;
  empresaEndereco?: string;
  empresaTel?: string;
  empresaEmail?: string;
  empresaCnpj?: string;
  numero: number;
  clienteNome: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  clienteEndereco?: string;
  clienteCidade?: string;
  criadoEmFormatado: string;
  validadeFormatada?: string;
  itens: ItemPdf[];
  subtotalItens: number;
  frete: number;
  descontoPct: number;
  descontoValor: number;
  total: number;
  observacoes?: string;
  aceite?: { nome: string; documento?: string; dataHoraFormatada: string } | null;
};

const s = StyleSheet.create({
  page: { padding: PDF_MARGEM, fontSize: 9, color: PDF_COR_TEXTO, fontFamily: "Helvetica" },
  logo: { width: 90, height: 60, objectFit: "contain", alignSelf: "center", marginBottom: 6 },
  empresaNome: { fontSize: 18, fontWeight: 700, color: PDF_COR_ESCURA, textAlign: "center" },
  empresaInfo: { fontSize: 8.5, color: "#555555", textAlign: "center", marginTop: 4, lineHeight: 1.4 },
  hr: { borderBottomWidth: 1, borderBottomColor: "#cccccc", marginVertical: 8 },
  titulo: { fontSize: 13, fontWeight: 700, color: PDF_COR_DESTAQUE, textAlign: "center", marginBottom: 6 },
  campoLinha: { flexDirection: "row", marginBottom: 2 },
  campoLabel: { fontWeight: 700, fontSize: 9 },
  campoValor: { fontSize: 9 },
  tabela: { marginTop: 4, borderWidth: 1, borderColor: "#dddddd" },
  linhaHeader: { flexDirection: "row", backgroundColor: PDF_COR_ESCURA },
  celulaHeader: { color: "#ffffff", fontSize: 7.5, fontWeight: 700, padding: 3, borderRightWidth: 1, borderRightColor: "#33334d" },
  linha: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#eeeeee" },
  linhaPar: { backgroundColor: "#f7f7f9" },
  celula: { fontSize: 7.5, padding: 3, borderRightWidth: 1, borderRightColor: "#eeeeee" },
  celulaValor: { fontSize: 7.5, padding: 3, fontWeight: 700 },
  totaisBox: { marginTop: 10 },
  totalLinha: { fontSize: 9, marginBottom: 2 },
  totalGeral: { fontSize: 14, fontWeight: 700, color: PDF_COR_DESTAQUE, marginTop: 4 },
  obsTitulo: { fontSize: 10, fontWeight: 700, color: PDF_COR_DESTAQUE, marginBottom: 2 },
  obsTexto: { fontSize: 9, color: PDF_COR_TEXTO },
  aceite: { marginTop: 10, padding: 8, borderWidth: 1, borderStyle: "dashed", borderColor: "#b7e0c1", textAlign: "center" },
  aceiteTexto: { fontSize: 9, fontWeight: 700, color: "#14612e" },
  rodape: { marginTop: 16, textAlign: "center", fontSize: 9, color: "#555555" },
});

const COLS = [
  { w: "9.4%" }, // Ambiente
  { w: "9.4%" }, // Peça
  { w: "12.3%" }, // Serviço
  { w: "19.2%" }, // Material
  { w: "11.5%" }, // Dim
  { w: "5.1%" }, // Qtd
  { w: "9.4%" }, // Área
  { w: "11.5%" }, // Valor unit
  { w: "12.3%" }, // Valor
];

function moeda(v: number) {
  return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function numeroPt(v: number, casas = 2) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: Math.max(casas, 4) });
}

export default function OrcamentoDocument(p: OrcamentoPdfProps) {
  const temVolume = p.itens.some((i) => i.profundidade > 0);
  const rotuloUnit = temVolume ? "Valor unit." : "Valor m²";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {p.logoDataUri && <Image src={p.logoDataUri} style={s.logo} />}
        <Text style={s.empresaNome}>{p.empresaNome}</Text>
        <Text style={s.empresaInfo}>
          {[p.empresaEndereco, [p.empresaTel, p.empresaEmail].filter(Boolean).join("  |  "), p.empresaCnpj ? "CNPJ: " + p.empresaCnpj : ""]
            .filter(Boolean)
            .join("\n")}
        </Text>
        <View style={s.hr} />

        <Text style={s.titulo}>ORÇAMENTO N° {String(p.numero).padStart(4, "0")}</Text>

        <View style={s.campoLinha}>
          <Text style={s.campoLabel}>Nome: </Text>
          <Text style={s.campoValor}>{p.clienteNome}</Text>
        </View>
        <View style={s.campoLinha}>
          <Text style={s.campoLabel}>Telefone: </Text>
          <Text style={s.campoValor}>{p.clienteTelefone || "—"}</Text>
        </View>
        <View style={s.campoLinha}>
          <Text style={s.campoLabel}>Email: </Text>
          <Text style={s.campoValor}>{p.clienteEmail || "—"}</Text>
        </View>
        <View style={s.campoLinha}>
          <Text style={s.campoLabel}>Endereço: </Text>
          <Text style={s.campoValor}>{[p.clienteEndereco, p.clienteCidade].filter(Boolean).join(" — ") || "—"}</Text>
        </View>
        <View style={s.campoLinha}>
          <Text style={s.campoLabel}>Data: </Text>
          <Text style={s.campoValor}>{p.criadoEmFormatado}</Text>
        </View>
        <View style={s.campoLinha}>
          <Text style={s.campoLabel}>Validade: </Text>
          <Text style={s.campoValor}>{p.validadeFormatada || "—"}</Text>
        </View>

        <View style={s.hr} />

        <View style={s.tabela}>
          <View style={s.linhaHeader}>
            {["Ambiente", "Peça", "Serviço", "Material", "Dim. (m)", "Qtd", "Área", rotuloUnit, "Valor"].map((h, i) => (
              <Text key={i} style={[s.celulaHeader, { width: COLS[i].w }]}>
                {h}
              </Text>
            ))}
          </View>
          {p.itens.map((item, idx) => {
            const temProf = item.profundidade > 0;
            const unidade = temProf ? "m³" : "m²";
            const dim = temProf
              ? `${numeroPt(item.comprimento)} × ${numeroPt(item.largura)} × ${numeroPt(item.profundidade)}`
              : `${numeroPt(item.comprimento)} × ${numeroPt(item.largura)}`;
            const valores = [
              item.ambiente || "—",
              item.tipoPecaNome || "—",
              item.tipoServicoNome || "—",
              item.materialDesc || "—",
              dim,
              String(item.quantidade),
              `${numeroPt(item.areaM2, 4)} ${unidade}`,
              moeda(item.precoM2),
              moeda(item.valorItem),
            ];
            return (
              <View key={idx} style={[s.linha, idx % 2 === 0 ? s.linhaPar : {}]}>
                {valores.map((v, i) => (
                  <Text key={i} style={[i === 8 ? s.celulaValor : s.celula, { width: COLS[i].w }]}>
                    {v}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>

        <View style={s.totaisBox}>
          <Text style={s.totalLinha}>Subtotal dos itens:  {moeda(p.subtotalItens)}</Text>
          {p.frete > 0 && <Text style={s.totalLinha}>Frete:  {moeda(p.frete)}</Text>}
          {p.descontoPct > 0 && (
            <Text style={s.totalLinha}>
              Desconto ({numeroPt(p.descontoPct, 0)}%):  - {moeda(p.descontoValor)}
            </Text>
          )}
          <Text style={s.totalGeral}>TOTAL GERAL: {moeda(p.total)}</Text>
        </View>

        {p.observacoes && (
          <>
            <View style={s.hr} />
            <Text style={s.obsTitulo}>OBSERVAÇÕES</Text>
            <Text style={s.obsTexto}>{p.observacoes}</Text>
          </>
        )}

        {p.aceite && (
          <View style={s.aceite}>
            <Text style={s.aceiteTexto}>ORÇAMENTO APROVADO DIGITALMENTE PELO CLIENTE</Text>
            <Text style={s.aceiteTexto}>
              {p.aceite.nome}
              {p.aceite.documento ? ` — ${p.aceite.documento}` : ""} em {p.aceite.dataHoraFormatada}
            </Text>
          </View>
        )}

        <View style={s.hr} />
        <Text style={s.rodape}>
          {p.empresaNome}
          {"\n"}
          {p.empresaTel}
        </Text>
      </Page>
    </Document>
  );
}
