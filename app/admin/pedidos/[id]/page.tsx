"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Phone, MapPin, Calendar, Clock, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import type { StatusPedido } from "@/lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const statusBadgeStyle: Record<StatusPedido, string> = {
  pendente: "border-amber-200 bg-amber-50 text-amber-800",
  aprovado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  recusado: "border-red-200 bg-red-50 text-red-800"
};

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { pedidos, pecas, responderPedido } = useStore();
  const router = useRouter();
  const [showRefusalForm, setShowRefusalForm] = useState(false);
  const [motivo, setMotivo] = useState("");

  const pedido = useMemo(() => {
    return pedidos.find((p) => p.id === params.id);
  }, [pedidos, params.id]);

  // Map items to pieces to show photos
  const itemsWithPhotos = useMemo(() => {
    if (!pedido) return [];
    return pedido.itens.map((item) => {
      const pecaObj = pecas.find((p) => p.id === item.pecaId);
      return {
        ...item,
        foto: pecaObj?.fotos[0] || "/brand/logo-preto.png",
        referencia: pecaObj?.referencia || "SKU"
      };
    });
  }, [pedido, pecas]);

  if (!pedido) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-ink">Pedido não encontrado</h2>
        <p className="text-coal/60">O chamado do pedido procurado não existe ou foi removido.</p>
        <Link
          href="/admin/pedidos"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-6 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} /> Voltar para Pedidos
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    if (confirm(`Deseja aprovar o pedido #${pedido.numero}? Isto irá debitar as quantidades correspondentes do estoque.`)) {
      responderPedido(pedido.id, "aprovado");
    }
  };

  const handleRefuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      alert("Por favor, digite o motivo da recusa.");
      return;
    }

    responderPedido(pedido.id, "recusado", motivo);
    setShowRefusalForm(false);
    setMotivo("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-coal/60 hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} /> Voltar para listagem
          </Link>
          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Pedido #{pedido.numero}
          </h2>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-wider self-start sm:self-auto ${statusBadgeStyle[pedido.status]}`}>
          {pedido.status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Left pane: items & logs */}
        <div className="space-y-6">
          {/* Items card */}
          <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line">
            <h3 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-gold" />
              Peças Solicitadas
            </h3>

            <div className="divide-y divide-ink/8">
              {itemsWithPhotos.map((item, index) => (
                <div key={index} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                  <div className="h-16 w-12 bg-linen rounded overflow-hidden border border-ink/10 shrink-0">
                    <img src={item.foto} alt={item.nomePeca} className="h-full w-full object-cover" />
                  </div>
                  
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="text-[10px] font-mono text-gold uppercase tracking-wider font-semibold">
                      {item.referencia}
                    </span>
                    <h4 className="font-bold text-ink text-sm md:text-base line-clamp-1">
                      {item.nomePeca}
                    </h4>
                    <p className="text-xs text-coal/55">
                      Cor: <span className="font-semibold text-ink">{item.cor}</span> · Tamanho:{" "}
                      <span className="font-semibold text-ink">{item.tamanho}</span>
                    </p>
                  </div>

                  <div className="text-right pl-3 shrink-0">
                    <p className="text-xs text-coal/45">
                      {item.quantidade} x {currency(item.precoUnitario)}
                    </p>
                    <p className="font-bold text-ink text-sm md:text-base mt-0.5">
                      {currency(item.quantidade * item.precoUnitario)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total value info */}
            <div className="border-t border-ink/10 pt-4 flex justify-between items-end">
              <span className="text-sm font-semibold text-coal">Valor Total Solicitado</span>
              <span className="text-2xl font-bold text-ink">{currency(pedido.total)}</span>
            </div>
          </div>

          {/* Action Decision Block */}
          {pedido.status === "pendente" && !showRefusalForm && (
            <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line">
              <h3 className="font-serif text-lg font-bold text-ink">Análise de Chamado</h3>
              <p className="text-xs text-coal/60">
                Verifique se os itens acima possuem estoque físico reservado antes de aprovar. A aprovação é irreversível.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 h-11 bg-moss hover:bg-moss/90 text-white font-semibold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                >
                  <CheckCircle2 size={16} />
                  <span>Aprovar Chamado</span>
                </button>
                <button
                  onClick={() => setShowRefusalForm(true)}
                  className="flex-1 h-11 bg-clay hover:bg-clay/90 text-white font-semibold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                >
                  <XCircle size={16} />
                  <span>Recusar Chamado</span>
                </button>
              </div>
            </div>
          )}

          {/* Refusal Form block */}
          {showRefusalForm && (
            <form onSubmit={handleRefuse} className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line animate-fade-in">
              <h3 className="font-serif text-lg font-bold text-clay flex items-center gap-1.5">
                <XCircle size={18} />
                Justificar Recusa de Chamado
              </h3>
              
              <div className="space-y-2">
                <label htmlFor="motivo" className="text-xs font-semibold uppercase tracking-wider text-coal/65">
                  Motivo da Recusa *
                </label>
                <textarea
                  id="motivo"
                  required
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Produto esgotado no tamanho selecionado / Cliente desistiu da reserva..."
                  className="w-full p-3 rounded-md border border-ink/10 text-sm text-ink outline-none resize-none focus:border-ink"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRefusalForm(false);
                    setMotivo("");
                  }}
                  className="h-10 border border-ink/15 hover:bg-pearl text-ink font-semibold rounded-md px-4 text-xs"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-clay hover:bg-clay/90 text-white font-semibold rounded-md px-4 text-xs flex items-center justify-center gap-1"
                >
                  <CheckCircle2 size={14} />
                  <span>Confirmar Recusa</span>
                </button>
              </div>
            </form>
          )}

          {/* Locked Log Info (If already processed) */}
          {pedido.status !== "pendente" && (
            <div className="bg-pearl rounded-xl border border-ink/10 p-5 space-y-3.5 text-sm">
              <h3 className="font-bold text-ink flex items-center gap-2">
                <Clock size={16} className="text-gold" />
                Histórico do Chamado (Finalizado)
              </h3>
              <div className="text-xs text-coal/70 space-y-2 leading-relaxed">
                <p>
                  Este pedido foi marcado como{" "}
                  <span className={`font-bold uppercase ${pedido.status === "aprovado" ? "text-moss" : "text-clay"}`}>
                    {pedido.status}
                  </span>{" "}
                  e está trancado para modificações adicionais.
                </p>
                {pedido.respondidoEm && (
                  <p>
                    <strong>Respondido em:</strong>{" "}
                    {new Date(pedido.respondidoEm).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    })}{" "}
                    às{" "}
                    {new Date(pedido.respondidoEm).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                )}
                {pedido.status === "recusado" && pedido.motivoRecusa && (
                  <div className="mt-2.5 p-3 rounded bg-red-50 border border-red-200 text-red-800">
                    <strong>Motivo da Recusa:</strong> {pedido.motivoRecusa}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right pane: client details & logs */}
        <div className="space-y-6">
          {/* Client contact info */}
          <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line">
            <h3 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3 flex items-center gap-2">
              <Phone size={16} className="text-gold" />
              Dados do Cliente
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-coal/45 uppercase tracking-wider block">Nome Completo</span>
                <p className="font-bold text-ink text-sm">{pedido.cliente.nome}</p>
              </div>

              <div className="space-y-0.5">
                <span className="font-semibold text-coal/45 uppercase tracking-wider block">WhatsApp / Telefone</span>
                <a
                  href={`https://wa.me/${pedido.cliente.telefone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-gold hover:underline flex items-center gap-1 text-sm mt-0.5"
                >
                  {pedido.cliente.telefone}
                </a>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-coal/45 uppercase tracking-wider block">Destino de Envio</span>
                <div className="flex gap-1.5 items-start mt-0.5 text-coal/80 leading-relaxed font-medium">
                  <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                  <p>{pedido.cliente.endereco || "Endereço não fornecido"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Creation Metadata Card */}
          <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line">
            <h3 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3 flex items-center gap-2">
              <Calendar size={16} className="text-gold" />
              Metadados
            </h3>

            <div className="space-y-3.5 text-xs text-coal/70">
              <div>
                <span className="font-semibold text-coal/45 uppercase tracking-wider block mb-1">Registrado Em</span>
                <p className="font-medium text-ink">
                  {new Date(pedido.criadoEm).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}{" "}
                  {new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
              
              <div>
                <span className="font-semibold text-coal/45 uppercase tracking-wider block mb-1">ID do Pedido</span>
                <code className="bg-pearl px-1.5 py-0.5 rounded border border-ink/8 text-[10px] break-all select-all block font-mono text-ink">
                  {pedido.id}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
