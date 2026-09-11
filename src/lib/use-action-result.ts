"use client";

import { toast } from "./ui-client";
import type { ActionResult } from "./action-result";

/** Mostra toast de sucesso/erro a partir de um ActionResult; devolve true se deu certo. */
export function tratarResultado<T>(r: ActionResult<T>, mensagemSucesso?: string): r is { ok: true; data: T } {
  if (!r.ok) {
    toast(r.error, "danger");
    return false;
  }
  if (mensagemSucesso) toast(mensagemSucesso);
  return true;
}
