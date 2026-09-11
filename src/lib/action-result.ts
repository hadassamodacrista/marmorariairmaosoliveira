/**
 * Em produção o Next.js apaga a mensagem de erros lançados (throw) dentro de
 * Server Actions, por segurança — só aparece um "An error occurred" genérico.
 * Isso quebraria as mensagens de validação (ex.: "Selecione um cliente").
 * Por isso as actions devolvem { ok, error } em vez de lançar exceção; o
 * componente cliente decide o que mostrar.
 */
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}
