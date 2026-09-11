import Link from "next/link";
import { logoutAction } from "@/lib/auth-actions";

export default function Topbar({ email }: { email: string }) {
  return (
    <div className="topbar">
      <h5>
        <i className="bi bi-list d-md-none me-2" />
        Marmoraria
      </h5>
      <div className="d-flex align-items-center gap-2">
        <Link href="/orcamentos/novo" className="btn btn-sm btn-primary">
          <i className="bi bi-plus-lg me-1" />
          Novo Orçamento
        </Link>
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-person-circle me-1" />
            {email}
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <form action={logoutAction}>
                <button type="submit" className="dropdown-item">
                  <i className="bi bi-box-arrow-right me-2" />
                  Sair
                </button>
              </form>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
