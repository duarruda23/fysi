"use client";

import React, { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, CheckCircle2, XCircle, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import ClientOnly from "@/components/ClientOnly";
import type { Pedido, StatusPedido } from "@/lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const statusBadgeStyle: Record<StatusPedido, string> = {
  pendente: "border-amber-200 bg-amber-50 text-amber-800",
  aprovado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  recusado: "border-red-200 bg-red-50 text-red-800"
};

const statusIcons: Record<StatusPedido, React.ReactNode> = {
  pendente: <AlertCircle size={15} className="text-amber-600 animate-pulse" />,
  aprovado: <CheckCircle2 size={15} className="text-emerald-600" />,
  recusado: <XCircle size={15} className="text-red-600" />
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { pedidos, clienteLogado } = useStore();

  // Guard: Redirect if not logged in
  useEffect(() => {
    if (!clienteLogado) {
      router.push("/login?redirect=/meus-pedidos");
    }
  }, [clienteLogado, router]);

  // Normalization helper: strips all non-digit characters to match flexible formats
  const cleanPhone = (phoneStr: string) => {
    return phoneStr.replace(/\D/g, "");
  };

  // Filter orders matching the normalized phone number of the logged-in customer
  const matchingOrders = useMemo(() => {
    if (!clienteLogado) return [];
    const customerPhoneClean = cleanPhone(clienteLogado.telefone);
    return pedidos.filter((pedido) => {
      const orderPhoneClean = cleanPhone(pedido.cliente.telefone);
      return orderPhoneClean.includes(customerPhoneClean) || customerPhoneClean.includes(orderPhoneClean);
    });
  }, [pedidos, clienteLogado]);

  if (!clienteLogado) {
    return null; // Return empty placeholder during redirect
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-ink/10 pb-5 gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Acompanhamento</p>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">Meus Pedidos</h1>
          <p className="mt-2 text-sm text-coal/60">
            Acompanhe o status dos pedidos registrados sob sua conta
          </p>
        </div>
        
        {/* Info label */}
        <div className="bg-white border border-ink/8 rounded-lg px-4 py-2 text-xs text-ink self-start sm:self-auto shadow-line">
          <span className="text-coal/45 block uppercase font-semibold text-[9px] tracking-wider">Conta Vinculada</span>
          <span className="font-bold">{clienteLogado.nome}</span>
          <span className="text-coal/50 block font-mono text-[10px] mt-0.5">{clienteLogado.telefone}</span>
        </div>
      </div>

      {/* Results Section */}
      <ClientOnly>
        <div className="space-y-6">
          {matchingOrders.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-coal/50">
                Histórico de Pedidos ({matchingOrders.length})
              </h3>

              {matchingOrders.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-line hover:border-ink/20 transition-all"
                >
                  {/* Order header row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-ink/10 bg-pearl/20">
                    <div>
                      <span className="font-bold text-ink">Pedido #{pedido.numero}</span>
                      <span className="mx-2 text-coal/30">·</span>
                      <span className="text-xs text-coal/50">
                        {new Date(pedido.criadoEm).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusBadgeStyle[pedido.status]}`}>
                      {statusIcons[pedido.status]}
                      {pedido.status}
                    </span>
                  </div>

                  {/* Order items and totals */}
                  <div className="p-4 space-y-4">
                    {/* Items */}
                    <div className="space-y-2.5 border-b border-ink/5 pb-4">
                      {pedido.itens.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="font-semibold text-ink line-clamp-1">{item.nomePeca}</p>
                            <p className="text-xs text-coal/50">
                              Cor: {item.cor} · Tamanho: {item.tamanho} · Qtd {item.quantidade}
                            </p>
                          </div>
                          <span className="font-semibold text-ink shrink-0">
                            {currency(item.quantidade * item.precoUnitario)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Info & Comments */}
                    {pedido.status === "recusado" && pedido.motivoRecusa && (
                      <div className="rounded bg-red-50 border border-red-200 p-3 text-xs text-red-800 leading-relaxed animate-fade-in">
                        <strong>Observação da Loja:</strong> {pedido.motivoRecusa}
                      </div>
                    )}

                    {pedido.status === "aprovado" && (
                      <div className="rounded bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 leading-relaxed animate-fade-in">
                        <strong>Aprovado!</strong> Em breve nosso time enviará o código de envio ou dados para retirada no seu WhatsApp.
                      </div>
                    )}

                    {pedido.status === "pendente" && (
                      <div className="rounded bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
                        <strong>Em análise:</strong> Estamos conferindo nosso estoque. Entraremos em contato via WhatsApp em breve.
                      </div>
                    )}

                    {/* Total */}
                    <div className="pt-2 flex justify-between items-end text-sm">
                      <span className="font-semibold text-coal">Total do Pedido</span>
                      <span className="text-lg font-bold text-ink leading-none">{currency(pedido.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-ink/20 p-12 text-center space-y-4 max-w-md mx-auto">
              <ShoppingBag size={36} className="mx-auto text-coal/30" />
              <h3 className="font-serif text-lg font-bold text-ink">Nenhum pedido realizado</h3>
              <p className="text-xs text-coal/50 leading-relaxed">
                Você ainda não realizou pedidos em nossa loja com o telefone cadastrado. Explore nosso catálogo e faça sua primeira reserva!
              </p>
              <div className="pt-2">
                <Link
                  href="/produtos"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded bg-ink hover:bg-coal text-white text-xs font-semibold px-5 transition-all shadow-md"
                >
                  Ir para Catálogo
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </ClientOnly>
    </div>
  );
}
