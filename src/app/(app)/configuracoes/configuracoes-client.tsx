"use client";

import { useTransition } from "react";
import { salvarConfigAction } from "./actions";
import { tratarResultado } from "@/lib/use-action-result";

export default function ConfiguracoesClient({ config }: { config: Record<string, string> }) {
  const [pending, startTransition] = useTransition();

  function salvar(formData: FormData) {
    const dados = {
      empresa_nome: String(formData.get("empresa_nome") || ""),
      empresa_cnpj: String(formData.get("empresa_cnpj") || ""),
      empresa_tel: String(formData.get("empresa_tel") || ""),
      empresa_email: String(formData.get("empresa_email") || ""),
      empresa_endereco: String(formData.get("empresa_endereco") || ""),
      empresa_logo_url: String(formData.get("empresa_logo_url") || "").trim(),
      orcamento_validade: String(formData.get("orcamento_validade") || "30"),
      orcamento_obs: String(formData.get("orcamento_obs") || ""),
    };
    startTransition(async () => {
      const r = await salvarConfigAction(dados);
      tratarResultado(r, "Configurações salvas!");
    });
  }

  return (
    <>
      <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
        Configurações
      </h4>
      <div className="card border-0 shadow-sm" style={{ maxWidth: 700 }}>
        <div className="card-header bg-white fw-bold">Dados da Empresa</div>
        <div className="card-body">
          <form action={salvar}>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Nome da empresa *</label>
                <input name="empresa_nome" className="form-control" defaultValue={config.empresa_nome || ""} />
              </div>
              <div className="col-md-4">
                <label className="form-label">CNPJ / CPF</label>
                <input name="empresa_cnpj" className="form-control" defaultValue={config.empresa_cnpj || ""} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Telefone</label>
                <input name="empresa_tel" className="form-control" defaultValue={config.empresa_tel || ""} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input name="empresa_email" type="email" className="form-control" defaultValue={config.empresa_email || ""} />
              </div>
              <div className="col-12">
                <label className="form-label">Endereço completo</label>
                <input name="empresa_endereco" className="form-control" defaultValue={config.empresa_endereco || ""} />
              </div>
              <div className="col-12">
                <label className="form-label">URL da logo (imagem hospedada)</label>
                <input name="empresa_logo_url" className="form-control" placeholder="https://..." defaultValue={config.empresa_logo_url || ""} />
                <div className="form-text">Cole o link de uma imagem já hospedada (ex.: no seu site, imgur, etc.). Aparece no PDF e na barra lateral.</div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Validade padrão (dias)</label>
                <input name="orcamento_validade" type="number" className="form-control" defaultValue={config.orcamento_validade || "30"} />
              </div>
              <div className="col-12">
                <label className="form-label">Observação padrão nos orçamentos</label>
                <textarea name="orcamento_obs" className="form-control" rows={3} defaultValue={config.orcamento_obs || ""} />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary" disabled={pending}>
                  <i className="bi bi-save me-1" />
                  Salvar configurações
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
