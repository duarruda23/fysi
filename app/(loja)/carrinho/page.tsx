"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Trash2, ArrowRight, Minus, Plus, AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";
import ClientOnly from "@/components/ClientOnly";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function CartPage() {
  const { carrinho, pecas, updateCartQuantity, removeFromCart, configuracoes } = useStore();

  // Calculate cart totals
  const subtotal = useMemo(() => {
    return carrinho.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0);
  }, [carrinho]);

  const totalItens = useMemo(() => {
    return carrinho.reduce((sum, item) => sum + item.quantidade, 0);
  }, [carrinho]);

  const regrasAtacadoValidas = useMemo(() => {
    const atendePecas = totalItens >= configuracoes.minimoPecasAtacado;
    const atendeValor = subtotal >= configuracoes.valorMinimoAtacado;
    return atendePecas && atendeValor;
  }, [totalItens, subtotal, configuracoes]);

  // Map cart items to pieces to obtain the photo
  const cartWithPhotos = useMemo(() => {
    return carrinho.map((item) => {
      const pecaObj = pecas.find((p) => p.id === item.pecaId);
      const varObj = pecaObj?.variacoes.find((v) => v.id === item.variacaoId);
      
      return {
        ...item,
        foto: pecaObj?.fotos[0] || "/brand/logo-preto.png",
        referencia: pecaObj?.referencia || "SKU",
        maxStock: varObj?.quantidadeEstoque || 99
      };
    });
  }, [carrinho, pecas]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Suas Escolhas</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">Carrinho</h1>
      </div>

      <ClientOnly>
        {cartWithPhotos.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            {/* Left side: Items list */}
            <div className="space-y-4">
              <div className="rounded-xl border border-ink/10 bg-white overflow-hidden shadow-line">
                <div className="hidden md:grid grid-cols-[120px_1fr_120px_120px_60px] gap-4 p-4 border-b border-ink/10 text-xs font-semibold uppercase tracking-wider text-coal/50 bg-pearl/20">
                  <span>Produto</span>
                  <span>Detalhes</span>
                  <span className="text-center">Quantidade</span>
                  <span className="text-right">Preço</span>
                  <span></span>
                </div>

                <div className="divide-y divide-ink/8">
                  {cartWithPhotos.map((item) => (
                    <div
                      key={item.variacaoId}
                      className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr_120px_120px_60px] gap-4 items-center p-4"
                    >
                      {/* Photo */}
                      <Link href={`/produtos/${item.pecaId}`} className="block aspect-[3/4] bg-linen rounded-md overflow-hidden border border-ink/10">
                        <img src={item.foto} alt={item.nomePeca} className="h-full w-full object-cover" />
                      </Link>

                      {/* Info */}
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs text-gold uppercase tracking-wider font-semibold">
                          {item.referencia}
                        </p>
                        <Link
                          href={`/produtos/${item.pecaId}`}
                          className="font-bold text-ink hover:text-gold transition-colors text-sm md:text-base line-clamp-1"
                        >
                          {item.nomePeca}
                        </Link>
                        <p className="text-xs text-coal/60">
                          Cor: <span className="font-semibold text-ink">{item.cor}</span> · Tamanho:{" "}
                          <span className="font-semibold text-ink">{item.tamanho}</span>
                        </p>
                        <p className="text-xs text-coal/40 md:hidden pt-1">
                          {currency(item.precoUnitario)} cada
                        </p>
                      </div>

                      {/* Quantity control */}
                      <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-center justify-center gap-1">
                        <div className="flex h-9 items-center border border-ink/10 bg-white rounded-md overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.variacaoId, item.quantidade - 1)}
                            className="px-2.5 h-full text-coal/65 hover:bg-pearl"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-ink">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.variacaoId, item.quantidade + 1)}
                            disabled={item.quantidade >= item.maxStock}
                            className="px-2.5 h-full text-coal/65 hover:bg-pearl disabled:opacity-30"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        {item.quantidade >= item.maxStock && (
                          <span className="text-[10px] text-clay font-medium text-center">
                            Limite de estoque
                          </span>
                        )}
                      </div>

                      {/* Price subtotal */}
                      <div className="text-right font-semibold text-ink text-sm md:text-base">
                        {currency(item.quantidade * item.precoUnitario)}
                      </div>

                      {/* Remove item */}
                      <div className="text-right md:text-center">
                        <button
                          onClick={() => removeFromCart(item.variacaoId)}
                          className="p-2 text-coal/40 hover:text-clay hover:bg-clay/5 rounded-full transition-all"
                          title="Remover item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/produtos"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-coal/70 hover:text-ink transition-colors"
                >
                  <ArrowLeft size={14} /> Continuar comprando
                </Link>
              </div>
            </div>

            {/* Right side: Totals summary */}
            <div className="space-y-4">
              {/* Wholesale constraints warning */}
              {!regrasAtacadoValidas && (
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-ink text-xs space-y-3 shadow-line">
                  <h4 className="font-bold flex items-center gap-1.5 text-red-800 uppercase tracking-wider text-[10px]">
                    <AlertTriangle size={14} /> Mínimos de Atacado não Atingidos
                  </h4>
                  <p className="text-[11px] leading-relaxed text-coal/80">
                    Como nossa loja atende exclusivamente no atacado, valide os requisitos abaixo:
                  </p>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-coal/70">Quantidade Mínima:</span>
                      <span className={`font-bold ${totalItens >= configuracoes.minimoPecasAtacado ? "text-emerald-700" : "text-red-700"}`}>
                        {totalItens} / {configuracoes.minimoPecasAtacado} peças
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-coal/70">Valor Mínimo:</span>
                      <span className={`font-bold ${subtotal >= configuracoes.valorMinimoAtacado ? "text-emerald-700" : "text-red-700"}`}>
                        {currency(subtotal)} / {currency(configuracoes.valorMinimoAtacado)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-ink/10 bg-white p-5 space-y-6 shadow-line">
                <h3 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3">
                  Resumo do Pedido
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-coal/65">
                    <span>Subtotal ({totalItens} itens)</span>
                    <span>{currency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-coal/65">
                    <span>Entrega</span>
                    <span className="text-moss font-semibold uppercase text-xs tracking-wider">
                      Grátis
                    </span>
                  </div>
                </div>

                <div className="border-t border-ink/10 pt-4 flex justify-between items-end">
                  <span className="text-sm font-semibold text-coal">Total Estimado</span>
                  <span className="text-2xl font-bold text-ink leading-none">{currency(subtotal)}</span>
                </div>

                <div className="pt-2">
                  {regrasAtacadoValidas ? (
                    <Link
                      href="/checkout"
                      className="w-full h-12 bg-ink hover:bg-coal text-white text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                    >
                      Finalizar Pedido
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full h-12 bg-ink/10 text-coal/35 text-sm font-bold rounded-md flex items-center justify-center gap-2 cursor-not-allowed border border-ink/5"
                    >
                      Mínimos de Atacado Pendentes
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-coal/45 text-center leading-relaxed">
                  Ao finalizar, seu pedido será enviado para aprovação da loja. Não realizamos cobrança de pagamento neste momento.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/20 p-16 text-center space-y-4 max-w-lg mx-auto">
            <ShoppingBag size={48} className="mx-auto text-coal/30" />
            <h2 className="font-serif text-2xl font-bold text-ink">Seu carrinho está vazio</h2>
            <p className="text-sm text-coal/60 leading-relaxed">
              Explore nosso catálogo, escolha suas variações de cor e tamanho ideais e monte o seu pedido.
            </p>
            <div className="pt-2">
              <Link
                href="/produtos"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-gold px-6 text-sm font-bold text-ink hover:bg-gold/90 transition-all shadow-md"
              >
                Escolher Produtos
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </ClientOnly>
    </div>
  );
}
