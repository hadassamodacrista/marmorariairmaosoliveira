# Manual de uso — Sistema de Orçamentos da Marmoraria

Este documento não tem senhas — pode compartilhar com quem for usar o
sistema no dia a dia. Os acessos ficam em `ACESSOS-E-SENHAS.md` (arquivo
separado, só pra quem administra).

**Site:** https://marmorariairmaosoliveira.vercel.app

---

## 1. Entrando no sistema

Acesse o site, informe e-mail e senha na tela de login. A sessão fica
guardada por 30 dias no navegador — não precisa logar toda vez.

## 2. Dashboard

Tela inicial, mostra um resumo:

- **Total de Orçamentos / Em Aberto / Fechados** — contagem por status
- **Fechado no mês** — soma dos orçamentos aprovados/executados criados no mês atual
- **A receber** — soma do que falta receber dos orçamentos fechados
- **A pagar em aberto** — soma das contas a pagar ainda não quitadas (fica vermelho se tiver alguma vencida)
- **Previsão** — a receber menos a pagar
- **Últimos Orçamentos** — atalho pra abrir rápido

## 3. Orçamentos

### Criar um orçamento

**Novo Orçamento** (menu lateral ou botão no topo):

1. Escolha o **cliente** (ou clique no ícone ao lado pra cadastrar um novo sem sair da tela)
2. Preencha **validade** (opcional — se não preencher, mostra em branco no PDF) e **status**
3. Em **Itens do Orçamento**, clique **Adicionar Item** para cada peça:
   - **Ambiente** (opcional, ex.: "Cozinha")
   - **Tipo de Peça** (Bancada, Tampo, Pia...)
   - **Tipo de Serviço** (opcional)
   - **Material** — a lista vem de Cadastros → Materiais, com o preço por m² já configurado
   - **Comprimento / Largura** em metros
   - **Profundidade** — só preencha se for uma peça calculada por **volume** (m³), como uma cuba. Deixando em branco, o sistema calcula por **área** (m²)
   - **Qtd** — quantidade de peças iguais
   - O sistema calcula **Área/Vol.** e **Valor** sozinho, na hora, conforme você digita
4. Preencha **Frete** e **Desconto (%)** se houver — o Total Geral atualiza ao vivo
5. **Salvar Orçamento**

### Depois de salvo

Na listagem (ou dentro do próprio orçamento) você tem:

- **✏️ Editar** — reabre o formulário
- **📄 PDF do orçamento** — gera e baixa o PDF formatado pra enviar ao cliente
- **📏 Lista de corte** — gera o PDF interno pra fábrica (comprimento e largura em colunas separadas, agrupado por material, sem preços — pra quem corta a chapa)
- **💬 WhatsApp** — abre o WhatsApp já com uma mensagem pronta e o link público do orçamento
- **🗑️ Excluir**

> **Importante:** os PDFs são gerados **na hora**, toda vez que você clica —
> não ficam salvos em nenhum lugar. Se você editar o orçamento depois, o
> próximo PDF gerado (ou o link público reaberto) já mostra os valores
> **atualizados**. Não existe uma cópia "congelada" do que foi enviado
> num momento específico — se isso for importante pro seu negócio, é só
> pedir que dá pra adicionar.

### Numeração

Cada orçamento recebe um número sequencial automático (#0001, #0002...)
que nunca se repete, mesmo se dois forem criados ao mesmo tempo.

## 4. Link público e aceite digital

O botão **WhatsApp** manda pro cliente um link parecido com
`.../orcamento/xxxxxxxx`. Nessa página, sem precisar de login, o cliente:

- Vê o orçamento formatado (mesmos dados do PDF)
- Pode **baixar o PDF** e **imprimir**
- Pode **aprovar** ou **recusar**, informando nome (obrigatório) e
  CPF/CNPJ (opcional), marcando que concorda com os valores

Ao aprovar/recusar, o sistema registra **data, hora, nome informado, IP
e navegador** do cliente, muda o status do orçamento automaticamente
(Aprovado/Recusado) e mostra um selo verde na listagem e no PDF. Depois
de respondido uma vez, não dá pra responder de novo pelo mesmo link.

## 5. Financeiro

### Contas a Receber

Lista os orçamentos com status **Aprovado** ou **Executado** (só esses
entram no financeiro). Selecione um orçamento em "Selecionar orçamento
fechado" (ou clique **Controlar** na tabela) para:

- Definir se foi **à vista** ou **parcelado** (e em quantas vezes)
- Para cada parcela: informar data prevista, valor pago e marcar
  **Paga** ou **Pendente**
- O sistema calcula sozinho quanto já foi pago e o saldo restante

### Contas a Pagar

Lançamentos de despesas (chapa, insumo, serviço de terceiro, despesa
fixa, imposto, frete, outro):

- **Nova Conta** → descrição, valor, categoria, fornecedor (ou digite um
  nome avulso), vencimento
- Contas vencidas e não pagas aparecem **em vermelho**
- Botão ✔️ marca como paga (pede a data do pagamento)
- Botão ↩️ reabre uma conta paga por engano

### Fluxo de Caixa

Junta **Contas a Receber** + **Contas a Pagar** num período (padrão:
últimos 2 meses até os próximos 3), mostrando:

- **Realizado** — o que já entrou/saiu de fato
- **Previsto** — o que ainda vai entrar/sair
- Gráfico por mês e uma lista de saídas por categoria
- Tabela com todos os lançamentos do período

Use os campos **De / Até** no topo pra mudar o período.

## 6. Cadastros

- **Clientes** — nome, telefone, email, endereço, cidade
- **Fornecedores** — nome, tipo (chapa/insumo/serviço/outro), documento, contato
- **Materiais** — tipo (ex.: Mármore, Granito), descrição/cor, preço por m². "Excluir" na verdade só desativa (some das opções novas, mas orçamentos antigos continuam mostrando o nome certo)
- **Tipos de Peça** — Bancada, Tampo, Pia... com a unidade (m², ml, un)
- **Tipos de Serviço** — nome livre (ex.: "Recorte", "Furo de cuba")

## 7. Configurações

Dados que aparecem no PDF e na página pública:

- Nome, CNPJ/CPF, telefone, email, endereço da empresa
- **URL da logo** — cole o link de uma imagem já hospedada na internet (não dá mais pra usar um arquivo do computador direto — precisa estar hospedada em algum lugar público)
- Validade padrão dos orçamentos (em dias)
- Observação padrão que aparece nos orçamentos

---

## Perguntas frequentes

**Onde ficam salvos os dados (orçamentos, clientes...)?**
Num banco de dados na nuvem (Neon), separado do site. Ver
`ACESSOS-E-SENHAS.md` pra detalhes técnicos.

**O PDF fica salvo em algum Google Drive?**
Não. O sistema atual não usa mais Google Drive — o PDF é gerado na hora
que você pede, e não fica guardado em nenhum lugar depois.

**Perdi a senha, e agora?**
Quem administra (ver `ACESSOS-E-SENHAS.md`) consegue gerar uma nova sem
precisar de "esqueci minha senha" — é só trocar a variável de ambiente na
Vercel.

**Dá pra ter mais de um usuário/login?**
Hoje é um login só. Dá pra evoluir pra múltiplos usuários com permissões
diferentes (ex.: vendedor não vê financeiro) se precisar no futuro.

**Como faço backup dos dados?**
Os dados já ficam salvos automaticamente no Neon (banco na nuvem, com
backup próprio do serviço). Se quiser uma cópia extra, o Neon permite
exportar o banco pelo próprio painel.
