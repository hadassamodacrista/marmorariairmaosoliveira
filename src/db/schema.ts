import {
  pgTable,
  pgSequence,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// Numeração dos orçamentos: nextval() é atômico numa única instrução SQL,
// então dois orçamentos criados ao mesmo tempo nunca recebem o mesmo número
// (o problema que existia na versão em planilha).
export const orcamentoNumeroSeq = pgSequence("orcamento_numero_seq", {
  startWith: 1,
  increment: 1,
});

export const config = pgTable("config", {
  chave: text("chave").primaryKey(),
  valor: text("valor"),
});

export const clientes = pgTable("clientes", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone"),
  email: text("email"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
});

export const materiais = pgTable("materiais", {
  id: text("id").primaryKey(),
  tipo: text("tipo"),
  descricao: text("descricao").notNull(),
  precoM2: numeric("preco_m2", { precision: 12, scale: 2 }).notNull(),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
});

export const tiposPeca = pgTable("tipos_peca", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  unidade: text("unidade").notNull().default("m²"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
});

export const tiposServico = pgTable("tipos_servico", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
});

export const fornecedores = pgTable("fornecedores", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  tipo: text("tipo").notNull().default("outro"),
  documento: text("documento"),
  telefone: text("telefone"),
  email: text("email"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
});

export const orcamentos = pgTable("orcamentos", {
  id: text("id").primaryKey(),
  numero: integer("numero").notNull(),
  clienteId: text("cliente_id"),
  clienteNome: text("cliente_nome"),
  status: text("status").notNull().default("aberto"), // aberto | aprovado | recusado | executado
  observacoes: text("observacoes"),
  validade: text("validade"), // 'YYYY-MM-DD'
  token: text("token").notNull().unique(),
  pdfId: text("pdf_id"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  subtotalItens: numeric("subtotal_itens", { precision: 12, scale: 2 }).notNull().default("0"),
  maoDeObra: numeric("mao_de_obra", { precision: 12, scale: 2 }).notNull().default("0"),
  frete: numeric("frete", { precision: 12, scale: 2 }).notNull().default("0"),
  descontoPct: numeric("desconto_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  formaPagamento: text("forma_pagamento"),
  parcelado: boolean("parcelado").notNull().default(false),
  parcelas: integer("parcelas").notNull().default(1),
  valorPago: numeric("valor_pago", { precision: 12, scale: 2 }).notNull().default("0"),
  saldoRestante: numeric("saldo_restante", { precision: 12, scale: 2 }).notNull().default("0"),
  financeiroAtualizadoEm: timestamp("financeiro_atualizado_em", { withTimezone: true }),
  dataPagamento: text("data_pagamento"),
  aceiteEm: timestamp("aceite_em", { withTimezone: true }),
  aceiteNome: text("aceite_nome"),
  aceiteDocumento: text("aceite_documento"),
  aceiteIp: text("aceite_ip"),
  aceiteUserAgent: text("aceite_user_agent"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).defaultNow().notNull(),
});

export const itensOrcamento = pgTable("itens_orcamento", {
  id: text("id").primaryKey(),
  orcamentoId: text("orcamento_id").notNull(),
  ordem: integer("ordem").notNull().default(0),
  ambiente: text("ambiente"),
  tipoPecaNome: text("tipo_peca_nome"),
  tipoServicoNome: text("tipo_servico_nome"),
  materialTipo: text("material_tipo"),
  materialDesc: text("material_desc"),
  comprimento: numeric("comprimento", { precision: 10, scale: 4 }).notNull().default("0"),
  largura: numeric("largura", { precision: 10, scale: 4 }).notNull().default("0"),
  profundidade: numeric("profundidade", { precision: 10, scale: 4 }).notNull().default("0"),
  quantidade: numeric("quantidade", { precision: 10, scale: 2 }).notNull().default("1"),
  precoM2: numeric("preco_m2", { precision: 12, scale: 2 }).notNull().default("0"),
  areaM2: numeric("area_m2", { precision: 12, scale: 4 }).notNull().default("0"),
  valorItem: numeric("valor_item", { precision: 12, scale: 2 }).notNull().default("0"),
  observacao: text("observacao"),
});

export const parcelasOrcamento = pgTable("parcelas_orcamento", {
  id: text("id").primaryKey(),
  orcamentoId: text("orcamento_id").notNull(),
  numero: integer("numero").notNull(),
  dataPagamento: text("data_pagamento"),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull().default("0"),
  formaPagamento: text("forma_pagamento"),
  status: text("status").notNull().default("pendente"), // pendente | paga
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).defaultNow().notNull(),
});

export const aceitesOrcamento = pgTable("aceites_orcamento", {
  id: text("id").primaryKey(),
  orcamentoId: text("orcamento_id").notNull(),
  numero: integer("numero"),
  evento: text("evento").notNull(), // aceitou | recusou
  nome: text("nome"),
  documento: text("documento"),
  observacao: text("observacao"),
  userAgent: text("user_agent"),
  ip: text("ip"),
  em: timestamp("em", { withTimezone: true }).defaultNow().notNull(),
});

export const contasPagar = pgTable("contas_pagar", {
  id: text("id").primaryKey(),
  fornecedorId: text("fornecedor_id"),
  fornecedorNome: text("fornecedor_nome"),
  descricao: text("descricao").notNull(),
  categoria: text("categoria").notNull().default("outro"),
  orcamentoId: text("orcamento_id"),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
  emitidoEm: text("emitido_em"),
  venceEm: text("vence_em"),
  pagoEm: text("pago_em"),
  status: text("status").notNull().default("pendente"), // pendente | pago | cancelado
  formaPagamento: text("forma_pagamento"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).defaultNow().notNull(),
});
