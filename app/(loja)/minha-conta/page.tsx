"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, MapPin, ClipboardList, LogOut, Plus, Trash2,
  CheckCircle2, AlertCircle, XCircle, Star, Loader2, Home, Building2
} from "lucide-react";
import { useStore } from "@/lib/store";
import ClientOnly from "@/components/ClientOnly";
import type { StatusPedido } from "@/lib/types";

function currency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

interface Endereco {
  id: string;
  apelido: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  principal: boolean;
}

const statusBadge: Record<StatusPedido, string> = {
  pendente: "border-amber-200 bg-amber-50 text-amber-800",
  aprovado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  recusado: "border-red-200 bg-red-50 text-red-800",
};
const statusIcon: Record<StatusPedido, React.ReactNode> = {
  pendente: <AlertCircle size={13} className="text-amber-600 animate-pulse" />,
  aprovado: <CheckCircle2 size={13} className="text-emerald-600" />,
  recusado: <XCircle size={13} className="text-red-600" />,
};

function MinhaConta() {
  const router = useRouter();
  const { clienteLogado, logoutCliente, pedidos } = useStore();
  const [tab, setTab] = useState<"pedidos" | "enderecos">("pedidos");

  // Endereços
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loadingEnd, setLoadingEnd] = useState(false);
  const [showNovoEnd, setShowNovoEnd] = useState(false);
  const [savingEnd, setSavingEnd] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  // Novo endereço form
  const [apelido, setApelido] = useState("Casa");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [principal, setPrincipal] = useState(false);
  const [endError, setEndError] = useState("");

  useEffect(() => {
    if (!clienteLogado) router.push("/login?redirect=/minha-conta");
  }, [clienteLogado, router]);

  const meusPedidos = pedidos.filter((p) => p.cliente?.email === clienteLogado?.email);

  const fetchEnderecos = useCallback(async () => {
    if (!clienteLogado) return;
    setLoadingEnd(true);
    try {
      const res = await fetch(`/api/clientes/${clienteLogado.id}/enderecos`);
      if (res.ok) setEnderecos(await res.json());
    } finally {
      setLoadingEnd(false);
    }
  }, [clienteLogado]);

  useEffect(() => {
    if (tab === "enderecos") fetchEnderecos();
  }, [tab, fetchEnderecos]);

  const handleCepBlur = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
        document.getElementById("end-numero")?.focus();
      }
    } finally {
      setCepLoading(false);
    }
  };

  const handleSalvarEndereco = async (e: React.FormEvent) => {
    e.preventDefault();
    setEndError("");
    if (!rua || !numero || !bairro || !cidade || !estado) {
      setEndError("Preencha todos os campos obrigatórios.");
      return;
    }
    setSavingEnd(true);
    try {
      const res = await fetch(`/api/clientes/${clienteLogado!.id}/enderecos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apelido, cep, rua, numero, complemento, bairro, cidade, estado, principal }),
      });
      if (res.ok) {
        setShowNovoEnd(false);
        setApelido("Casa"); setCep(""); setRua(""); setNumero("");
        setComplemento(""); setBairro(""); setCidade(""); setEstado(""); setPrincipal(false);
        await fetchEnderecos();
      } else {
        setEndError("Erro ao salvar endereço.");
      }
    } finally {
      setSavingEnd(false);
    }
  };

  const handleLogout = async () => {
    await logoutCliente();
    router.push("/");
  };

  if (!clienteLogado) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Olá,</p>
          <h1 className="font-serif text-3xl font-bold text-ink">{clienteLogado.nome}</h1>
          <p className="text-sm text-coal/50 mt-1">{clienteLogado.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-xs text-coal/60 hover:text-clay transition-colors border border-ink/10 rounded-md px-4 py-2 bg-white"
        >
          <LogOut size={13} />
          Sair da conta
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-pearl/50 border border-ink/10 rounded-lg p-1">
        <button
          onClick={() => setTab("pedidos")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-md transition-all ${
            tab === "pedidos" ? "bg-white shadow-line text-ink" : "text-coal/50 hover:text-ink"
          }`}
        >
          <ClipboardList size={15} />
          Meus Pedidos
          {meusPedidos.length > 0 && (
            <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center">
              {meusPedidos.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("enderecos")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-md transition-all ${
            tab === "enderecos" ? "bg-white shadow-line text-ink" : "text-coal/50 hover:text-ink"
          }`}
        >
          <MapPin size={15} />
          Endereços
        </button>
      </div>

      {/* ── PEDIDOS ── */}
      {tab === "pedidos" && (
        <div className="space-y-4">
          {meusPedidos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink/20 p-12 text-center space-y-3">
              <ClipboardList size={32} className="mx-auto text-coal/25" />
              <p className="font-serif text-lg font-bold text-ink">Nenhum pedido ainda</p>
              <p className="text-xs text-coal/50">Seus pedidos aparecerão aqui após a compra.</p>
              <Link href="/produtos" className="inline-flex h-9 items-center gap-1.5 rounded bg-ink text-white text-xs font-semibold px-4 mt-2">
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            meusPedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-line">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-ink/8 bg-pearl/30">
                  <div>
                    <span className="font-bold text-ink">Pedido #{pedido.numero}</span>
                    <span className="mx-2 text-coal/30">·</span>
                    <span className="text-xs text-coal/50">
                      {new Date(pedido.criadoEm).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusBadge[pedido.status]}`}>
                    {statusIcon[pedido.status]}
                    {pedido.status}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {pedido.itens.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold text-ink">{item.nomePeca}</p>
                        <p className="text-xs text-coal/50">Cor: {item.cor} · Tam: {item.tamanho} · Qtd {item.quantidade}</p>
                      </div>
                      <span className="font-semibold text-ink shrink-0">{currency(item.quantidade * item.precoUnitario)}</span>
                    </div>
                  ))}
                  {pedido.status === "recusado" && pedido.motivoRecusa && (
                    <div className="rounded bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                      <strong>Motivo:</strong> {pedido.motivoRecusa}
                    </div>
                  )}
                  {pedido.status === "aprovado" && (
                    <div className="rounded bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                      Aprovado! Entraremos em contato pelo WhatsApp com os detalhes de envio.
                    </div>
                  )}
                  {pedido.status === "pendente" && (
                    <div className="rounded bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                      Em análise — responderemos em breve pelo WhatsApp.
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-ink/5">
                    <span className="text-sm font-semibold text-coal">Total</span>
                    <span className="text-base font-bold text-ink">{currency(pedido.total)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── ENDEREÇOS ── */}
      {tab === "enderecos" && (
        <div className="space-y-4">
          {loadingEnd ? (
            <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-coal/40" /></div>
          ) : (
            <>
              {enderecos.map((end) => (
                <div key={end.id} className="bg-white rounded-xl border border-ink/10 p-5 flex items-start justify-between gap-4 shadow-line">
                  <div className="flex gap-3 items-start">
                    <div className="h-9 w-9 rounded-full bg-pearl border border-ink/10 flex items-center justify-center shrink-0">
                      {end.apelido.toLowerCase().includes("trab") ? <Building2 size={16} className="text-coal/60" /> : <Home size={16} className="text-coal/60" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink text-sm">{end.apelido}</p>
                        {end.principal && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-ink px-2 py-0.5 rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-coal/60 mt-1">
                        {end.rua}, {end.numero}{end.complemento ? ` - ${end.complemento}` : ""}
                      </p>
                      <p className="text-xs text-coal/60">
                        {end.bairro} · {end.cidade} - {end.estado} · CEP {end.cep}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Formulário novo endereço */}
              {showNovoEnd ? (
                <form onSubmit={handleSalvarEndereco} className="bg-white rounded-xl border border-gold/40 p-6 space-y-4 shadow-line">
                  <h3 className="font-semibold text-ink text-sm">Novo Endereço</h3>
                  {endError && (
                    <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">{endError}</div>
                  )}
                  {/* Apelido */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">Apelido</label>
                    <input value={apelido} onChange={(e) => setApelido(e.target.value)} placeholder="Ex: Casa, Trabalho..."
                      className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink" />
                  </div>
                  {/* CEP */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">CEP *</label>
                    <div className="relative">
                      <input value={cep} onChange={(e) => { const d = e.target.value.replace(/\D/g,"").slice(0,8); setCep(d.length>5?`${d.slice(0,5)}-${d.slice(5)}`:d); }}
                        onBlur={handleCepBlur} placeholder="00000-000" maxLength={9}
                        className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink" />
                      {cepLoading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-coal/40" />}
                    </div>
                  </div>
                  {/* Rua + Número */}
                  <div className="grid grid-cols-[1fr_100px] gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">Rua *</label>
                      <input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Nome da rua"
                        className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">Número *</label>
                      <input id="end-numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123"
                        className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink" />
                    </div>
                  </div>
                  {/* Complemento */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">Complemento</label>
                    <input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, bloco..."
                      className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink" />
                  </div>
                  {/* Bairro */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">Bairro *</label>
                    <input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro"
                      className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink" />
                  </div>
                  {/* Cidade + UF */}
                  <div className="grid grid-cols-[1fr_70px] gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">Cidade *</label>
                      <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade"
                        className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">UF *</label>
                      <input value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0,2))} placeholder="SP" maxLength={2}
                        className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink uppercase" />
                    </div>
                  </div>
                  {/* Principal */}
                  <label className="flex items-center gap-2 text-sm text-coal/70 cursor-pointer">
                    <input type="checkbox" checked={principal} onChange={(e) => setPrincipal(e.target.checked)} className="rounded" />
                    Definir como endereço principal
                  </label>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={savingEnd}
                      className="flex-1 h-10 bg-ink text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-60">
                      {savingEnd ? <Loader2 size={14} className="animate-spin" /> : "Salvar Endereço"}
                    </button>
                    <button type="button" onClick={() => setShowNovoEnd(false)}
                      className="h-10 px-4 rounded-md border border-ink/10 text-sm text-coal/60 hover:bg-pearl">
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowNovoEnd(true)}
                  className="w-full h-12 rounded-xl border-2 border-dashed border-ink/15 flex items-center justify-center gap-2 text-sm font-semibold text-coal/50 hover:border-ink/30 hover:text-ink transition-all">
                  <Plus size={16} />
                  Adicionar novo endereço
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MinhaContaPage() {
  return (
    <ClientOnly>
      <MinhaConta />
    </ClientOnly>
  );
}
