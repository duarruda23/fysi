"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Eye, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useMemo, useState, useEffect, useCallback } from "react";
import type { Peca } from "@/lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function LojaHomePage() {
  const { pecas, banners } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeBanners = useMemo(
    () => banners.filter((b) => b.ativo).sort((a, b) => a.ordem - b.ordem),
    [banners]
  );

  const prevSlide = useCallback(() => {
    setCurrentSlide((i) => (i === 0 ? activeBanners.length - 1 : i - 1));
  }, [activeBanners.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((i) => (i === activeBanners.length - 1 ? 0 : i + 1));
  }, [activeBanners.length]);

  // Auto-play a cada 5 segundos se houver mais de 1 banner
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length, nextSlide]);

  // Resetar slide quando a lista mudar
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeBanners.length]);

  const featuredPecas = useMemo(() => {
    return pecas
      .filter((p) => p.ativo && p.variacoes.some((v) => v.quantidadeEstoque > 0))
      .slice(0, 4);
  }, [pecas]);

  const activeCategories = useMemo(() => {
    const cats = new Set(pecas.filter((p) => p.ativo).map((p) => p.categoria));
    return Array.from(cats);
  }, [pecas]);

  const banner = activeBanners[currentSlide];

  return (
    <div className="space-y-16 pt-0">
      {/* Hero Carrossel Editorial — full-width, escapa do padding do container */}
      {activeBanners.length > 0 && banner && (
        <section
          className="relative overflow-hidden bg-ink text-white group -mx-4 md:-mx-6"
          style={{ minHeight: "clamp(460px, 62vw, 680px)" }}
        >
          {/* Imagens de fundo — sem overlay global para preservar as cores do produto */}
          {activeBanners.map((b, i) => (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
              {b.imagemUrl && (
                <img
                  src={b.imagemUrl}
                  alt={b.titulo}
                  width={1440}
                  height={680}
                  className="absolute inset-0 h-full w-full object-cover"
                  // Primeiro banner: carrega com máxima prioridade (LCP)
                  // Demais banners: lazy para não competir com recursos críticos
                  fetchPriority={i === 0 ? "high" : "low"}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding={i === 0 ? "sync" : "async"}
                />
              )}
            </div>
          ))}

          {/* Watermark — texto gigante semi-transparente ao fundo */}
          {banner.watermarkTexto && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
            >
              <span
                className="font-serif font-black uppercase text-white/[0.07] whitespace-nowrap leading-none tracking-tight"
                style={{ fontSize: "clamp(5rem, 18vw, 16rem)" }}
              >
                {banner.watermarkTexto}
              </span>
            </div>
          )}

          {/* Gradiente direcional — só atrás do bloco de texto, não cobre o produto */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 w-[55%] ${
              banner.layoutPos === "direita"
                ? "right-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent"
                : "left-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"
            }`}
          />

          {/* Layout: conteúdo posicionado à esquerda ou direita */}
          <div
            className={`relative h-full flex items-center px-8 md:px-16 py-16 ${
              banner.layoutPos === "direita" ? "justify-end" : "justify-start"
            }`}
            style={{ minHeight: "clamp(460px, 62vw, 680px)" }}
          >
            <div className={`max-w-[440px] space-y-5 ${banner.layoutPos === "direita" ? "text-right" : "text-left"}`}>
              {banner.eyebrow && (
                <div className={`flex items-center gap-2 ${banner.layoutPos === "direita" ? "justify-end" : "justify-start"}`}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm">
                    <Sparkles size={11} className="text-gold" />
                    {banner.eyebrow}
                  </span>
                </div>
              )}
              <h1 className="font-serif font-bold leading-[1.05] tracking-tight" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
                {banner.titulo}
              </h1>
              {banner.subtitulo && (
                <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                  {banner.subtitulo}
                </p>
              )}
              {banner.botaoTexto && (
                <div className="pt-2">
                  <Link
                    href={banner.botaoLink || "/produtos"}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-gold px-6 text-sm font-bold text-ink hover:bg-gold/90 transition-all shadow-lg active:scale-95"
                  >
                    {banner.botaoTexto}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Controles de navegação */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                aria-label="Banner anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Próximo banner"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={18} />
              </button>

              {/* Indicadores */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {activeBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Ir para banner ${i + 1}`}
                    className={`h-[3px] rounded-full transition-all duration-300 ${
                      i === currentSlide ? "bg-gold w-8" : "bg-white/30 w-3 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Ticker marquee na base do banner */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/40 backdrop-blur-sm border-t border-white/10 overflow-hidden flex items-center">
            <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="inline-flex items-center gap-4 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  <span>Nova Coleção</span>
                  <span className="text-gold">→</span>
                  <span>Fysi Atacado</span>
                  <span className="text-gold">→</span>
                  <span>Peças Exclusivas</span>
                  <span className="text-gold">→</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink md:text-3xl">
              Navegar por Categorias
            </h2>
            <p className="text-sm text-coal/60">Encontre a modelagem ideal para cada momento</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {activeCategories.map((categoria) => (
            <Link
              key={categoria}
              href={`/produtos?categoria=${encodeURIComponent(categoria)}`}
              className="group flex flex-col items-center justify-center rounded-xl border border-ink/10 bg-white p-5 text-center shadow-line hover:border-gold hover:shadow-soft transition-all duration-300"
            >
              <span className="font-serif text-lg font-semibold text-ink group-hover:text-gold transition-colors">
                {categoria}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-wider text-coal/40 group-hover:text-coal/60">
                Ver peças
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="space-y-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink md:text-3xl">
              Novidades em Destaque
            </h2>
            <p className="text-sm text-coal/60">As últimas novidades adicionadas à nossa coleção</p>
          </div>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-gold hover:text-ink transition-colors"
          >
            Ver catálogo completo
            <ArrowRight size={15} />
          </Link>
        </div>

        {featuredPecas.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPecas.map((peca) => (
              <Link key={peca.id} href={`/produtos/${peca.id}`} className="group block">
                <article className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-line hover:shadow-soft transition-all duration-300 h-full flex flex-col">
                  {/* Photo container */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-linen flex-shrink-0">
                    <img
                      src={peca.fotos[0] || "/brand/logo-preto.png"}
                      alt={peca.nome}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur text-ink rounded-full p-2.5 shadow-md">
                      <Eye size={16} />
                    </div>
                  </div>
                  {/* Body container */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-coal/40 font-semibold">
                        {peca.categoria}
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-ink line-clamp-1 group-hover:text-gold transition-colors">
                        {peca.nome}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-sm font-bold text-ink">{currency(peca.preco)}</p>
                      <div className="flex gap-1.5">
                        {peca.variacoes
                          .filter((v, i, self) => self.findIndex(x => x.cor === v.cor) === i)
                          .slice(0, 3)
                          .map((variacao) => (
                            <span
                              key={variacao.id}
                              className="h-4.5 w-4.5 rounded-full border border-ink/10 shadow-sm"
                              style={{ backgroundColor: variacao.corHex || "#ccc" }}
                              title={variacao.cor}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-ink/20 p-12 text-center">
            <ShoppingBag size={36} className="mx-auto text-coal/30 mb-3" />
            <p className="text-coal/60 font-serif text-lg">Nenhum produto disponível no momento.</p>
            <p className="text-xs text-coal/40 mt-1">
              Fique de olho! Em breve teremos novidades ou acesse o admin para adicionar estoque.
            </p>
          </div>
        )}
      </section>

      {/* Visual Quote / Brand Promise */}
      <section className="bg-white rounded-2xl border border-ink/10 p-8 md:p-12 text-center max-w-4xl mx-auto space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Manifesto Fysi</p>
        <blockquote className="font-serif text-2xl font-medium leading-relaxed text-ink md:text-3xl italic">
          &quot;Acreditamos que vestir-se é um ritual diário de intenção. Menos peças, melhores tecidos, cortes que respeitam o corpo e durabilidade que resiste ao tempo.&quot;
        </blockquote>
        <div className="h-px bg-gold/30 w-16 mx-auto mt-6" />
      </section>
    </div>
  );
}
