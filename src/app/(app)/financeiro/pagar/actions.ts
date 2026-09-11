"use server";

import { revalidatePath } from "next/cache";
import {
  saveContaPagar,
  deleteContaPagar,
  pagarContaPagar,
  reabrirContaPagar,
  type ContaPagarInput,
} from "@/lib/data/contasPagar";
import { runAction } from "@/lib/action-result";

function revalidar() {
  revalidatePath("/financeiro/pagar");
  revalidatePath("/financeiro/fluxo");
  revalidatePath("/dashboard");
}

export async function salvarContaPagarAction(data: ContaPagarInput) {
  return runAction(async () => {
    const id = await saveContaPagar(data);
    revalidar();
    return id;
  });
}

export async function excluirContaPagarAction(id: string) {
  return runAction(async () => {
    await deleteContaPagar(id);
    revalidar();
  });
}

export async function pagarContaPagarAction(id: string, dados: { pagoEm?: string; formaPagamento?: string }) {
  return runAction(async () => {
    await pagarContaPagar(id, dados);
    revalidar();
  });
}

export async function reabrirContaPagarAction(id: string) {
  return runAction(async () => {
    await reabrirContaPagar(id);
    revalidar();
  });
}
