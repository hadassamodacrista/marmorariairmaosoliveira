"use client";

import { useTransition } from "react";
import { confirmar } from "@/lib/ui-client";
import { tratarResultado } from "@/lib/use-action-result";
import type { ActionResult } from "@/lib/action-result";

export default function BotaoExcluir({
  mensagemConfirmacao,
  mensagemSucesso,
  acao,
  className = "btn btn-sm btn-outline-danger",
  titulo = "Excluir",
}: {
  mensagemConfirmacao: string;
  mensagemSucesso?: string;
  acao: () => Promise<ActionResult<unknown>>;
  className?: string;
  titulo?: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirmar(mensagemConfirmacao)) return;
    startTransition(async () => {
      const r = await acao();
      tratarResultado(r, mensagemSucesso || "Excluído");
    });
  }

  return (
    <button className={className} onClick={onClick} disabled={pending} title={titulo} type="button">
      <i className="bi bi-trash" />
    </button>
  );
}
