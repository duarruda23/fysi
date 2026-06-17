"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Plus, Trash2, Tag, Calendar, AlertCircle } from "lucide-react";

export default function AdminCategoriasPage() {
  const { categorias, addCategoria, deleteCategoria, pecas } = useStore();
  const [newCatName, setNewCatName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const nameTrimmed = newCatName.trim();
    if (!nameTrimmed) {
      setErrorMsg("O nome da categoria não pode estar em branco.");
      return;
    }

    // Check duplicate
    const exists = categorias.some(
      (c) => c.nome.toLowerCase() === nameTrimmed.toLowerCase()
    );
    if (exists) {
      setErrorMsg("Esta categoria já existe.");
      return;
    }

    await addCategoria(nameTrimmed);
    setNewCatName("");
  };

  const getPecaCount = (catName: string) => {
    return pecas.filter((p) => p.categoria.toLowerCase() === catName.toLowerCase()).length;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold">Organização</p>
        <h1 className="font-serif text-3xl font-bold leading-tight text-ink md:text-4xl">Categorias</h1>
        <p className="text-sm text-coal/60">Gerencie as categorias de produtos utilizadas para catalogação e filtros da loja</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Create Category Panel */}
        <div className="bg-white rounded-xl border border-ink/10 p-6 shadow-line self-start">
          <h2 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3 mb-4 flex items-center gap-2">
            <Tag size={16} /> Nova Categoria
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="cat-name" className="text-[10px] font-semibold uppercase tracking-wider text-coal/65 block">
                Nome da Categoria *
              </label>
              <input
                type="text"
                id="cat-name"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Casacos, Calçados..."
                className="w-full h-11 bg-white border border-ink/10 rounded-md px-3 text-sm text-ink outline-none focus:border-ink"
              />
            </div>

            {errorMsg && (
              <div className="rounded border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-800 text-xs animate-fade-in">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 bg-gold hover:bg-gold/90 text-ink text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all active:scale-97 shadow-sm"
            >
              <Plus size={16} />
              <span>Adicionar Categoria</span>
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-xl border border-ink/10 shadow-line overflow-hidden">
          <div className="p-5 border-b border-ink/10 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-ink">Categorias Cadastradas</h3>
            <span className="text-xs uppercase font-sans font-bold bg-pearl px-3 py-1 rounded-full border border-ink/10">
              Total: {categorias.length}
            </span>
          </div>

          <div className="divide-y divide-ink/10">
            {categorias.length > 0 ? (
              categorias.map((cat) => {
                const count = getPecaCount(cat.nome);
                return (
                  <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-pearl/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-sans font-bold text-ink text-sm">{cat.nome}</p>
                        <span className="text-[10px] bg-ink/5 border border-ink/8 px-2 py-0.5 rounded-full text-coal/65">
                          {count} {count === 1 ? "peça" : "peças"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-coal/40">
                        <Calendar size={11} />
                        <span>Criado em {new Date(cat.criadoEm).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (count > 0) {
                          alert(`Esta categoria possui ${count} peças vinculadas. Remova ou altere as peças antes de excluí-la.`);
                          return;
                        }
                        if (confirm(`Deseja realmente remover a categoria "${cat.nome}"?`)) {
                          deleteCategoria(cat.id);
                        }
                      }}
                      className="p-2 text-coal/40 hover:text-clay hover:bg-clay/5 rounded transition-all active:scale-95"
                      title="Excluir Categoria"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-coal/40 text-sm">
                Nenhuma categoria cadastrada.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
