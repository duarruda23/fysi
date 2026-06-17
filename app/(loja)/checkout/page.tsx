"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
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

  // Endereço — campos separados
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

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
    // Não pre-preenche endereço — usuário preenche os campos separados
  }, [clienteLogado, router]);

  // Busca CEP via ViaCEP
  const handleCepBlur = useCallback(async () => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    setCepError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado.");
        return;
      }
      setRua(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setEstado(data.uf || "");
      // Focar no campo número após preencher
      document.getElementById("numero")?.focus();
    } catch {
      setCepError("Erro ao buscar CEP. Verifique sua conexão.");
    } finally {
      setCepLoading(false);
    }
  }, [cep]);

  // Formata CEP com máscara 00000-000
  const handleCepChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
    setCepError("");
  };

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
    if (opcaoEntrega === "entrega") {
      if (!cep.trim()) newErrors.cep = "CEP é obrigatório";
      if (!rua.trim()) newErrors.rua = "Rua é obrigatória";
      if (!numero.trim()) newErrors.numero = "Número é obrigatório";
      if (!bairro.trim()) newErrors.bairro = "Bairro é obrigatório";
      if (!cidade.trim()) newErrors.cidade = "Cidade é obrigatória";
      if (!estado.trim()) newErrors.estado = "Estado é obrigatório";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Monta endereço completo a partir dos campos separados
    const enderecoCompleto = opcaoEntrega === "retirada"
      ? "Retirada na loja física Fysi"
      : [
          `${rua}, ${numero}${complemento ? ` - ${complemento}` : ""}`,
          bairro,
          `${cidade} - ${estado}`,
          `CEP: ${cep}`,
        ].join(", ");

    try {
      const newOrder = await addPedido(
        {
          nome,
          telefone,
          endereco: enderecoCompleto
        },
        appliedCoupon?.cupom,
        appliedCoupon?.descontoPercentual
      );

      if (newOrder) {
        router.push(`/checkout/confirmacao/${newOrder.id}`);
      } else {
        alert("Erro ao finalizar o pedido. O carrinho pode estar vazio.");
      }
    } catch {
      alert("Erro ao finalizar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
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

            {/* Endereço de entrega — campos separados */}
            {opcaoEntrega === "entrega" && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-t border-ink/10 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-coal/60 mb-4">
                    Endereço de Entrega
                  </p>

                  {/* CEP */}
                  <div className="space-y-1.5 mb-4">
                    <label htmlFor="cep" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                      CEP *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cep"
                        value={cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        onBlur={handleCepBlur}
                        placeholder="00000-000"
                        maxLength={9}
                        className={`w-full h-11 px-3 pr-10 rounded-md border text-sm text-ink outline-none transition-colors ${
                          errors.cep ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                        }`}
                      />
                      {cepLoading && (
                        <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-coal/40" />
                      )}
                    </div>
                    {cepError && <p className="text-xs text-clay font-medium">{cepError}</p>}
                    {errors.cep && <p className="text-xs text-clay font-medium">{errors.cep}</p>}
                    <p className="text-[10px] text-coal/45">Digite o CEP para preencher o endereço automaticamente.</p>
                  </div>

                  {/* Rua + Número */}
                  <div className="grid grid-cols-[1fr_120px] gap-3 mb-4">
                    <div className="space-y-1.5">
                      <label htmlFor="rua" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                        Rua / Logradouro *
                      </label>
                      <input
                        type="text"
                        id="rua"
                        value={rua}
                        onChange={(e) => setRua(e.target.value)}
                        placeholder="Nome da rua"
                        className={`w-full h-11 px-3 rounded-md border text-sm text-ink outline-none transition-colors ${
                          errors.rua ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                        }`}
                      />
                      {errors.rua && <p className="text-xs text-clay font-medium">{errors.rua}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="numero" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                        Número *
                      </label>
                      <input
                        type="text"
                        id="numero"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        placeholder="Ex: 123"
                        className={`w-full h-11 px-3 rounded-md border text-sm text-ink outline-none transition-colors ${
                          errors.numero ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                        }`}
                      />
                      {errors.numero && <p className="text-xs text-clay font-medium">{errors.numero}</p>}
                    </div>
                  </div>

                  {/* Complemento */}
                  <div className="space-y-1.5 mb-4">
                    <label htmlFor="complemento" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                      Complemento <span className="normal-case font-normal text-coal/40">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      id="complemento"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Apto, bloco, sala..."
                      className="w-full h-11 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink transition-colors"
                    />
                  </div>

                  {/* Bairro */}
                  <div className="space-y-1.5 mb-4">
                    <label htmlFor="bairro" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      id="bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Nome do bairro"
                      className={`w-full h-11 px-3 rounded-md border text-sm text-ink outline-none transition-colors ${
                        errors.bairro ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                      }`}
                    />
                    {errors.bairro && <p className="text-xs text-clay font-medium">{errors.bairro}</p>}
                  </div>

                  {/* Cidade + Estado */}
                  <div className="grid grid-cols-[1fr_80px] gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="cidade" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        id="cidade"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        placeholder="São Paulo"
                        className={`w-full h-11 px-3 rounded-md border text-sm text-ink outline-none transition-colors ${
                          errors.cidade ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                        }`}
                      />
                      {errors.cidade && <p className="text-xs text-clay font-medium">{errors.cidade}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="estado" className="text-xs font-semibold uppercase tracking-wider text-coal/60 block">
                        UF *
                      </label>
                      <input
                        type="text"
                        id="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                        placeholder="SP"
                        maxLength={2}
                        className={`w-full h-11 px-3 rounded-md border text-sm text-ink outline-none transition-colors uppercase ${
                          errors.estado ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                        }`}
                      />
                      {errors.estado && <p className="text-xs text-clay font-medium">{errors.estado}</p>}
                    </div>
                  </div>
                </div>
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
