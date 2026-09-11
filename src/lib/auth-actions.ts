"use server";

import { redirect } from "next/navigation";
import { encerrarSessao } from "./auth";

export async function logoutAction() {
  await encerrarSessao();
  redirect("/login");
}
