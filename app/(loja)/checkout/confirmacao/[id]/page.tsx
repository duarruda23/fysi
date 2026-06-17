"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Check, ClipboardList, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import ClientOnly from "@/components/ClientOnly";
import { trackPurchaseEvent } from "@/components/AnalyticsScripts";
import { useEffect } from "react";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  const { pedidos } = useStore();

  const pedidoObj = useMemo(() => {
    return pedidos.find((p) => p.id === params.id);
  }, [pedidos, params.id]);

  useEffect(() => {
    if (pedidoObj) {
      trackPurchaseEvent(pedidoObj.id, pedidoObj.itens, pedidoObj.total);
    }
  }, [pedidoObj]);

  if (!pedidoObj) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-ink">Pedido não encontrado</h2>
        <p className="text-coal/60">Não foi possível localizar as informações para este pedido.</p>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-6 text-sm font-semibold text-white"
        >
          Ir para Página Inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Banner */}
      <div className="rounded-2xl border border-moss/20 bg-moss/5 p-8 text-center space-y-4 shadow-line">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss text-white shadow-soft">
          <Check size={24} />
        </div>
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold text-ink">
            Pedido nº {pedidoObj.numero} Recebido!
          </h1>
          <p className="text-sm font-semibold text-amber-700 animate-pulse bg-amber-50 border border-amber-100 rounded px-3 py-1.5 inline-block">
            Status: Aguardando aprovação da loja
          </p>
        </div>
        <p className="text-sm text-coal/65 leading-relaxed max-w-md mx-auto">
          Registramos o seu chamado no sistema. Agora, nossa equipe revisará a disponibilidade de estoque e entrará em contato para concluir a entrega.
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-white rounded-2xl border border-ink/10 p-6 space-y-6 shadow-line">
        <h2 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3">
          Resumo do Pedido
        </h2>

        {/* Client details */}
        <div className="grid gap-4 sm:grid-cols-2 text-sm border-b border-ink/10 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-coal/50">Cliente</span>
            <p className="font-bold text-ink">{pedidoObj.cliente.nome}</p>
            <p className="text-coal/70 text-xs">{pedidoObj.cliente.telefone}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-coal/50">Envio</span>
            <p className="font-bold text-ink leading-relaxed">
              {pedidoObj.cliente.endereco || "Não informado"}
            </p>
          </div>
        </div>

        {/* Items list */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-coal/50 block">Itens Solicitados</span>
          <div className="divide-y divide-ink/5">
            {pedidoObj.itens.map((item) => (
              <div key={item.variacaoId} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0 text-sm">
                <div>
                  <p className="font-bold text-ink">{item.nomePeca}</p>
                  <p className="text-xs text-coal/50">
                    Cor: {item.cor} · Tamanho: {item.tamanho} · Qtd {item.quantidade}
                  </p>
                </div>
                <span className="font-semibold text-ink">
                  {currency(item.quantidade * item.precoUnitario)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-ink/10 pt-4 flex justify-between items-end">
          <span className="text-sm font-semibold text-coal">Total</span>
          <span className="text-xl font-bold text-ink">{currency(pedidoObj.total)}</span>
        </div>
      </div>

      {/* Next steps guidelines */}
      <div className="bg-pearl border border-ink/10 rounded-xl p-5 space-y-3 text-sm">
        <h3 className="font-bold text-ink flex items-center gap-2">
          <ClipboardList size={16} className="text-gold" />
          Como funciona o fluxo de aprovação?
        </h3>
        <ol className="list-decimal pl-5 space-y-2 text-coal/70 text-xs leading-relaxed">
          <li>Seu pedido entra no painel do administrador da Fysi como <strong>Pendente</strong>.</li>
          <li>O administrador verifica se há estoque físico reservado para você.</li>
          <li>Ao <strong>Aprovar</strong> o pedido, o estoque das variações correspondentes é debitado no sistema.</li>
          <li>Nós entraremos em contato via WhatsApp para combinar o envio e os dados de pagamento.</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/meus-pedidos"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-6 text-sm font-semibold text-ink hover:bg-pearl transition-all"
        >
          <ClipboardList size={15} />
          Ver Meus Pedidos
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink hover:bg-coal text-white px-6 text-sm font-semibold transition-all"
        >
          Voltar para Loja
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
