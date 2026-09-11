import "server-only";
import { db, clientes } from "@/db/client";
import { desc, eq } from "drizzle-orm";
import { newId } from "@/lib/ids";

export type ClienteInput = {
  id?: string | null;
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
};

export async function getClientes() {
  return db.select().from(clientes).orderBy(desc(clientes.criadoEm));
}

export async function getClienteById(id: string) {
  const rows = await db.select().from(clientes).where(eq(clientes.id, id));
  return rows[0] ?? null;
}

export async function saveCliente(data: ClienteInput) {
  const nome = String(data.nome || "").trim();
  if (!nome) throw new Error("Informe o nome do cliente");

  if (data.id) {
    await db
      .update(clientes)
      .set({
        nome,
        telefone: data.telefone || "",
        email: data.email || "",
        endereco: data.endereco || "",
        cidade: data.cidade || "",
      })
      .where(eq(clientes.id, data.id));
    return data.id;
  }

  const id = newId();
  await db.insert(clientes).values({
    id,
    nome,
    telefone: data.telefone || "",
    email: data.email || "",
    endereco: data.endereco || "",
    cidade: data.cidade || "",
  });
  return id;
}

export async function deleteCliente(id: string) {
  await db.delete(clientes).where(eq(clientes.id, id));
  return true;
}
