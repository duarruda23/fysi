"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, Edit3, Trash2, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Peca } from "@/lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function stockTotal(peca: Peca) {
  return peca.variacoes.reduce((total, variacao) => total + variacao.quantidadeEstoque, 0);
}

export default function AdminPiecesPage() {
  const { pecas, updatePeca, deletePeca } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(pecas.map((p) => p.categoria));
    return Array.from(cats);
  }, [pecas]);

  // Filtered pieces
  const filteredPieces = useMemo(() => {
    return pecas.filter((peca) => {
      // Search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = peca.nome.toLowerCase().includes(query);
        const matchesRef = peca.referencia.toLowerCase().includes(query);
        if (!matchesName && !matchesRef) return false;
      }
      
      // Category filter
      if (selectedCategory && peca.categoria !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [pecas, searchTerm, selectedCategory]);

  // Toggle active/inactive
  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updatePeca(id, { ativo: !currentStatus });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir a peça "${name}"? Esta ação não pode ser desfeita.`)) {
      deletePeca(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink font-serif md:text-3xl">Peças</h2>
          <p className="text-sm text-coal/60">Cadastre novas roupas, gerencie fotos, preços e as variações de estoque</p>
        </div>
        <Link
          href="/admin/pecas/nova"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink hover:bg-coal text-white text-sm font-semibold px-5 transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Nova Peça</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 flex items-center rounded-md border border-ink/10 bg-white">
          <Search size={16} className="absolute left-3 text-coal/45" />
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-transparent pl-10 pr-3 text-sm text-ink outline-none placeholder:text-coal/35 focus:border-ink rounded-md"
          />
        </div>

        <div className="relative flex items-center rounded-md border border-ink/10 bg-white px-3 h-10 min-w-[180px]">
          <Filter size={15} className="text-coal/45 mr-2" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-transparent text-sm text-ink outline-none cursor-pointer appearance-none"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Database Table */}
      <div className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-line">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_120px_100px_110px_120px] gap-4 p-4 border-b border-ink/10 text-xs font-semibold uppercase tracking-wider text-coal/50 bg-pearl/20">
          <span>Foto</span>
          <span>Nome / SKU</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span className="text-center">Estoque</span>
          <span className="text-center">Status</span>
          <span className="text-right">Ações</span>
        </div>

        {/* Rows */}
        {filteredPieces.length > 0 ? (
          <div className="divide-y divide-ink/8">
            {filteredPieces.map((peca) => (
              <div
                key={peca.id}
                className="grid grid-cols-[50px_1fr_auto] md:grid-cols-[60px_1fr_120px_120px_100px_110px_120px] gap-4 items-center p-4 hover:bg-pearl/5 transition-colors"
              >
                {/* Thumbnail */}
                <div className="h-12 w-10 bg-linen rounded overflow-hidden border border-ink/10">
                  <img src={peca.fotos[0] || "/brand/logo-preto.png"} alt={peca.nome} className="h-full w-full object-cover" />
                </div>

                {/* Name / SKU */}
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm md:text-base line-clamp-1">{peca.nome}</p>
                  <p className="text-xs font-mono text-coal/50 mt-0.5">{peca.referencia}</p>
                  {/* Category & Price visible on mobile */}
                  <p className="text-xs text-coal/65 md:hidden pt-0.5">
                    {peca.categoria} · {currency(peca.preco)}
                  </p>
                </div>

                {/* Categoria */}
                <span className="hidden md:block text-sm text-coal/70">{peca.categoria}</span>

                {/* Preço */}
                <span className="hidden md:block text-sm font-semibold text-ink">{currency(peca.preco)}</span>

                {/* Estoque Total */}
                <div className="hidden md:block text-center">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    stockTotal(peca) <= 5
                      ? "border-clay/20 bg-clay/10 text-clay"
                      : "border-ink/10 bg-pearl text-coal"
                  }`}>
                    {stockTotal(peca)} un
                  </span>
                </div>

                {/* Status Switcher */}
                <div className="text-center md:text-left flex items-center justify-center md:justify-start">
                  <button
                    onClick={() => handleToggleActive(peca.id, peca.ativo)}
                    className="focus:outline-none transition-colors"
                    title={peca.ativo ? "Desativar Peça" : "Ativar Peça"}
                  >
                    {peca.ativo ? (
                      <span className="inline-flex items-center gap-1 text-xs text-moss font-bold uppercase">
                        <ToggleRight size={24} className="text-moss" />
                        <span className="hidden md:inline">Ativa</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-coal/40 uppercase font-semibold">
                        <ToggleLeft size={24} className="text-coal/35" />
                        <span className="hidden md:inline">Inativa</span>
                      </span>
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/pecas/${peca.id}`}
                    className="p-2 text-coal/50 hover:text-ink hover:bg-pearl rounded-md transition-all"
                    title="Editar peça"
                  >
                    <Edit3 size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(peca.id, peca.nome)}
                    className="p-2 text-coal/40 hover:text-clay hover:bg-clay/5 rounded-md transition-all"
                    title="Excluir peça"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-coal/45 text-sm">
            Nenhuma peça encontrada para os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}
