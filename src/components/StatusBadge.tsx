const MAPA: Record<string, { cls: string; label: string }> = {
  aberto: { cls: "badge-aberto", label: "Em aberto" },
  aprovado: { cls: "badge-aprovado", label: "Aprovado" },
  recusado: { cls: "badge-recusado", label: "Recusado" },
  executado: { cls: "badge-executado", label: "Executado" },
};

export default function StatusBadge({ status }: { status: string }) {
  const info = MAPA[status] || { cls: "bg-secondary text-white", label: status };
  return <span className={`badge ${info.cls} rounded-pill px-2 py-1`}>{info.label}</span>;
}
