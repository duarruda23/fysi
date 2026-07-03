"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Check, AlertTriangle, Minus, Plus, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Tamanho, VariacaoPeca, Avaliacao } from "@/lib/types";
import { trackAddToCartEvent, trackViewContentEvent } from "@/components/AnalyticsScripts";
import { Avaliacoes } from "@/components/Avaliacoes";
import FaqSection from "@/components/FaqSection";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/** Extrai o ID do vídeo de qualquer formato de URL do YouTube */
function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
    /youtube\.com\/shorts\/([^?&\s]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { pecas, addToCart, promocoes, inscreverVip, clienteLogado } = useStore();

  const peca = useMemo(() => {
    return pecas.find((p) => p.id === params.id);
  }, [pecas, params.id]);

  // Flag para disparar ViewContent apenas uma vez por produto
  const viewTracked = useRef(false);
  useEffect(() => {
    if (peca && !viewTracked.current) {
      viewTracked.current = true;
      trackViewContentEvent({
        id: peca.id,
        name: peca.nome,
        price: peca.precoAtacado,
        category: peca.categoria,
      });
    }
  }, [peca]);

  // States
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantidadesGrade, setQuantidadesGrade] = useState<Record<string, number>>({});
  const [vipSelectedSize, setVipSelectedSize] = useState<Tamanho | null>(null);
  const [addedMessage, setAddedMessage] = useState(false);
  const [infoTab, setInfoTab] = useState<"detalhes" | "envio" | "devolucoes">("detalhes");

  // VIP Waiting List States
  const [vipName, setVipName] = useState("");
  const [vipPhone, setVipPhone] = useState("");
  const [vipSuccess, setVipSuccess] = useState(false);
  const [vipError, setVipError] = useState("");
  const [vipLoading, setVipLoading] = useState(false);

  // Avaliações — busca do banco para exibir estrelas no painel lateral
  const [avaliacoesSummary, setAvaliacoesSummary] = useState<{ media: number; total: number }>({ media: 0, total: 0 });

  const fetchAvaliacoesSummary = useCallback(async () => {
    if (!peca) return;
    try {
      const res = await fetch(`/api/avaliacoes?peca_id=${peca.id}`);
      const data: Avaliacao[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const media = data.reduce((sum, a) => sum + a.nota, 0) / data.length;
        setAvaliacoesSummary({ media, total: data.length });
      }
    } catch { /* silencioso */ }
  }, [peca]);

  useEffect(() => {
    fetchAvaliacoesSummary();
  }, [fetchAvaliacoesSummary]);

  // Auto-prefill VIP name and phone if clienteLogado changes
  useEffect(() => {
    if (clienteLogado) {
      setVipName(clienteLogado.nome);
      setVipPhone(clienteLogado.telefone);
    }
  }, [clienteLogado]);

  // Get unique colors available
  const availableColors = useMemo(() => {
    if (!peca) return [];
    const list: { name: string; hex?: string }[] = [];
    peca.variacoes.forEach((v) => {
      if (!list.some((c) => c.name === v.cor)) {
        list.push({ name: v.cor, hex: v.corHex });
      }
    });
    return list;
  }, [peca]);

  // Handle fallback active color without triggers
  const activeColor = selectedColor || (availableColors[0]?.name ?? null);

  // Get sizes that have stock for the selected color
  const sizesForSelectedColor = useMemo(() => {
    if (!peca || !activeColor) return [];
    return peca.variacoes
      .filter((v) => v.cor === activeColor && v.quantidadeEstoque > 0)
      .map((v) => v.tamanho);
  }, [peca, activeColor]);

  // Get all sizes available for the active color (even if stock is 0)
  const sizesForColorExist = useMemo(() => {
    if (!peca || !activeColor) return [];
    return peca.variacoes
      .filter((v) => v.cor === activeColor)
      .map((v) => v.tamanho);
  }, [peca, activeColor]);

  // All sizes possible for this piece
  const allSizesForPiece = useMemo(() => {
    if (!peca) return [];
    const set = new Set<Tamanho>();
    peca.variacoes.forEach((v) => set.add(v.tamanho));
    return Array.from(set);
  }, [peca]);

  // Active promotion for this category
  const activePromo = useMemo(() => {
    if (!peca) return null;
    return promocoes.find(
      (p) => p.ativo && p.categoriaAlvo === peca.categoria && !p.cupom
    );
  }, [promocoes, peca]);

  const precoComDesconto = useMemo(() => {
    if (!peca) return 0;
    if (!activePromo) return peca.preco;
    return peca.preco * (1 - activePromo.descontoPercentual / 100);
  }, [peca, activePromo]);

  // Gallery Photos logic (up to 5 photos)
  const displayPhotos = useMemo(() => {
    if (!peca) return [];
    const photos = [...peca.fotos];
    while (photos.length < 5) {
      if (photos.length === 1) {
        photos.push(peca.fotos[0]); // Duplicate zoom detail
      } else if (photos.length === 2) {
        photos.push("/brand/logo-ouro.png");
      } else if (photos.length === 3) {
        photos.push("/brand/logo-preto.png");
      } else {
        photos.push(peca.fotos[0]);
      }
    }
    return photos;
  }, [peca]);

  // Reset quantities on activeColor change — inicializa todas as chaves com 0
  useEffect(() => {
    if (!peca) return;
    const initial: Record<string, number> = {};
    peca.variacoes
      .filter((v) => v.cor === (selectedColor ?? availableColors[0]?.name))
      .forEach((v) => { initial[v.tamanho] = 0; });
    setQuantidadesGrade(initial);
    setVipSelectedSize(null);
    setVipSuccess(false);
  }, [activeColor, peca]);

  const totalPecasSelecionadas = useMemo(() => {
    return Object.values(quantidadesGrade).reduce((sum, q) => sum + (isNaN(q) ? 0 : q), 0);
  }, [quantidadesGrade]);

  const valorTotalGrade = useMemo(() => {
    return totalPecasSelecionadas * precoComDesconto;
  }, [totalPecasSelecionadas, precoComDesconto]);

  // Handle Add Grade to Cart
  const handleAddGradeToCart = () => {
    if (totalPecasSelecionadas === 0 || !peca) return;

    Object.entries(quantidadesGrade).forEach(([size, qty]) => {
      if (qty > 0) {
        const vari = peca.variacoes.find((v) => v.cor === activeColor && v.tamanho === size);
        if (vari) {
          addToCart(peca, vari.id, qty);
          // Trigger analytics
          trackAddToCartEvent({
            id: peca.id,
            name: peca.nome,
            price: precoComDesconto,
            quantity: qty,
            color: activeColor || "",
            size: size
          });
        }
      }
    });

    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 4000);
  };

  // Handle Buy Now (Grade)
  const handleBuyNowGrade = () => {
    if (totalPecasSelecionadas === 0 || !peca) return;

    Object.entries(quantidadesGrade).forEach(([size, qty]) => {
      if (qty > 0) {
        const vari = peca.variacoes.find((v) => v.cor === activeColor && v.tamanho === size);
        if (vari) {
          addToCart(peca, vari.id, qty);
          // Trigger analytics
          trackAddToCartEvent({
            id: peca.id,
            name: peca.nome,
            price: precoComDesconto,
            quantity: qty,
            color: activeColor || "",
            size: size
          });
        }
      }
    });

    router.push("/carrinho");
  };

  // Handle VIP registration
  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!peca || !vipSelectedSize) return;

    // Tenta encontrar a variação exata; se não encontrar, usa fallback com cor/tamanho direto
    const targetVar = activeColor
      ? peca.variacoes.find((v) => v.cor === activeColor && v.tamanho === vipSelectedSize)
      : peca.variacoes.find((v) => v.tamanho === vipSelectedSize);

    const corFinal = activeColor || (targetVar?.cor ?? peca.variacoes[0]?.cor ?? "");
    const variacaoIdFinal = targetVar?.id ?? `${peca.id}-${corFinal}-${vipSelectedSize}`;

    setVipLoading(true);
    setVipError("");

    const result = await inscreverVip({
      clienteNome: vipName.trim(),
      clienteTelefone: vipPhone.trim(),
      pecaId: peca.id,
      pecaNome: peca.nome,
      variacaoId: variacaoIdFinal,
      cor: corFinal,
      tamanho: vipSelectedSize,
    });

    setVipLoading(false);

    if (!result.ok) {
      setVipError(result.error ?? "Erro ao realizar inscrição. Tente novamente.");
      return;
    }

    setVipSuccess(true);
    setVipName("");
    setVipPhone("");
    setTimeout(() => {
      setVipSuccess(false);
      setVipSelectedSize(null);
    }, 5000);
  };

  // If piece not found or inactive
  if (!peca || !peca.ativo) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-ink">Peça não encontrada</h2>
        <p className="text-coal/60">O produto que você está tentando acessar não existe ou está indisponível.</p>
        <Link
          href="/produtos"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-6 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} /> Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-coal/50 font-medium">
        <Link href="/produtos" className="hover:text-ink transition-colors">Produtos</Link>
        <span>&gt;</span>
        <span className="capitalize text-coal/60">{peca.categoria}</span>
        <span>&gt;</span>
        <span className="text-ink font-semibold">{peca.nome}</span>
      </nav>

      {/* Image Grid Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Destaque: vídeo YouTube (se configurado) ou foto principal */}
        {(() => {
          const youtubeId = getYoutubeId(peca.videoYoutube ?? "");
          if (youtubeId) {
            return (
              <div className="relative aspect-square overflow-hidden rounded-xl border border-ink/10 bg-ink shadow-sm">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                  title={`Vídeo de ${peca.nome}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                />
              </div>
            );
          }
          return (
            <div className="relative aspect-square overflow-hidden rounded-xl border border-ink/10 bg-linen shadow-sm group">
              <img
                src={displayPhotos[0] || "/brand/logo-preto.png"}
                alt={peca.nome}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
            </div>
          );
        })()}
        {/* 2x2 Grid of Thumbnails */}
        <div className="grid grid-cols-2 gap-3 aspect-square">
          {displayPhotos.slice(1, 5).map((photo, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl border border-ink/10 bg-linen shadow-sm group"
            >
              <img
                src={photo}
                alt=""
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-102 ${
                  photo.includes("logo") ? "p-8 object-contain opacity-60 bg-pearl" : ""
                }`}
              />
              {idx === 3 && (
                <button
                  onClick={() => alert("Exibindo todas as fotos em alta resolução da galeria Fysi.")}
                  className="absolute bottom-3 right-3 bg-white hover:bg-pearl text-ink text-[11px] font-bold px-3 py-1.5 rounded border border-ink/10 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                >
                  Ver todas as fotos
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left Column: Title, Description, Details and Tabs (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="font-serif text-3xl font-bold leading-tight text-ink md:text-4xl">
              {peca.nome}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-coal/75">
              {peca.descricao}
            </p>
          </div>

          {/* Bullet points section */}
          {peca.bullets && peca.bullets.length > 0 && (
            <div className="pt-2">
              <ul className="list-disc pl-5 text-sm text-coal/70 space-y-2">
                {peca.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tabs Section */}
          <div className="pt-4">
            <div className="flex border-b border-ink/10 gap-6">
              <button
                onClick={() => setInfoTab("detalhes")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  infoTab === "detalhes" ? "border-ink text-ink" : "border-transparent text-coal/45 hover:text-ink/80"
                }`}
              >
                Detalhes
              </button>
              <button
                onClick={() => setInfoTab("envio")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  infoTab === "envio" ? "border-ink text-ink" : "border-transparent text-coal/45 hover:text-ink/80"
                }`}
              >
                Envio
              </button>
              <button
                onClick={() => setInfoTab("devolucoes")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  infoTab === "devolucoes" ? "border-ink text-ink" : "border-transparent text-coal/45 hover:text-ink/80"
                }`}
              >
                Devoluções
              </button>
            </div>

            <div className="py-4 text-xs leading-relaxed text-coal/70 transition-all duration-300">
              {infoTab === "detalhes" && (
                <p className="whitespace-pre-line">
                  {peca.detalheTexto || "Informações de detalhes em breve."}
                </p>
              )}
              {infoTab === "envio" && (
                <p className="whitespace-pre-line">
                  {peca.envioTexto || "Informações de envio em breve."}
                </p>
              )}
              {infoTab === "devolucoes" && (
                <p className="whitespace-pre-line">
                  {peca.devolucoesTexto || "Informações de devoluções em breve."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Panel (5 columns) */}
        <div className="lg:col-span-5 bg-pearl/30 rounded-xl border border-ink/10 p-6 shadow-line self-start space-y-6">
          {/* Price and Ratings */}
          <div className="space-y-2">
            {activePromo ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-ink">{currency(precoComDesconto)}</span>
                  <span className="text-sm text-coal/40 line-through">{currency(peca.preco)}</span>
                </div>
                <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {activePromo.nome} (-{activePromo.descontoPercentual}%)
                </span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-ink">{currency(peca.preco)}</p>
            )}
            <div className="flex items-center gap-2">
              {avaliacoesSummary.total > 0 ? (
                <>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(avaliacoesSummary.media) ? "fill-gold text-gold" : "text-coal/20"}
                      />
                    ))}
                  </div>
                  <a
                    href="#avaliacoes"
                    className="text-[11px] font-semibold text-coal/50 hover:text-ink transition-colors"
                  >
                    ({avaliacoesSummary.media.toFixed(1)} estrelas) • {avaliacoesSummary.total} {avaliacoesSummary.total === 1 ? "avaliação" : "avaliações"}
                  </a>
                </>
              ) : (
                <span className="text-[11px] text-coal/40">Sem avaliações ainda</span>
              )}
            </div>
          </div>

          {/* Color Variant selection */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-coal/50 block">
              Cor: <span className="text-ink font-bold">{activeColor || "Selecione"}</span>
            </span>
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((color) => {
                const isSelected = activeColor === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                    }}
                    className={`group relative flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                      isSelected ? "ring-2 ring-gold border-white scale-105" : "border-ink/10"
                    }`}
                    style={{ backgroundColor: color.hex || "#ccc" }}
                    title={color.name}
                  >
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-ink text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap shadow z-10">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Variant selection */}
          <div className="space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-coal/50 block">
              Grade de Tamanhos (Preços de Atacado)
            </span>
            <div className="border border-ink/10 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-pearl/50 border-b border-ink/10 text-[10px] font-bold uppercase tracking-wider text-coal/60">
                    <th className="py-2 px-3">Tam</th>
                    <th className="py-2 px-3 text-right">Estoque</th>
                    <th className="py-2 px-3 text-center">Quant.</th>
                  </tr>
                </thead>
                <tbody>
                  {allSizesForPiece.map((size) => {
                    // Find the variation for this size and color
                    const vari = peca.variacoes.find((v) => v.cor === activeColor && v.tamanho === size);
                    const stock = vari ? vari.quantidadeEstoque : 0;
                    
                    return (
                      <tr key={size} className="border-b border-ink/5 text-xs hover:bg-pearl/20 transition-colors">
                        <td className="py-2 px-3 font-semibold text-ink">{size}</td>
                        <td className="py-2 px-3 text-right">
                          {stock > 0 ? (
                            <span className={`font-medium text-[11px] ${stock <= 3 ? "text-clay" : "text-coal/60"}`}>
                              {stock} un.
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold text-[11px]">Esgotado</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {stock > 0 ? (
                            <div className="flex items-center justify-center gap-1.5 mx-auto w-24 border border-ink/10 rounded bg-white py-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuantidadesGrade(prev => ({
                                    ...prev,
                                    [size]: Math.max(0, (prev[size] ?? 0) - 1)
                                  }));
                                }}
                                className="px-1.5 py-0.5 text-coal/50 hover:text-ink"
                              >
                                <Minus size={10} />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max={stock}
                                value={quantidadesGrade[size] ?? 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setQuantidadesGrade(prev => ({
                                    ...prev,
                                    [size]: Math.min(Math.max(0, val), stock)
                                  }));
                                }}
                                className="w-8 text-center text-xs font-bold text-ink bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setQuantidadesGrade(prev => ({
                                    ...prev,
                                    [size]: Math.min(stock, (prev[size] ?? 0) + 1)
                                  }));
                                }}
                                className="px-1.5 py-0.5 text-coal/50 hover:text-ink"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setVipSelectedSize(size);
                                  setVipSuccess(false);
                                }}
                                className="text-[10px] font-bold text-gold hover:underline"
                              >
                                Lista VIP
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Summary */}
          {totalPecasSelecionadas > 0 && (
            <div className="bg-pearl/50 rounded-lg p-3 border border-ink/10 flex items-center justify-between text-xs animate-fade-in">
              <div>
                <p className="text-coal/60">Total selecionado:</p>
                <p className="font-bold text-ink">{totalPecasSelecionadas} {totalPecasSelecionadas === 1 ? "peça" : "peças"}</p>
              </div>
              <div className="text-right">
                <p className="text-coal/60">Valor total:</p>
                <p className="font-bold text-gold text-sm">{currency(valorTotalGrade)}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddGradeToCart}
              disabled={totalPecasSelecionadas === 0}
              className={`w-full h-11 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all shadow-sm ${
                totalPecasSelecionadas > 0 
                  ? "bg-ink hover:bg-coal text-white active:scale-98" 
                  : "bg-ink/5 text-coal/35 cursor-not-allowed"
              }`}
            >
              Adicionar lote ao carrinho
            </button>

            <button
              onClick={handleBuyNowGrade}
              disabled={totalPecasSelecionadas === 0}
              className={`w-full h-11 text-sm font-bold rounded-md border flex items-center justify-center gap-2 transition-all ${
                totalPecasSelecionadas > 0 
                  ? "bg-white hover:bg-pearl text-ink border-ink active:scale-98" 
                  : "border-ink/5 text-coal/35 bg-transparent cursor-not-allowed"
              }`}
            >
              Comprar lote agora
            </button>
          </div>

          {/* VIP waitlist form */}
          {vipSelectedSize && (
            <div className="rounded-lg bg-gold/10 border border-gold/25 p-4 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Star size={14} className="fill-gold text-gold shrink-0" />
                  Lista VIP - Tam. {vipSelectedSize}
                </h4>
                <button 
                  type="button" 
                  onClick={() => setVipSelectedSize(null)}
                  className="text-[10px] text-coal/50 hover:text-ink font-bold"
                >
                  Fechar
                </button>
              </div>
              <p className="text-[11px] text-coal/70 leading-relaxed">
                Este tamanho está esgotado temporariamente nesta cor. Cadastre seu nome e WhatsApp para ser notificado com prioridade na reposição de estoque!
              </p>

              {vipSuccess ? (
                <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-pulse">
                  <Check size={14} /> Inscrição realizada! Avisaremos você no WhatsApp.
                </div>
              ) : (
                <form onSubmit={handleVipSubmit} className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label htmlFor="vip-name" className="text-[9px] font-bold uppercase tracking-wider text-coal/60 block">
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      id="vip-name"
                      required
                      value={vipName}
                      onChange={(e) => setVipName(e.target.value)}
                      placeholder="Ex: Marina Torres"
                      className="w-full h-9 bg-white border border-ink/10 rounded px-2.5 text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="vip-phone" className="text-[9px] font-bold uppercase tracking-wider text-coal/60 block">
                      WhatsApp / Telefone
                    </label>
                    <input
                      type="text"
                      id="vip-phone"
                      required
                      value={vipPhone}
                      onChange={(e) => setVipPhone(e.target.value)}
                      placeholder="Ex: (11) 99999-8888"
                      className="w-full h-9 bg-white border border-ink/10 rounded px-2.5 text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>
                  {vipError && (
                    <p className="text-xs text-clay font-semibold bg-clay/5 border border-clay/20 rounded px-2.5 py-2">
                      {vipError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={vipLoading}
                    className="w-full h-9 bg-ink hover:bg-coal disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded transition-all active:scale-97 shadow-sm"
                  >
                    {vipLoading ? "Inscrevendo..." : "Entrar na Lista VIP"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Success Dialog Banner */}
          {addedMessage && (
            <div className="rounded-lg border border-moss/20 bg-moss/5 p-4 flex items-center gap-3 text-moss text-xs font-semibold animate-fade-in shadow-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-moss text-white">
                <Check size={14} />
              </div>
              <div className="flex-1">
                <p className="text-ink">Lote adicionado com sucesso!</p>
                <div className="mt-1 flex gap-2.5">
                  <Link href="/carrinho" className="text-[11px] text-gold hover:underline">
                    Ver Carrinho
                  </Link>
                  <span className="text-ink/10">|</span>
                  <Link href="/produtos" className="text-[11px] text-coal/70 hover:underline">
                    Continuar Comprando
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Avaliações */}
      <div id="avaliacoes" className="border-t border-ink/10 pt-10">
        <Avaliacoes pecaId={peca.id} />
      </div>

      {/* FAQ — abaixo das avaliações */}
      <FaqSection />
    </div>
  );
}
