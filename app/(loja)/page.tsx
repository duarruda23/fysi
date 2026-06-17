"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Eye, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { useMemo } from "react";
import type { Peca } from "@/lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function LojaHomePage() {
  const { pecas, banner } = useStore();

  // Get active pieces with some stock
  const featuredPecas = useMemo(() => {
    return pecas
      .filter((p) => p.ativo && p.variacoes.some((v) => v.quantidadeEstoque > 0))
      .slice(0, 4);
  }, [pecas]);

  // Unique categories from active pieces
  const activeCategories = useMemo(() => {
    const cats = new Set(pecas.filter((p) => p.ativo).map((p) => p.categoria));
    return Array.from(cats);
  }, [pecas]);

  return (
    <div className="space-y-16">
      {/* Hero Editorial Banner — dados do banco */}
      {banner.ativo && (
        <section className="relative overflow-hidden rounded-2xl bg-ink text-white shadow-soft min-h-[480px] flex items-end">
          <img
            src={banner.imagemUrl}
            alt="Banner principal Fysi"
            className="absolute inset-0 h-full w-full object-cover opacity-60 md:opacity-75 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="relative p-6 md:p-12 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium backdrop-blur">
              <Sparkles size={13} className="text-gold" />
              {banner.eyebrow}
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
              {banner.titulo}
            </h1>
            <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-lg">
              {banner.subtitulo}
            </p>
            <div className="pt-2">
              <Link
                href={banner.botaoLink}
                className="inline-flex h-12 items-center gap-2 rounded-md bg-gold px-6 text-sm font-bold text-ink hover:bg-gold/90 transition-all shadow-md active:scale-95"
              >
                {banner.botaoTexto}
                <ArrowRight size={16} />
              </Link>
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
