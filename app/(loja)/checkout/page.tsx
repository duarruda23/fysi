"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import ClientOnly from "@/components/ClientOnly";
import { trackInitiateCheckoutEvent } from "@/components/AnalyticsScripts";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function CheckoutPage() {
  const { carrinho, addPedido, clienteLogado, promocoes, configuracoes } = useStore();
  const router = useRouter();

  // Form states
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [opcaoEntrega, setOpcaoEntrega] = useState<"retirada" | "entrega">("entrega");
  const [endereco, setEndereco] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon states
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

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

  // Guard: Redirect if not logged in
  useEffect(() => {
    if (!clienteLogado) {
      router.push("/login?redirect=/checkout");
      return;
    }
    setNome(clienteLogado.nome);
    setTelefone(clienteLogado.telefone);
    setEndereco(clienteLogado.endereco || "");
  }, [clienteLogado, router]);

  // Redirect if cart is empty or wholesale rules not met
  useEffect(() => {
    if (carrinho.length === 0) {
      router.push("/carrinho");
    } else if (!regrasAtacadoValidas) {
      router.push("/carrinho");
    }
  }, [carrinho, regrasAtacadoValidas, router]);

  // Track InitiateCheckout on mount
  useEffect(() => {
    if (carrinho.length > 0 && regrasAtacadoValidas) {
      trackInitiateCheckoutEvent(carrinho, subtotal);
    }
  }, [carrinho, subtotal, regrasAtacadoValidas]);

  // Calculate totals


  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return subtotal * (appliedCoupon.descontoPercentual / 100);
  }, [subtotal, appliedCoupon]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const matchedPromo = promocoes.find(
      (p) => p.ativo && p.cupom?.toUpperCase() === code
    );

    if (matchedPromo) {
      setAppliedCoupon(matchedPromo);
      setCouponInput("");
    } else {
      setCouponError("Cupom inválido ou expirado.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!telefone.trim()) newErrors.telefone = "WhatsApp / Telefone é obrigatório";
    if (opcaoEntrega === "entrega" && !endereco.trim()) {
      newErrors.endereco = "Endereço é obrigatório para entrega";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Format delivery address if pickup selected
    const finalEndereco = opcaoEntrega === "retirada" ? "Retirada na loja física Fysi" : endereco;

    setTimeout(() => {
      const newOrder = addPedido(
        {
          nome,
          telefone,
          endereco: finalEndereco
        },
        appliedCoupon?.cupom,
        appliedCoupon?.descontoPercentual
      );

      setIsSubmitting(false);

      if (newOrder) {
        router.push(`/checkout/confirmacao/${newOrder.id}`);
      } else {
        alert("Erro ao finalizar o pedido. O carrinho pode estar vazio.");
      }
    }, 1000); // Small delay for UX loading effect
  };

  if (carrinho.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/carrinho"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-coal/60 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} /> Voltar para o carrinho
        </Link>
        <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">
          Finalizar Pedido
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left column: Checkout form */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-ink/10 p-6 space-y-6 shadow-line">
            <h2 className="font-serif text-xl font-bold text-ink border-b border-ink/10 pb-3">
              Informações de Contato & Entrega
            </h2>

            {/* Nome */}
            <div className="space-y-2">
              <label htmlFor="nome" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome e sobrenome"
                className={`w-full h-11 px-3 rounded-md border text-sm text-ink outline-none transition-colors ${
                  errors.nome ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                }`}
              />
              {errors.nome && <p className="text-xs text-clay font-medium">{errors.nome}</p>}
            </div>

            {/* WhatsApp / Telefone */}
            <div className="space-y-2">
              <label htmlFor="telefone" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                WhatsApp / Telefone *
              </label>
              <input
                type="tel"
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: (11) 99999-9999"
                className={`w-full h-11 px-3 rounded-md border text-sm text-ink outline-none transition-colors ${
                  errors.telefone ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                }`}
              />
              <p className="text-[10px] text-coal/45">
                Utilize este número para consultar seus pedidos posteriormente na página &quot;Meus Pedidos&quot;.
              </p>
              {errors.telefone && <p className="text-xs text-clay font-medium">{errors.telefone}</p>}
            </div>

            {/* Entrega ou Retirada */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                Opção de Envio
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOpcaoEntrega("entrega")}
                  className={`h-12 border rounded-md text-sm font-semibold flex flex-col items-center justify-center transition-all ${
                    opcaoEntrega === "entrega"
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink hover:border-ink/25"
                  }`}
                >
                  <span>Entrega Residencial</span>
                  <span className="text-[10px] opacity-75 font-normal">Envio via transportadora</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpcaoEntrega("retirada")}
                  className={`h-12 border rounded-md text-sm font-semibold flex flex-col items-center justify-center transition-all ${
                    opcaoEntrega === "retirada"
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink hover:border-ink/25"
                  }`}
                >
                  <span>Retirada na Loja</span>
                  <span className="text-[10px] opacity-75 font-normal">Grátis · Pronta em até 24h</span>
                </button>
              </div>
            </div>

            {/* Endereco */}
            {opcaoEntrega === "entrega" && (
              <div className="space-y-2 animate-fade-in">
                <label htmlFor="endereco" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                  Endereço de Entrega *
                </label>
                <textarea
                  id="endereco"
                  rows={3}
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número, complemento, bairro, cidade e CEP"
                  className={`w-full p-3 rounded-md border text-sm text-ink outline-none resize-none transition-colors ${
                    errors.endereco ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                  }`}
                />
                {errors.endereco && <p className="text-xs text-clay font-medium">{errors.endereco}</p>}
              </div>
            )}

            {opcaoEntrega === "retirada" && (
              <div className="rounded-md bg-pearl p-4 border border-ink/8 text-xs text-coal/70 leading-relaxed space-y-1">
                <p className="font-semibold text-ink">Endereço de retirada:</p>
                <p>Showroom Fysi - Av. Paulista, 1000 - Cj. 42</p>
                <p>Bela Vista, São Paulo - SP</p>
                <p className="pt-1.5 font-medium text-gold">Avisaremos você no WhatsApp assim que o pedido for aprovado e estiver pronto para retirada!</p>
              </div>
            )}

            {/* Confirm CTA */}
            <div className="pt-4 border-t border-ink/10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gold text-ink text-sm font-bold rounded-md flex items-center justify-center gap-2 hover:bg-gold/90 transition-all active:scale-95 shadow-md disabled:bg-gold/50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Criando Chamado de Pedido...</span>
                ) : (
                  <>
                    <span>Confirmar & Enviar Pedido</span>
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Cart preview */}
        <div>
          <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-4 shadow-line sticky top-24">
            <h3 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3 flex items-center justify-between">
              <span>Resumo do Pedido</span>
              <span className="text-xs uppercase font-sans font-bold bg-pearl px-2.5 py-0.5 rounded-full border border-ink/10">
                {carrinho.reduce((s, i) => s + i.quantidade, 0)} itens
              </span>
            </h3>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto divide-y divide-ink/5 pr-1">
              {carrinho.map((item) => (
                <div key={item.variacaoId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="h-14 w-10 shrink-0 bg-linen rounded-md overflow-hidden border border-ink/10">
                    {/* We don't have the piece object here directly, we render a default thumbnail style */}
                    <div className="h-full w-full bg-linen flex items-center justify-center text-[10px] font-bold text-coal/45">
                      Fysi
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-ink line-clamp-1">{item.nomePeca}</p>
                    <p className="text-[10px] text-coal/50">
                      {item.cor} · {item.tamanho} · Qtd {item.quantidade}
                    </p>
                    <p className="text-xs font-semibold text-ink">
                      {currency(item.quantidade * item.precoUnitario)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon input */}
            <div className="border-t border-ink/10 pt-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-coal/50 block">Cupom de Desconto</span>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded px-3 py-2 text-xs text-emerald-800 animate-fade-in">
                  <span className="font-semibold">{appliedCoupon.cupom} (-{appliedCoupon.descontoPercentual}%)</span>
                  <button type="button" onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700 font-bold">Remover</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Ex: FYSI10"
                    className="flex-1 h-9 px-2.5 rounded border border-ink/10 text-xs uppercase outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="h-9 px-4 bg-ink text-white rounded text-xs font-semibold hover:bg-coal transition-all active:scale-95"
                  >
                    Aplicar
                  </button>
                </div>
              )}
              {couponError && <p className="text-[10px] text-clay font-medium">{couponError}</p>}
            </div>

            {/* Subtotal / Discount breakdown */}
            <div className="border-t border-ink/10 pt-4 space-y-1.5 text-xs text-coal/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Desconto (Cupom {appliedCoupon.cupom})</span>
                  <span>-{currency(discount)}</span>
                </div>
              )}
            </div>

            {/* Total value */}
            <div className="border-t border-ink/10 pt-3 flex justify-between items-end">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="text-xl font-bold text-ink leading-none">{currency(total)}</span>
            </div>

            <div className="rounded bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 leading-normal">
              <strong>Importante:</strong> Este é um pedido de reserva sob aprovação. A loja confirmará a disponibilidade das peças e entrará em contato para combinar o recebimento e entrega.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
