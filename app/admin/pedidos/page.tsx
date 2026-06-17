"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Filter, Search, ClipboardList, CheckCircle2, XCircle, AlertCircle, Eye } from "lucide-react";
import type { StatusPedido } from "@/lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const statusBadgeStyle: Record<StatusPedido, string> = {
  pendente: "border-amber-200 bg-amber-50 text-amber-800",
  aprovado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  recusado: "border-red-200 bg-red-50 text-red-800"
};

const statusLabels: Record<StatusPedido, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado"
};

export default function AdminOrdersPage() {
  const { pedidos } = useStore();
  
  // States
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return pedidos.filter((pedido) => {
      // 1. Status Filter
      if (selectedStatus !== "todos" && pedido.status !== selectedStatus) {
        return false;
      }

      // 2. Search query (client name or order number)
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = pedido.cliente.nome.toLowerCase().includes(query);
        const matchesNumber = pedido.numero.toString().includes(query);
        const matchesPhone = pedido.cliente.telefone.replace(/\D/g, "").includes(query.replace(/\D/g, ""));
        
        if (!matchesName && !matchesNumber && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [pedidos, selectedStatus, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink font-serif md:text-3xl">Pedidos</h2>
        <p className="text-sm text-coal/60">Monitore chamados de compra, verifique dados do cliente e aprove/recuse solicitações</p>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus("todos")}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedStatus === "todos"
                ? "border-ink bg-ink text-white"
                : "border-ink/10 bg-white text-coal/65 hover:border-ink/20"
            }`}
          >
            Todos
          </button>
          
          {(["pendente", "aprovado", "recusado"] as StatusPedido[]).map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? statusBadgeStyle[status] + " border-ink"
                    : "border-ink/10 bg-white text-coal/65 hover:border-ink/20"
                }`}
              >
                <span>{statusLabels[status]}</span>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="relative flex items-center rounded-md border border-ink/10 bg-white max-w-sm w-full">
          <Search size={16} className="absolute left-3 text-coal/45" />
          <input
            type="text"
            placeholder="Buscar por cliente, nº ou tel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 bg-transparent pl-10 pr-3 text-sm text-ink outline-none placeholder:text-coal/35 focus:border-ink rounded-md"
          />
        </div>
      </div>

      {/* Orders Grid Table */}
      <div className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-line">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[100px_1fr_120px_130px_120px_110px] gap-4 p-4 border-b border-ink/10 text-xs font-semibold uppercase tracking-wider text-coal/50 bg-pearl/20">
          <span>Número</span>
          <span>Cliente</span>
          <span>Data / Hora</span>
          <span>Itens</span>
          <span>Valor Total</span>
          <span className="text-center">Status</span>
        </div>

        {/* Table Rows */}
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-ink/8">
            {filteredOrders.map((pedido) => (
              <Link
                key={pedido.id}
                href={`/admin/pedidos/${pedido.id}`}
                className="grid grid-cols-[80px_1fr_auto] md:grid-cols-[100px_1fr_120px_130px_120px_110px] gap-4 items-center p-4 hover:bg-pearl/5 transition-colors cursor-pointer"
              >
                {/* Number */}
                <span className="font-bold text-ink text-sm md:text-base">#{pedido.numero}</span>

                {/* Cliente */}
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm md:text-base line-clamp-1">
                    {pedido.cliente.nome}
                  </p>
                  <p className="text-xs text-coal/50 font-mono mt-0.5">{pedido.cliente.telefone}</p>
                </div>

                {/* Data */}
                <span className="hidden md:block text-xs text-coal/65">
                  {new Date(pedido.criadoEm).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}{" "}
                  {new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>

                {/* Itens Count */}
                <span className="hidden md:block text-sm text-coal/70">
                  {pedido.itens.reduce((sum, item) => sum + item.quantidade, 0)} itens
                </span>

                {/* Valor Total */}
                <span className="text-sm font-semibold text-ink md:font-bold">
                  {currency(pedido.total)}
                </span>

                {/* Status Badge */}
                <div className="text-right md:text-center flex justify-end md:justify-center items-center">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${statusBadgeStyle[pedido.status]}`}>
                    {pedido.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-coal/45 text-sm">
            Nenhum pedido localizado para os critérios aplicados.
          </div>
        )}
      </div>
    </div>
  );
}
