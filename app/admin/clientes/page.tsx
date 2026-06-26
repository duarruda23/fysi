"use client";

import React, { useState, useEffect } from "react";
import {
  Users, Mail, Phone, TrendingUp, Search, Calendar,
  ShoppingCart, ShoppingBag, Clock, ChevronDown, ChevronUp, Package,
} from "lucide-react";

function currency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "nunca";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  return `${days}d atrás`;
}

interface CarrinhoItem {
  nome?: string;
  quantidade?: number;
  preco?: number;
}

interface ClienteAdmin {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  totalGasto: number;
  totalPedidos: number;
  pedidosAprovados: number;
  ultimoPedidoEm: string | null;
  carrinhoAbandonado: CarrinhoItem[];
  temCarrinhoAbandonado: boolean;
  ultimoAcesso: string | null;
  criadoEm: string;
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "compradores" | "carrinho">("todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/clientes")
      .then((r) => r.json())
      .then((d) => setClientes(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = clientes.filter((c) => {
    const q = busca.toLowerCase();
    const matchBusca =
      c.nome.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.telefone || "").includes(q);

    if (filtro === "compradores") return matchBusca && c.totalPedidos > 0;
    if (filtro === "carrinho") return matchBusca && c.temCarrinhoAbandonado;
    return matchBusca;
  });

  const totalGeralGasto = clientes.reduce((sum, c) => sum + c.totalGasto, 0);
  const comCarrinho = clientes.filter((c) => c.temCarrinhoAbandonado).length;
  const comPedidos = clientes.filter((c) => c.totalPedidos > 0).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">Gestão</p>
        <h1 className="font-serif text-4xl font-semibold text-ink">Clientes</h1>
        <p className="mt-1 text-sm text-coal/55">Contas cadastradas e histórico de compras</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Clientes", value: clientes.length, icon: Users, color: "text-ink" },
          { label: "Total em Compras", value: currency(totalGeralGasto), icon: TrendingUp, color: "text-emerald-600" },
          { label: "Com Pedidos", value: comPedidos, icon: ShoppingBag, color: "text-blue-600" },
          { label: "Carrinho Abandonado", value: comCarrinho, icon: ShoppingCart, color: "text-amber-600" },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-ink/10 rounded-xl px-4 py-4 shadow-line flex items-center gap-3">
            <m.icon size={20} className={`${m.color} shrink-0`} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-coal/50">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros + Busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-coal/40" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-ink/10 bg-white text-sm text-ink outline-none focus:border-ink shadow-line"
          />
        </div>
        <div className="flex gap-2">
          {(["todos", "compradores", "carrinho"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`h-10 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                filtro === f
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-coal/60 border-ink/10 hover:border-ink/30"
              }`}
            >
              {f === "todos" ? "Todos" : f === "compradores" ? "Com pedidos" : "Carrinho"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-sm text-coal/50">Carregando clientes...</div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/20 p-12 text-center space-y-3">
          <Users size={32} className="mx-auto text-coal/25" />
          <p className="font-serif text-lg font-bold text-ink">
            {busca ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          </p>
          <p className="text-xs text-coal/50">
            {busca ? "Tente outro termo de busca." : "Os clientes aparecerão aqui após se cadastrarem na loja."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ink/10 shadow-line overflow-hidden">

          {/* Cabeçalho da tabela */}
          <div className="hidden md:grid md:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b border-ink/8 bg-pearl/50">
            {["Cliente", "E-mail", "Telefone", "Total Gasto", "Pedidos", "Último Acesso", ""].map((h) => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-wider text-coal/50">{h}</p>
            ))}
          </div>

          <div className="divide-y divide-ink/5">
            {filtrados.map((c) => (
              <React.Fragment key={c.id}>
                {/* Linha principal */}
                <div
                  className="grid md:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_40px] gap-3 md:gap-4 px-5 py-4 hover:bg-pearl/30 transition-colors items-center cursor-pointer"
                  onClick={() => setExpandido(expandido === c.id ? null : c.id)}
                >
                  {/* Nome + badge carrinho */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-ink/8 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-ink/70">{c.nome.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-sm truncate">{c.nome}</p>
                      {c.temCarrinhoAbandonado && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          <ShoppingCart size={9} /> Carrinho abandonado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-1.5 text-sm text-coal/70 min-w-0">
                    <Mail size={12} className="shrink-0 text-coal/40" />
                    <span className="truncate">{c.email}</span>
                  </div>

                  {/* Telefone */}
                  <div className="flex items-center gap-1.5 text-sm text-coal/70">
                    <Phone size={12} className="shrink-0 text-coal/40" />
                    <span>{c.telefone || <span className="text-coal/30 text-xs italic">—</span>}</span>
                  </div>

                  {/* Total gasto */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold ${c.totalGasto > 0 ? "text-emerald-700" : "text-coal/40"}`}>
                      {currency(c.totalGasto)}
                    </span>
                  </div>

                  {/* Pedidos */}
                  <div className="flex items-center gap-1.5 text-sm text-coal/70">
                    <Package size={12} className="shrink-0 text-coal/40" />
                    <span>{c.totalPedidos} pedido{c.totalPedidos !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Último acesso */}
                  <div className="flex items-center gap-1.5 text-xs text-coal/50">
                    <Clock size={11} className="shrink-0" />
                    {timeAgo(c.ultimoAcesso)}
                  </div>

                  {/* Expand */}
                  <div className="flex items-center justify-center text-coal/30">
                    {expandido === c.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {expandido === c.id && (
                  <div className="px-5 pb-5 bg-pearl/20 border-t border-ink/5 grid md:grid-cols-3 gap-4">

                    {/* Info básica */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-coal/40 mt-4">Conta</p>
                      <div className="flex items-center gap-2 text-xs text-coal/70">
                        <Calendar size={11} />
                        Cadastrado em {new Date(c.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      </div>
                      {c.ultimoPedidoEm && (
                        <div className="flex items-center gap-2 text-xs text-coal/70">
                          <ShoppingBag size={11} />
                          Último pedido: {new Date(c.ultimoPedidoEm).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-coal/70">
                        <TrendingUp size={11} />
                        {c.pedidosAprovados} pedido{c.pedidosAprovados !== 1 ? "s" : ""} aprovado{c.pedidosAprovados !== 1 ? "s" : ""} · {currency(c.totalGasto)} gastos
                      </div>
                    </div>

                    {/* Carrinho abandonado */}
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-coal/40 mt-4 mb-2">
                        {c.temCarrinhoAbandonado ? "Carrinho Abandonado" : "Carrinho"}
                      </p>
                      {c.temCarrinhoAbandonado ? (
                        <div className="space-y-1.5">
                          {c.carrinhoAbandonado.map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg bg-white border border-amber-100 px-3 py-2">
                              <div className="flex items-center gap-2">
                                <ShoppingCart size={12} className="text-amber-500" />
                                <span className="text-xs font-semibold text-ink">{item.nome || "Produto"}</span>
                                <span className="text-xs text-coal/50">× {item.quantidade || 1}</span>
                              </div>
                              {item.preco && (
                                <span className="text-xs font-bold text-amber-700">{currency(item.preco)}</span>
                              )}
                            </div>
                          ))}
                          <p className="text-[10px] text-coal/40 mt-1">
                            {c.carrinhoAbandonado.length} item{c.carrinhoAbandonado.length !== 1 ? "s" : ""} no carrinho · último acesso {timeAgo(c.ultimoAcesso)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-coal/40 italic">Nenhum item no carrinho no momento.</p>
                      )}
                    </div>

                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
