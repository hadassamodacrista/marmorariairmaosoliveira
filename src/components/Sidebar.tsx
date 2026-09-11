"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { section: string; items: { href: string; icon: string; label: string; match?: (p: string) => boolean }[] }[] = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
      {
        href: "/orcamentos",
        icon: "bi-file-earmark-text",
        label: "Orçamentos",
        match: (p) => p === "/orcamentos" || (p.startsWith("/orcamentos/") && !p.startsWith("/orcamentos/novo")),
      },
      { href: "/orcamentos/novo", icon: "bi-plus-circle", label: "Novo Orçamento" },
    ],
  },
  {
    section: "Financeiro",
    items: [
      { href: "/financeiro/receber", icon: "bi-cash-coin", label: "Contas a Receber" },
      { href: "/financeiro/pagar", icon: "bi-wallet2", label: "Contas a Pagar" },
      { href: "/financeiro/fluxo", icon: "bi-graph-up", label: "Fluxo de Caixa" },
    ],
  },
  {
    section: "Cadastros",
    items: [
      { href: "/clientes", icon: "bi-people", label: "Clientes" },
      { href: "/fornecedores", icon: "bi-truck", label: "Fornecedores" },
      { href: "/materiais", icon: "bi-layers", label: "Materiais" },
      { href: "/tipos-peca", icon: "bi-grid", label: "Tipos de Peça" },
      { href: "/tipos-servico", icon: "bi-tools", label: "Tipos de Serviço" },
    ],
  },
  {
    section: "Sistema",
    items: [{ href: "/configuracoes", icon: "bi-gear", label: "Configurações" }],
  },
];

export default function Sidebar({ empresaNome }: { empresaNome: string }) {
  const pathname = usePathname();

  return (
    <nav id="sidebar">
      <div className="brand">
        <i className="bi bi-gem me-2" />
        {empresaNome}
        <small>Sistema de Orçamentos</small>
      </div>
      <div className="pt-2 pb-4">
        {NAV.map((grupo) => (
          <div key={grupo.section}>
            <div className="nav-section">{grupo.section}</div>
            {grupo.items.map((item) => {
              const ativo = item.match ? item.match(pathname) : pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`nav-link ${ativo ? "active" : ""}`}>
                  <i className={`bi ${item.icon}`} /> {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
