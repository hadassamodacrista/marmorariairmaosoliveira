"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, LoginState } from "./actions";

const estadoInicial: LoginState = {};

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [state, formAction, pending] = useActionState(loginAction, estadoInicial);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#f4f6fb" }}
    >
      <div className="card shadow-sm border-0" style={{ width: 380 }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-gem" style={{ fontSize: "2rem", color: "#c0392b" }} />
            <h5 className="mt-2 mb-0 fw-bold">Marmoraria — Orçamentos</h5>
            <div className="text-muted small">Entrar no sistema</div>
          </div>
          <form action={formAction}>
            <input type="hidden" name="next" value={next} />
            <div className="mb-3">
              <label className="form-label">E-mail</label>
              <input name="email" type="email" className="form-control" required autoFocus />
            </div>
            <div className="mb-3">
              <label className="form-label">Senha</label>
              <input name="senha" type="password" className="form-control" required />
            </div>
            {state.error && <div className="alert alert-danger py-2">{state.error}</div>}
            <button className="btn btn-primary w-100" disabled={pending} type="submit">
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
