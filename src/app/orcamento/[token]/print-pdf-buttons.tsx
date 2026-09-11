"use client";

export default function PrintPdfButtons({ token }: { orcamentoId: string; token: string }) {
  return (
    <div className="d-flex gap-2">
      <a className="btn-pdf btn" href={`/api/publico/pdf/${token}`} target="_blank" rel="noreferrer">
        ⬇ Baixar PDF
      </a>
      <button className="btn btn-outline-secondary" onClick={() => window.print()}>
        🖨 Imprimir
      </button>
    </div>
  );
}
