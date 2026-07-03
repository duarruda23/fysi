"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Save, Check } from "lucide-react";
import { WebhooksManager } from "@/components/WebhooksManager";

export default function ConfigPage() {
  const { configuracoes, updateConfiguracoes } = useStore();

  const [gaId, setGaId] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [adsId, setAdsId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [tiktokApiToken, setTiktokApiToken] = useState("");
  const [minPecas, setMinPecas] = useState(12);
  const [minValor, setMinValor] = useState(1000);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (configuracoes) {
      setGaId(configuracoes.googleAnalyticsId || "");
      setPixelId(configuracoes.metaPixelId || "");
      setAdsId(configuracoes.googleAdsId || "");
      setTiktokPixelId(configuracoes.tiktokPixelId || "");
      setTiktokApiToken(configuracoes.tiktokApiToken || "");
      setMinPecas(configuracoes.minimoPecasAtacado ?? 12);
      setMinValor(configuracoes.valorMinimoAtacado ?? 1000);
    }
  }, [configuracoes]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfiguracoes({
      googleAnalyticsId: gaId.trim(),
      metaPixelId: pixelId.trim(),
      googleAdsId: adsId.trim(),
      tiktokPixelId: tiktokPixelId.trim(),
      tiktokApiToken: tiktokApiToken.trim(),
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

            {/* Separador TikTok */}
            <div className="sm:col-span-2 pt-2 border-t border-ink/8">
              <div className="flex items-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-ink/60 shrink-0" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-coal/60">TikTok for Business</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="tiktokPixelId" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    id="tiktokPixelId"
                    value={tiktokPixelId}
                    onChange={(e) => setTiktokPixelId(e.target.value)}
                    placeholder="Ex: D940H7JC77UDPAPRGMR0"
                    className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink bg-pearl/10"
                  />
                  <span className="text-[10px] text-coal/40 block">ID do pixel do TikTok Ads (Events Manager).</span>
                </div>
                <div className="space-y-2">
                  <label htmlFor="tiktokApiToken" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                    TikTok Events API Token
                  </label>
                  <input
                    type="password"
                    id="tiktokApiToken"
                    value={tiktokApiToken}
                    onChange={(e) => setTiktokApiToken(e.target.value)}
                    placeholder="Token de acesso da API de eventos"
                    className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink bg-pearl/10"
                  />
                  <span className="text-[10px] text-coal/40 block">Token para envio server-side via Events API (opcional).</span>
                </div>
              </div>
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

      {/* Webhooks */}
      <div className="space-y-3 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Integrações Externas</p>
          <h2 className="font-serif text-2xl font-bold text-ink">Webhooks</h2>
          <p className="text-coal/60 text-sm mt-1">
            Cadastre endpoints externos para receber notificações HTTP automáticas a cada evento da loja.
            Cada webhook pode ter um ou mais gatilhos independentes.
          </p>
        </div>
        <WebhooksManager />
      </div>
    </div>
  );
}
