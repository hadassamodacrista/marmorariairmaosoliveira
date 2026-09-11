"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarAceiteAction } from "./aceite-actions";
import { dataHoraBR } from "@/lib/format";

export default function AceiteBox({
  token,
  status,
  aceiteEm,
  aceiteNome,
}: {
  token: string;
  status: string;
  aceiteEm: string | Date | null;
  aceiteNome: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [observacao, setObservacao] = useState("");
  const [concordo, setConcordo] = useState(false);

  if (aceiteEm && status === "recusado") {
    return (
      <div className="aceite-recusado">
        <strong>Você recusou este orçamento</strong> em {dataHoraBR(aceiteEm)}.
        <br />
        <span style={{ fontSize: ".9rem" }}>Se mudou de ideia ou quer rever os valores, fale com a gente.</span>
      </div>
    );
  }

  if (aceiteEm) {
    return (
      <div className="aceite-ok">
        <strong>✔ Orçamento aprovado</strong> em {dataHoraBR(aceiteEm)} por {aceiteNome}.
        <br />
        <span style={{ fontSize: ".9rem" }}>Registro guardado pela marmoraria. Em breve entraremos em contato para os próximos passos.</span>
      </div>
    );
  }

  function enviar(acao: "aprovar" | "recusar") {
    if (nome.trim().length < 3) {
      setErro("Informe seu nome completo.");
      return;
    }
    if (acao === "aprovar" && !concordo) {
      setErro("Marque a caixa de concordância para aprovar.");
      return;
    }
    setErro("");
    startTransition(async () => {
      const r = await registrarAceiteAction({
        token,
        acao,
        nome: nome.trim(),
        documento: documento.trim(),
        observacao: observacao.trim(),
        userAgent: navigator.userAgent,
      });
      if (!r.ok) {
        setErro(r.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="aceite-box pendente no-print">
      <div className="section-title">Aprovar este orçamento</div>
      <p className="text-muted" style={{ fontSize: ".92rem" }}>
        Confira os valores e as condições acima. Ao aprovar, você confirma que concorda com este orçamento. A data e a hora
        ficam registradas.
      </p>
      <div className="row g-2">
        <div className="col-sm-6">
          <label className="form-label small mb-1">Seu nome completo *</label>
          <input type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
        </div>
        <div className="col-sm-6">
          <label className="form-label small mb-1">CPF ou CNPJ (opcional)</label>
          <input type="text" className="form-control" value={documento} onChange={(e) => setDocumento(e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label small mb-1">Observação (opcional)</label>
          <textarea className="form-control" rows={2} placeholder="Alguma dúvida ou pedido?" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
        </div>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="ac-concordo" checked={concordo} onChange={(e) => setConcordo(e.target.checked)} />
            <label className="form-check-label" htmlFor="ac-concordo" style={{ fontSize: ".9rem" }}>
              Li e concordo com os valores e as condições descritos neste orçamento.
            </label>
          </div>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        <button className="btn btn-success" onClick={() => enviar("aprovar")} disabled={pending}>
          ✔ Aprovar orçamento
        </button>
        <button className="btn btn-outline-secondary" onClick={() => enviar("recusar")} disabled={pending}>
          Tenho dúvidas / recusar
        </button>
      </div>
      {erro && (
        <div className="mt-2 text-danger" style={{ fontSize: ".9rem" }}>
          {erro}
        </div>
      )}
      {pending && (
        <div className="mt-2 text-muted" style={{ fontSize: ".9rem" }}>
          Registrando...
        </div>
      )}
    </div>
  );
}
