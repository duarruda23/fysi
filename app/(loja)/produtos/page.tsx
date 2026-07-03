"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, Eye, RefreshCw, X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Peca, Tamanho } from "@/lib/types";
import { TAMANHOS_LETRA, TAMANHOS_NUMERO } from "@/lib/types";
import { trackViewCategoryEvent } from "@/components/AnalyticsScripts";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// Ordem canônica: letras primeiro, depois numeração crescente
const ORDEM_TAMANHO: string[] = [
  ...TAMANHOS_LETRA,
  ...TAMANHOS_NUMERO,
];

function CatalogContent() {
  const { pecas } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<Tamanho[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Active Category from search parameters
  const activeCategory = searchParams.get("categoria") || "";

  // Dispara ViewCategory uma vez por montagem (e ao mudar de categoria)
  const viewCategoryTracked = useRef<string | null>(null);
  useEffect(() => {
    if (viewCategoryTracked.current === activeCategory) return;
    viewCategoryTracked.current = activeCategory;
    const count = pecas.filter((p) => p.ativo).length;
    trackViewCategoryEvent(activeCategory, count);
  }, [activeCategory, pecas]);

  // Unique categories list
  const categories = useMemo(() => {
    const cats = new Set(pecas.filter((p) => p.ativo).map((p) => p.categoria));
    return Array.from(cats);
  }, [pecas]);

  // Tamanhos únicos presentes nos produtos, na ordem canônica
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    pecas.filter((p) => p.ativo).forEach((p) =>
      p.variacoes.forEach((v) => {
        if (v.quantidadeEstoque > 0) set.add(v.tamanho);
      })
    );
    // Ordena: letras (ordem ORDEM_TAMANHO) depois numeração crescente
    return ORDEM_TAMANHO.filter((s) => set.has(s)).concat(
      Array.from(set).filter((s) => !ORDEM_TAMANHO.includes(s)).sort((a, b) => Number(a) - Number(b))
    );
  }, [pecas]);

  // Unique colors list
  const colors = useMemo(() => {
    const colorNames: string[] = [];
    const colorHexes: Record<string, string> = {};

    pecas.forEach((p) => {
      p.variacoes.forEach((v) => {
        if (!colorNames.includes(v.cor)) {
          colorNames.push(v.cor);
          if (v.corHex) colorHexes[v.cor] = v.corHex;
        }
      });
    });

    return colorNames.map((name) => ({
      name,
      hex: colorHexes[name] || "#ccc"
    }));
  }, [pecas]);

  // Handle category change (updates search params)
  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set("categoria", cat);
    } else {
      params.delete("categoria");
    }
    router.push(`/produtos?${params.toString()}`);
  };

  // Toggle size filter
  const toggleSize = (size: Tamanho) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Toggle color filter
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(1000);
    setCategory("");
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return pecas.filter((peca) => {
      // Must be active
      if (!peca.ativo) return false;

      // Must have at least one variation with stock > 0
      const hasStock = peca.variacoes.some((v) => v.quantidadeEstoque > 0);
      if (!hasStock) return false;

      // Search term filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = peca.nome.toLowerCase().includes(query);
        const matchesDesc = peca.descricao.toLowerCase().includes(query);
        const matchesSKU = peca.referencia.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesSKU) return false;
      }

      // Category filter
      if (activeCategory && peca.categoria !== activeCategory) {
        return false;
      }

      // Price filter
      if (peca.preco > maxPrice) {
        return false;
      }

      // Size filter (must match at least one selected size that is in stock)
      if (selectedSizes.length > 0) {
        const hasMatchingSize = peca.variacoes.some(
          (v) => selectedSizes.includes(v.tamanho) && v.quantidadeEstoque > 0
        );
        if (!hasMatchingSize) return false;
      }

      // Color filter (must match at least one selected color that is in stock)
      if (selectedColors.length > 0) {
        const hasMatchingColor = peca.variacoes.some(
          (v) => selectedColors.includes(v.cor) && v.quantidadeEstoque > 0
        );
        if (!hasMatchingColor) return false;
      }

      return true;
    });
  }, [pecas, searchTerm, activeCategory, selectedSizes, selectedColors, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Coleção Completa</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">Catálogo</h1>
        <p className="mt-2 text-sm text-coal/60">Explore nossa alfaiataria premium e peças de linho exclusivas</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        {/* Left Sidebar Filter (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          {/* Search bar */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-coal/50">Buscar</h3>
            <div className="relative flex items-center rounded-md border border-ink/10 bg-white">
              <Search size={16} className="absolute left-3 text-coal/40" />
              <input
                type="text"
                placeholder="Nome, SKU ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent pl-10 pr-3 py-2 text-sm text-ink outline-none placeholder:text-coal/35"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-coal/50">Categorias</h3>
            <div className="flex flex-col gap-1 text-sm">
              <button
                onClick={() => setCategory("")}
                className={`text-left px-2 py-1 rounded ${
                  !activeCategory ? "bg-ink text-white font-semibold" : "text-coal/70 hover:bg-white/60"
                }`}
              >
                Todas as Peças
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left px-2 py-1 rounded ${
                    activeCategory === cat ? "bg-ink text-white font-semibold" : "text-coal/70 hover:bg-white/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-coal/50">
              <span className="uppercase tracking-wider">Preço Máximo</span>
              <span className="text-ink">{currency(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold h-1 bg-ink/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Sizes Filter */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-coal/50">Tamanhos</h3>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((size) => {
                const isSelected = selectedSizes.includes(size as Tamanho);
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size as Tamanho)}
                    className={`h-9 min-w-[2.25rem] px-2 rounded-md border text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-ink bg-ink text-white"
                        : "border-ink/10 bg-white text-ink hover:border-ink/20"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-coal/50">Cores</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    onClick={() => toggleColor(color.name)}
                    className={`h-7 w-7 rounded-full border transition-all ${
                      isSelected ? "ring-2 ring-gold border-white" : "border-ink/10"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={clearFilters}
            className="w-full h-10 rounded-md border border-ink/15 text-xs font-bold hover:bg-white transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={12} /> Limpar Filtros
          </button>
        </aside>

        {/* Catalog Main Panel */}
        <div className="space-y-6">
          {/* Top helper panel */}
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <p className="text-xs text-coal/65">
              Exibindo <span className="font-semibold text-ink">{filteredProducts.length}</span> de{" "}
              <span className="font-semibold text-ink">{pecas.filter((p) => p.ativo).length}</span> peças
            </p>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden h-10 rounded-md border border-ink/10 bg-white px-4 text-xs font-bold flex items-center gap-2"
            >
              <SlidersHorizontal size={14} /> Filtros
            </button>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((peca) => (
                <Link key={peca.id} href={`/produtos/${peca.id}`} className="group block">
                  <article className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-line hover:shadow-soft transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-[4/5] overflow-hidden bg-linen">
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
                        <div className="flex gap-1">
                          {peca.variacoes
                            .filter((v, i, self) => self.findIndex(x => x.cor === v.cor) === i)
                            .slice(0, 3)
                            .map((variacao) => (
                              <span
                                key={variacao.id}
                                className="h-4 w-4 rounded-full border border-ink/10"
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
              <Search size={32} className="mx-auto text-coal/30 mb-3" />
              <p className="text-coal/65 font-serif text-lg">Nenhum produto encontrado.</p>
              <p className="text-xs text-coal/45 mt-1">
                Tente ajustar seus termos de busca ou filtros de cor, tamanho e preço.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md border border-ink/15 bg-white px-4 text-xs font-bold text-ink hover:bg-pearl transition-all"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="w-80 bg-pearl p-6 shadow-soft flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4 mb-5">
              <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filtros
              </h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="h-8 w-8 rounded-full border border-ink/10 bg-white flex items-center justify-center text-coal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-coal/50">Buscar</h3>
                <div className="relative flex items-center rounded-md border border-ink/10 bg-white">
                  <Search size={16} className="absolute left-3 text-coal/40" />
                  <input
                    type="text"
                    placeholder="Nome, SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm text-ink outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-coal/50">Categorias</h3>
                <div className="flex flex-wrap gap-1 text-xs">
                  <button
                    onClick={() => setCategory("")}
                    className={`px-3 py-1.5 rounded-full border ${
                      !activeCategory
                        ? "bg-ink border-ink text-white font-semibold"
                        : "bg-white border-ink/10 text-coal/70"
                    }`}
                  >
                    Todas
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full border ${
                        activeCategory === cat
                          ? "bg-ink border-ink text-white font-semibold"
                          : "bg-white border-ink/10 text-coal/70"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-coal/50">
                  <span className="uppercase tracking-wider">Preço Máximo</span>
                  <span className="text-ink">{currency(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-gold h-1 bg-ink/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-coal/50">Tamanhos</h3>
                <div className="flex flex-wrap gap-1.5">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size as Tamanho);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size as Tamanho)}
                        className={`h-8 min-w-[2rem] px-2 rounded-md border text-xs font-semibold transition-all ${
                          isSelected
                            ? "border-ink bg-ink text-white"
                            : "border-ink/10 bg-white text-ink"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-coal/50">Cores</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const isSelected = selectedColors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        onClick={() => toggleColor(color.name)}
                        className={`h-7 w-7 rounded-full border transition-all ${
                          isSelected ? "ring-2 ring-gold border-white" : "border-ink/10"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-ink/10 flex gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 h-11 rounded-md border border-ink/15 text-xs font-bold bg-white text-ink"
              >
                Limpar
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 h-11 rounded-md bg-ink text-xs font-bold text-white"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <React.Suspense fallback={<div className="py-20 text-center text-sm text-coal/50 font-serif">Carregando catálogo Fysi...</div>}>
      <CatalogContent />
    </React.Suspense>
  );
}
