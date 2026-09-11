// ============================================================
//  exportar-dados.gs
//  Cole este arquivo TEMPORARIAMENTE no projeto antigo do Apps Script
//  (o mesmo que tem db.gs, Code.gs etc.), rode a função
//  `exportarDadosParaMigracao` uma vez pelo editor (▶ Executar) e depois
//  pode apagar este arquivo — ele só serve para tirar uma "foto" dos
//  dados atuais em JSON, para importar no banco novo (Neon).
//
//  O arquivo gerado fica no Google Drive, na mesma pasta do sistema,
//  com o nome "marmoraria-export.json". Baixe-o e coloque em
//  scripts/dados-exportados.json neste projeto (marmoraria-web).
// ============================================================

function exportarDadosParaMigracao() {
  const dados = {
    config: getConfig(),
    clientes: getClientesTodos(),
    materiais: sheetToObjects(getSheet(SHEET_MATERIAIS), COLS.Materiais),
    tiposPeca: sheetToObjects(getSheet(SHEET_TIPOS_PECA), COLS.TiposPeca),
    tiposServico: sheetToObjects(getSheet(SHEET_TIPOS_SERVICO), COLS.TiposServico),
    fornecedores: typeof SHEET_FORNECEDORES !== 'undefined'
      ? sheetToObjects(getSheet(SHEET_FORNECEDORES), COLS.Fornecedores) : [],
    contasPagar: typeof SHEET_CONTAS_PAGAR !== 'undefined'
      ? sheetToObjects(getSheet(SHEET_CONTAS_PAGAR), COLS.ContasPagar) : [],
    orcamentos: getOrcamentosCompletos(),
  };

  const json = JSON.stringify(dados, null, 2);
  const pasta = DriveApp.getFolderById(FOLDER_ID);
  const existentes = pasta.getFilesByName('marmoraria-export.json');
  while (existentes.hasNext()) existentes.next().setTrashed(true);
  const arquivo = pasta.createFile('marmoraria-export.json', json, MimeType.PLAIN_TEXT);

  Logger.log('Exportado! Baixe o arquivo aqui: ' + arquivo.getUrl());
  Logger.log('Ou pelo Drive: pasta "' + pasta.getName() + '" -> marmoraria-export.json');
  return arquivo.getUrl();
}

function getClientesTodos() {
  return sheetToObjects(getSheet(SHEET_CLIENTES), COLS.Clientes);
}

// Junta cada orçamento com seus itens e parcelas (o import do lado novo
// espera esse formato aninhado).
function getOrcamentosCompletos() {
  const orcamentos = sheetToObjects(getSheet(SHEET_ORCAMENTOS), COLS.Orcamentos);
  const todosItens = sheetToObjects(getSheet(SHEET_ITENS), COLS.ItensOrcamento);
  const todasParcelas = typeof SHEET_PARCELAS !== 'undefined'
    ? sheetToObjects(getSheet(SHEET_PARCELAS), COLS.ParcelasOrcamento) : [];

  return orcamentos.map(function (orc) {
    orc.itens = todosItens.filter(function (i) { return String(i.orcamentoId) === String(orc.id); });
    orc.parcelas_detalhe = todasParcelas.filter(function (p) { return String(p.orcamentoId) === String(orc.id); });
    return orc;
  });
}
