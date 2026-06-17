"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Save, Check } from "lucide-react";

export default function ConfigPage() {
  const { configuracoes, updateConfiguracoes } = useStore();

  const [gaId, setGaId] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [adsId, setAdsId] = useState("");
  const [minPecas, setMinPecas] = useState(12);
  const [minValor, setMinValor] = useState(1000);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (configuracoes) {
      setGaId(configuracoes.googleAnalyticsId || "");
      setPixelId(configuracoes.metaPixelId || "");
      setAdsId(configuracoes.googleAdsId || "");
      setMinPecas(configuracoes.minimoPecasAtacado ?? 12);
      setMinValor(configuracoes.valorMinimoAtacado ?? 1000);
    }
  }, [configuracoes]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfiguracoes({
      googleAnalyticsId: gaId.trim(),
      metaPixelId: pixelId.trim(),
      googleAdsId: adsId.trim(),
      minimoPecasAtacado: Number(minPecas) || 0,
      valorMinimoAtacado: Number(minValor) || 0
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold">Controle de Sistema</p>
        <h2 className="font-serif text-3xl font-bold text-ink">Configurações Gerais</h2>
        <p className="text-coal/60 text-sm mt-1">Configure pixels de rastreamento de marketing e regras comerciais do atacado.</p>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <Check size={16} /> Configurações salvas e aplicadas com sucesso em toda a plataforma!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Marketing Integrations */}
        <div className="bg-white rounded-xl border border-ink/10 p-6 space-y-4 shadow-line">
          <h3 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3">
            Integrações de Marketing (Pixels e Tags)
          </h3>
          <p className="text-xs text-coal/65 leading-relaxed">
            Configure as chaves e IDs de rastreamento. As tags do Google Analytics, Meta Pixel e Google Ads serão injetadas e ativadas em todas as páginas públicas da loja.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <label htmlFor="gaId" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                G-Tag Google Analytics
              </label>
              <input
                type="text"
                id="gaId"
                value={gaId}
                onChange={(e) => setGaId(e.target.value)}
                placeholder="Ex: G-VLBRWLD1PX"
                className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink bg-pearl/10"
              />
              <span className="text-[10px] text-coal/40 block">Código de acompanhamento universal (G-XXXXXX).</span>
            </div>

            <div className="space-y-2">
              <label htmlFor="pixelId" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                ID Meta Pixel
              </label>
              <input
                type="text"
                id="pixelId"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="Ex: 843008558568835"
                className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink bg-pearl/10"
              />
              <span className="text-[10px] text-coal/40 block">ID numérico do pixel de anúncios Meta Ads.</span>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="adsId" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                ID Google Ads Tag
              </label>
              <input
                type="text"
                id="adsId"
                value={adsId}
                onChange={(e) => setAdsId(e.target.value)}
                placeholder="Ex: AW-123456789"
                className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink bg-pearl/10"
              />
              <span className="text-[10px] text-coal/40 block">Tag de conversão do Google Ads (AW-XXXXXX).</span>
            </div>
          </div>
        </div>

        {/* Card 2: Wholesale B2B rules */}
        <div className="bg-white rounded-xl border border-ink/10 p-6 space-y-4 shadow-line">
          <h3 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3 flex items-center gap-1.5">
            <span>Regras de Compra no Atacado (B2B)</span>
          </h3>
          <p className="text-xs text-coal/65 leading-relaxed">
            Ajuste os valores mínimos e limites comerciais exigidos para a finalização dos pedidos.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <label htmlFor="minPecas" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                Quantidade Mínima de Peças
              </label>
              <input
                type="number"
                id="minPecas"
                value={minPecas}
                onChange={(e) => setMinPecas(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink bg-pearl/10"
              />
              <span className="text-[10px] text-coal/40 block">Número total mínimo de itens somados no carrinho.</span>
            </div>

            <div className="space-y-2">
              <label htmlFor="minValor" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                Valor Mínimo do Pedido (R$)
              </label>
              <input
                type="number"
                id="minValor"
                value={minValor}
                onChange={(e) => setMinValor(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink bg-pearl/10"
              />
              <span className="text-[10px] text-coal/40 block">Valor financeiro mínimo subtotal exigido por compra.</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-ink hover:bg-coal text-white px-6 text-sm font-semibold transition-all shadow-md active:scale-95"
          >
            <Save size={15} />
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
