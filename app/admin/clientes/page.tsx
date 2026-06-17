"use client";

import React, { useState, useEffect } from "react";
import { Users, Mail, Phone, TrendingUp, Search, Calendar } from "lucide-react";

function currency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

interface ClienteAdmin {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  totalGasto: number;
  criadoEm: string;
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetch("/api/admin/clientes")
      .then((r) => r.json())
      .then((d) => { setClientes(Array.isArray(d) ? d : []); })
      .finally(() => setLoading(false));
  }, []);

  const filtrados = clientes.filter((c) => {
    const q = busca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.telefone.includes(q)
    );
  });

  const totalGeralGasto = clientes.reduce((sum, c) => sum + c.totalGasto, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Gestão</p>
          <h1 className="font-serif text-4xl font-semibold text-ink">Clientes</h1>
          <p className="mt-1 text-sm text-coal/55">Contas cadastradas e histórico de compras</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-ink/10 rounded-lg px-4 py-3 text-center shadow-line">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-coal/50">Total Clientes</p>
            <p className="text-2xl font-bold text-ink">{clientes.length}</p>
          </div>
          <div className="bg-white border border-ink/10 rounded-lg px-4 py-3 text-center shadow-line">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-coal/50">Total em Compras</p>
            <p className="text-2xl font-bold text-ink">{currency(totalGeralGasto)}</p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-coal/40" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone..."
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-ink/10 bg-white text-sm text-ink outline-none focus:border-ink shadow-line"
        />
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
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 border-b border-ink/8 bg-pearl/50">
            {["Cliente", "E-mail", "Telefone", "Total Gasto", "Cadastro"].map((h) => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-wider text-coal/50">{h}</p>
            ))}
          </div>

          <div className="divide-y divide-ink/5">
            {filtrados.map((c) => (
              <div
                key={c.id}
                className="grid md:grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-3 md:gap-4 px-5 py-4 hover:bg-pearl/30 transition-colors items-center"
              >
                {/* Nome */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-ink/8 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-ink/70">{c.nome.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="font-semibold text-ink text-sm line-clamp-1">{c.nome}</span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 text-sm text-coal/70 min-w-0">
                  <Mail size={12} className="shrink-0 text-coal/40" />
                  <span className="truncate">{c.email}</span>
                </div>

                {/* Telefone */}
                <div className="flex items-center gap-1.5 text-sm text-coal/70">
                  <Phone size={12} className="shrink-0 text-coal/40" />
                  <span>{c.telefone || <span className="text-coal/30 text-xs italic">não informado</span>}</span>
                </div>

                {/* Total gasto */}
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className={c.totalGasto > 0 ? "text-emerald-600 shrink-0" : "text-coal/30 shrink-0"} />
                  <span className={`text-sm font-bold ${c.totalGasto > 0 ? "text-emerald-700" : "text-coal/40"}`}>
                    {currency(c.totalGasto)}
                  </span>
                </div>

                {/* Data */}
                <div className="flex items-center gap-1.5 text-xs text-coal/50">
                  <Calendar size={11} className="shrink-0" />
                  {new Date(c.criadoEm).toLocaleDateString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
