"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { 
  Package, 
  ClipboardList, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight, 
  Eye, 
  DollarSign, 
  Percent, 
  ShoppingBag, 
  BarChart3 
} from "lucide-react";
import type { StatusPedido } from "@/lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function AdminDashboard() {
  const { pecas, pedidos } = useStore();

  // 1. Core KPIs
  const activePiecesCount = useMemo(() => {
    return pecas.filter((p) => p.ativo).length;
  }, [pecas]);

  const pendingOrdersCount = useMemo(() => {
    return pedidos.filter((o) => o.status === "pendente").length;
  }, [pedidos]);

  // Low stock check: any active piece variation has <= 5 units
  const lowStockPieces = useMemo(() => {
    return pecas.filter((peca) => {
      if (!peca.ativo) return false;
      return peca.variacoes.some((v) => v.quantidadeEstoque <= 5);
    });
  }, [pecas]);

  const faturamentoAprovado = useMemo(() => {
    return pedidos
      .filter((o) => o.status === "aprovado")
      .reduce((sum, o) => sum + o.total, 0);
  }, [pedidos]);

  // 2. Advanced B2B/Wholesale Stats
  const stats = useMemo(() => {
    const approvedOrders = pedidos.filter(p => p.status === "aprovado");
    const totalOrdersCount = pedidos.length;
    const approvedOrdersCount = approvedOrders.length;
    
    let totalItemsSold = 0;
    approvedOrders.forEach(o => {
      o.itens.forEach(item => {
        totalItemsSold += item.quantidade;
      });
    });

    const averageTicket = approvedOrdersCount > 0 ? faturamentoAprovado / approvedOrdersCount : 0;
    const averageItemsPerOrder = approvedOrdersCount > 0 ? totalItemsSold / approvedOrdersCount : 0;
    const conversionRate = totalOrdersCount > 0 ? (approvedOrdersCount / totalOrdersCount) * 100 : 0;

    return {
      totalItemsSold,
      averageTicket,
      averageItemsPerOrder,
      conversionRate,
      approvedOrdersCount
    };
  }, [pedidos, faturamentoAprovado]);

  // 3. Category Sales breakdown (CSS bars)
  const categorySales = useMemo(() => {
    const breakdown: Record<string, number> = {};
    const approvedOrders = pedidos.filter(p => p.status === "aprovado");
    
    approvedOrders.forEach(o => {
      o.itens.forEach(item => {
        const p = pecas.find(peca => peca.id === item.pecaId);
        const cat = p?.categoria || "Outros";
        breakdown[cat] = (breakdown[cat] || 0) + (item.quantidade * item.precoUnitario);
      });
    });

    const items = Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    const maxValue = Math.max(...items.map(i => i.value), 1);
    
    return items.map(item => ({
      ...item,
      percentage: (item.value / maxValue) * 100
    })).sort((a, b) => b.value - a.value);
  }, [pedidos, pecas]);

  // 4. Top Selling Items
  const topSellingPieces = useMemo(() => {
    const counts: Record<string, { nome: string; preco: number; qtd: number; total: number; foto: string }> = {};
    const approvedOrders = pedidos.filter(p => p.status === "aprovado");

    approvedOrders.forEach(o => {
      o.itens.forEach(item => {
        if (!counts[item.pecaId]) {
          const originalPeca = pecas.find(p => p.id === item.pecaId);
          counts[item.pecaId] = {
            nome: item.nomePeca,
            preco: item.precoUnitario,
            qtd: 0,
            total: 0,
            foto: originalPeca?.fotos[0] || "/brand/logo-preto.png"
          };
        }
        counts[item.pecaId].qtd += item.quantidade;
        counts[item.pecaId].total += item.quantidade * item.precoUnitario;
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);
  }, [pedidos, pecas]);

  // 5. Pending orders list for sidebar preview
  const pendingOrders = useMemo(() => {
    return pedidos
      .filter((o) => o.status === "pendente")
      .slice(0, 4);
  }, [pedidos]);

  // 6. Low stock list for sidebar preview
  const lowStockItemsBreakdown = useMemo(() => {
    const list: { pecaId: string; nome: string; SKU: string; cor: string; tamanho: string; estoque: number }[] = [];
    
    pecas.forEach((peca) => {
      if (!peca.ativo) return;
      peca.variacoes.forEach((v) => {
        if (v.quantidadeEstoque <= 5) {
          list.push({
            pecaId: peca.id,
            nome: peca.nome,
            SKU: peca.referencia,
            cor: v.cor,
            tamanho: v.tamanho,
            estoque: v.quantidadeEstoque
          });
        }
      });
    });

    return list.slice(0, 4);
  }, [pecas]);

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink font-serif md:text-3xl">Dashboard de Atacado</h2>
        <p className="text-sm text-coal/60">Análise de desempenho B2B, faturamento comercial e chamados de vendas.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Approved Billing */}
        <div className="bg-white rounded-xl border border-ink/10 p-5 shadow-line flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-semibold tracking-wider text-coal/45 block">Receita Comercial</span>
            <p className="text-2xl font-bold text-ink leading-none">{currency(faturamentoAprovado)}</p>
            <p className="text-[10px] text-moss font-semibold uppercase tracking-wider mt-1 block">
              {stats.approvedOrdersCount} pedidos fechados
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-pearl flex items-center justify-center text-gold">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white rounded-xl border border-ink/10 p-5 shadow-line flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-semibold tracking-wider text-coal/45 block">Ticket Médio</span>
            <p className="text-2xl font-bold text-ink leading-none">{currency(stats.averageTicket)}</p>
            <p className="text-[10px] text-coal/50 block">Média por pedido aprovado</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-pearl flex items-center justify-center text-ink/70">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Average Items per Order */}
        <div className="bg-white rounded-xl border border-ink/10 p-5 shadow-line flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-semibold tracking-wider text-coal/45 block">Itens por Pedido</span>
            <p className="text-2xl font-bold text-ink leading-none">
              {stats.averageItemsPerOrder.toFixed(1)} <span className="text-xs font-normal text-coal/50">pcs</span>
            </p>
            <p className="text-[10px] text-coal/50 block">Média de peças/lote</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-pearl flex items-center justify-center text-ink/70">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Order Approval Conversion Rate */}
        <div className="bg-white rounded-xl border border-ink/10 p-5 shadow-line flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-semibold tracking-wider text-coal/45 block">Conversão</span>
            <p className="text-2xl font-bold text-ink leading-none">{stats.conversionRate.toFixed(1)}%</p>
            <p className="text-[10px] text-coal/50 block">Chamados convertidos em vendas</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-pearl flex items-center justify-center text-ink/70">
            <Percent size={20} />
          </div>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Pane: Detailed Wholesale charts and lists */}
        <div className="space-y-6">
          {/* Category Revenue card */}
          <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line">
            <div className="border-b border-ink/10 pb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-gold" />
              <h3 className="font-serif text-lg font-bold text-ink">
                Faturamento por Categoria
              </h3>
            </div>
            
            {categorySales.length > 0 ? (
              <div className="space-y-4 pt-1">
                {categorySales.map((cat) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-ink capitalize">{cat.name}</span>
                      <span className="text-gold">{currency(cat.value)}</span>
                    </div>
                    <div className="w-full bg-pearl rounded-full h-2">
                      <div 
                        className="bg-gold h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-coal/45 py-4 text-center">Nenhum dado de faturamento de categoria disponível.</p>
            )}
          </div>

          {/* Top Selling Products card */}
          <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line">
            <h3 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3">
              Produtos Mais Vendidos (Atacado)
            </h3>
            
            {topSellingPieces.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-ink/8">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-pearl/50 border-b border-ink/8 font-bold uppercase tracking-wider text-coal/50 text-[10px]">
                      <th className="py-2.5 px-3">Produto</th>
                      <th className="py-2.5 px-3 text-center">Peças Vendidas</th>
                      <th className="py-2.5 px-3 text-right">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {topSellingPieces.map((item, idx) => (
                      <tr key={idx} className="hover:bg-pearl/20 transition-colors">
                        <td className="py-2.5 px-3 flex items-center gap-2">
                          <img src={item.foto} alt="" className="h-8 w-6 object-cover rounded bg-linen border border-ink/5" />
                          <span className="font-bold text-ink line-clamp-1">{item.nome}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-coal/70">{item.qtd} un.</td>
                        <td className="py-2.5 px-3 text-right font-bold text-ink">{currency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-coal/45 py-4 text-center">Nenhum produto vendido no momento.</p>
            )}
          </div>
        </div>

        {/* Right Pane: Tasks / Alerts list */}
        <div className="space-y-6">
          {/* Pending Orders Alert */}
          <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 className="font-serif text-base font-bold text-ink">
                Pedidos para Revisão
              </h3>
              <Link
                href="/admin/pedidos?status=pendente"
                className="text-[10px] font-semibold tracking-wide text-gold hover:text-ink transition-colors flex items-center gap-0.5 uppercase"
              >
                Todos <ChevronRight size={12} />
              </Link>
            </div>

            {pendingOrders.length > 0 ? (
              <div className="divide-y divide-ink/5">
                {pendingOrders.map((pedido) => (
                  <div key={pedido.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0 text-xs">
                    <div>
                      <p className="font-bold text-ink">#{pedido.numero} - {pedido.cliente.nome.split(" ")[0]}</p>
                      <p className="text-[10px] text-coal/50 mt-0.5">
                        {pedido.itens.reduce((sum, item) => sum + item.quantidade, 0)} peças · {currency(pedido.total)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/pedidos/${pedido.id}`}
                      className="inline-flex h-7 items-center justify-center gap-1 rounded bg-ink hover:bg-coal text-white text-[10px] font-medium px-2.5 transition-colors"
                    >
                      <Eye size={10} />
                      <span>Revisar</span>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-coal/45 py-4 text-center">Nenhum pedido pendente.</p>
            )}
          </div>

          {/* Low Stock Reposition Alerts */}
          <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 className="font-serif text-base font-bold text-ink">
                Alerta de Reposição
              </h3>
              <Link
                href="/admin/pecas"
                className="text-[10px] font-semibold tracking-wide text-gold hover:text-ink transition-colors flex items-center gap-0.5 uppercase"
              >
                Peças <ChevronRight size={12} />
              </Link>
            </div>

            {lowStockItemsBreakdown.length > 0 ? (
              <div className="space-y-2.5">
                {lowStockItemsBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 text-xs border border-ink/8 p-3 rounded-lg hover:border-gold/45 hover:bg-pearl/20 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-ink line-clamp-1">{item.nome}</p>
                      <p className="text-[10px] text-coal/45 mt-0.5">
                        SKU: {item.SKU} · Cor: {item.cor} · Tam: {item.tamanho}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-clay/30 bg-clay/10 px-2 py-0.5 text-[10px] font-bold text-clay uppercase">
                        {item.estoque} un.
                      </span>
                      <Link
                        href={`/admin/pecas`}
                        className="p-1 text-coal/40 hover:text-ink hover:bg-pearl rounded"
                        title="Ver estoque"
                      >
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-coal/45 py-4 text-center">Todos os estoques estão adequados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
