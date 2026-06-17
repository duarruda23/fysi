"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Zap, Globe, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Loader2,
} from "lucide-react";
import type { Webhook, WebhookGatilho } from "@/lib/types";

const GATILHOS: { value: WebhookGatilho; label: string; desc: string }[] = [
  { value: "novo_pedido",          label: "Novo Pedido",           desc: "Disparado quando um cliente finaliza um novo pedido." },
  { value: "atualizacao_pedido",   label: "Atualização de Pedido", desc: "Disparado quando o status de um pedido é atualizado." },
  { value: "carrinho_abandonado",  label: "Carrinho Abandonado",   desc: "Disparado quando um carrinho fica abandonado por 30min." },
  { value: "saiu_para_entrega",    label: "Saiu para Entrega",     desc: "Disparado quando o pedido sai para entrega." },
  { value: "pedido_entregue",      label: "Pedido Entregue",       desc: "Disparado quando o pedido é confirmado como entregue." },
  { value: "realizar_pagamento",   label: "Realizar Pagamento",    desc: "Disparado quando o pedido aguarda pagamento." },
  { value: "pagamento_efetuado",   label: "Pagamento Efetuado",    desc: "Disparado quando o pagamento é confirmado." },
  { value: "pedido_sendo_separado",label: "Pedido Sendo Separado", desc: "Disparado quando o pedido entra em separação." },
  { value: "pedido_enviado",       label: "Pedido Enviado",        desc: "Disparado quando o pedido é despachado." },
];

export function WebhooksManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [gatilhosSel, setGatilhosSel] = useState<WebhookGatilho[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      setWebhooks(Array.isArray(data) ? data : []);
    } catch {
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const toggleGatilho = (g: WebhookGatilho) => {
    setGatilhosSel((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!nome.trim() || !url.trim()) { setFormError("Nome e URL são obrigatórios."); return; }
    if (!url.startsWith("http")) { setFormError("A URL deve começar com http:// ou https://."); return; }
    if (gatilhosSel.length === 0) { setFormError("Selecione pelo menos um gatilho."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, url, gatilhos: gatilhosSel }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Erro ao salvar."); return; }
      setWebhooks((prev) => [data, ...prev]);
      setNome(""); setUrl(""); setGatilhosSel([]); setShowForm(false);
    } catch {
      setFormError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAtivo = async (wh: Webhook) => {
    setWebhooks((prev) => prev.map((w) => w.id === wh.id ? { ...w, ativo: !w.ativo } : w));
    await fetch(`/api/webhooks/${wh.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !wh.ativo }),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este webhook?")) return;
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
  };

  return (
    <div className="bg-white rounded-xl border border-ink/10 shadow-line overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink leading-none">Webhooks</h3>
            <p className="text-[11px] text-coal/50 mt-0.5">Notificações HTTP para eventos da loja</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setFormError(""); }}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-ink text-white text-xs font-semibold hover:bg-coal transition-colors"
        >
          <Plus size={13} />
          Novo Webhook
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div className="border-b border-ink/10 bg-pearl/30 px-6 py-5 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-coal/60">Cadastrar Novo Webhook</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-coal/60 uppercase tracking-wider block">Nome *</label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Notificação ERP"
                  className="w-full h-10 px-3 rounded-md border border-ink/15 text-sm text-ink outline-none focus:border-ink bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-coal/60 uppercase tracking-wider block">URL de Destino *</label>
                <div className="relative">
                  <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-coal/40" />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://meuapp.com/webhook"
                    className="w-full h-10 pl-8 pr-3 rounded-md border border-ink/15 text-sm text-ink outline-none focus:border-ink bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Seletor de gatilhos */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-coal/60 uppercase tracking-wider block">
                Gatilhos * <span className="normal-case font-normal text-coal/40">— selecione quais eventos disparam este webhook</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {GATILHOS.map((g) => {
                  const active = gatilhosSel.includes(g.value);
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => toggleGatilho(g.value)}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                        active
                          ? "border-ink bg-ink text-white"
                          : "border-ink/12 bg-white text-ink hover:border-ink/30"
                      }`}
                    >
                      <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? "border-white bg-white" : "border-ink/30"}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-ink" />}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold leading-tight ${active ? "text-white" : "text-ink"}`}>{g.label}</p>
                        <p className={`text-[10px] mt-0.5 leading-snug ${active ? "text-white/70" : "text-coal/45"}`}>{g.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {formError && (
              <p className="flex items-center gap-1.5 text-xs text-clay font-medium">
                <XCircle size={13} /> {formError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 h-9 px-5 rounded-md bg-ink text-white text-xs font-semibold hover:bg-coal transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                Salvar Webhook
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(""); }}
                className="text-xs text-coal/50 hover:text-ink transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-coal/40" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Zap size={28} className="text-coal/20 mb-3" />
          <p className="text-sm font-semibold text-coal/50">Nenhum webhook cadastrado</p>
          <p className="text-xs text-coal/35 mt-1">Clique em &quot;Novo Webhook&quot; para começar.</p>
        </div>
      ) : (
        <ul className="divide-y divide-ink/8">
          {webhooks.map((wh) => (
            <li key={wh.id} className="px-6 py-4">
              <div className="flex items-center gap-3">
                {/* Toggle ativo */}
                <button onClick={() => toggleAtivo(wh)} title={wh.ativo ? "Desativar" : "Ativar"} className="shrink-0">
                  {wh.ativo
                    ? <ToggleRight size={22} className="text-emerald-600" />
                    : <ToggleLeft size={22} className="text-coal/30" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-ink truncate">{wh.nome}</span>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${wh.ativo ? "bg-emerald-50 text-emerald-700" : "bg-coal/8 text-coal/50"}`}>
                      {wh.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-[11px] text-coal/50 truncate mt-0.5">{wh.url}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === wh.id ? null : wh.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-ink/10 hover:bg-pearl transition-colors"
                    title="Ver gatilhos"
                  >
                    {expandedId === wh.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(wh.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-ink/10 hover:bg-clay/5 hover:text-clay hover:border-clay/20 transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Gatilhos expandidos */}
              {expandedId === wh.id && (
                <div className="mt-3 ml-9 flex flex-wrap gap-1.5">
                  {wh.gatilhos.map((g) => {
                    const info = GATILHOS.find((x) => x.value === g);
                    return (
                      <span key={g} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-ink/8 text-ink">
                        <Zap size={9} />
                        {info?.label ?? g}
                      </span>
                    );
                  })}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
