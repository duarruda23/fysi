"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Plus, Trash2, Percent, Calendar, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import type { Promocao } from "@/lib/types";

export default function AdminPromocoesPage() {
  const { promocoes, addPromocao, updatePromocao, deletePromocao, categorias } = useStore();

  // Form states
  const [nome, setNome] = useState("");
  const [descontoPercentual, setDescontoPercentual] = useState<number>(10);
  const [categoriaAlvo, setCategoriaAlvo] = useState("");
  const [cupom, setCupom] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [formOpen, setFormOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) return;

    await addPromocao({
      nome: nome.trim(),
      descontoPercentual,
      categoriaAlvo: categoriaAlvo || undefined,
      cupom: cupom.trim() ? cupom.trim().toUpperCase() : undefined,
      ativo
    });

    // Reset
    setNome("");
    setDescontoPercentual(10);
    setCategoriaAlvo("");
    setCupom("");
    setAtivo(true);
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Marketing</p>
          <h1 className="font-serif text-3xl font-bold leading-tight text-ink md:text-4xl">Promoções & Cupons</h1>
          <p className="text-sm text-coal/60">Configure descontos automáticos por categoria ou crie cupons promocionais para o checkout</p>
        </div>

        <button
          onClick={() => setFormOpen(!formOpen)}
          className="h-11 bg-ink text-white hover:bg-coal text-sm font-bold rounded-md px-5 inline-flex items-center gap-2 transition-all active:scale-97 shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>{formOpen ? "Fechar Formulário" : "Nova Promoção"}</span>
        </button>
      </div>

      {/* Creation form */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-ink/10 p-6 shadow-line space-y-6 animate-fade-in max-w-xl">
          <h2 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3 mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-gold" /> Configurar Promoção
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Nome */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="promo-name" className="text-[10px] font-semibold uppercase tracking-wider text-coal/65 block">
                Nome da Promoção *
              </label>
              <input
                type="text"
                id="promo-name"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Liquidação de Inverno, Boas-vindas..."
                className="w-full h-11 bg-white border border-ink/10 rounded-md px-3 text-sm text-ink outline-none focus:border-ink"
              />
            </div>

            {/* Desconto Percentual */}
            <div className="space-y-1.5">
              <label htmlFor="promo-discount" className="text-[10px] font-semibold uppercase tracking-wider text-coal/65 block">
                Desconto (%) *
              </label>
              <input
                type="number"
                id="promo-discount"
                required
                min={1}
                max={99}
                value={descontoPercentual}
                onChange={(e) => setDescontoPercentual(Math.min(99, Math.max(1, Number(e.target.value))))}
                className="w-full h-11 bg-white border border-ink/10 rounded-md px-3 text-sm text-ink outline-none focus:border-ink"
              />
            </div>

            {/* Categoria Alvo (Automática) */}
            <div className="space-y-1.5">
              <label htmlFor="promo-category" className="text-[10px] font-semibold uppercase tracking-wider text-coal/65 block">
                Aplicar na Categoria (Opcional)
              </label>
              <select
                id="promo-category"
                value={categoriaAlvo}
                onChange={(e) => setCategoriaAlvo(e.target.value)}
                className="w-full h-11 bg-white border border-ink/10 rounded-md px-2 text-sm text-ink outline-none"
              >
                <option value="">Nenhuma (Apenas via Cupom)</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Cupom de Desconto */}
            <div className="space-y-1.5">
              <label htmlFor="promo-coupon" className="text-[10px] font-semibold uppercase tracking-wider text-coal/65 block">
                Código do Cupom (Opcional)
              </label>
              <input
                type="text"
                id="promo-coupon"
                value={cupom}
                onChange={(e) => setCupom(e.target.value)}
                placeholder="Ex: FYSI10"
                className="w-full h-11 bg-white border border-ink/10 rounded-md px-3 text-sm text-ink uppercase outline-none focus:border-ink"
              />
            </div>

            {/* Ativo toggle */}
            <div className="flex items-center gap-3 pt-6 pl-2">
              <input
                type="checkbox"
                id="promo-active"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-ink/10 text-gold focus:ring-gold"
              />
              <label htmlFor="promo-active" className="text-xs font-semibold uppercase tracking-wider text-coal/70 cursor-pointer">
                Promoção Ativa
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-gold hover:bg-gold/90 text-ink text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all active:scale-97 shadow-sm"
          >
            <Plus size={16} />
            <span>Salvar Promoção</span>
          </button>
        </form>
      )}

      {/* Promotions List */}
      <div className="bg-white rounded-xl border border-ink/10 shadow-line overflow-hidden">
        <div className="p-5 border-b border-ink/10 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-ink">Histórico de Campanhas</h3>
          <span className="text-xs uppercase font-sans font-bold bg-pearl px-3 py-1 rounded-full border border-ink/10">
            Total: {promocoes.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-pearl/40 text-[10px] font-bold uppercase tracking-wider text-coal/65">
                <th className="py-3.5 px-5">Campanha</th>
                <th className="py-3.5 px-4">Desconto</th>
                <th className="py-3.5 px-4">Destino / Regra</th>
                <th className="py-3.5 px-4">Cupom</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {promocoes.length > 0 ? (
                promocoes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-pearl/20 transition-colors">
                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-ink">{promo.nome}</p>
                        <div className="flex items-center gap-1 text-[9px] text-coal/40 font-semibold font-mono uppercase">
                          <Calendar size={10} />
                          <span>Configurado em {new Date(promo.criadoEm).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-ink">
                      <span className="inline-flex items-center gap-0.5 text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Percent size={11} /> {promo.descontoPercentual}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-coal/70">
                      {promo.categoriaAlvo ? (
                        <span className="text-xs font-semibold text-ink bg-pearl border border-ink/8 px-2.5 py-0.5 rounded-full">
                          Categoria: {promo.categoriaAlvo}
                        </span>
                      ) : (
                        <span className="text-xs text-coal/45 italic">Geral (Apenas Cupom)</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {promo.cupom ? (
                        <span className="font-mono text-xs font-bold bg-white text-ink border border-ink/15 shadow-sm px-2 py-0.5 rounded select-all">
                          {promo.cupom}
                        </span>
                      ) : (
                        <span className="text-xs text-coal/40">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => updatePromocao(promo.id, { ativo: !promo.ativo })}
                        className="inline-flex justify-center focus:outline-none"
                        title={promo.ativo ? "Desativar Campanha" : "Ativar Campanha"}
                      >
                        {promo.ativo ? (
                          <ToggleRight size={26} className="text-gold" />
                        ) : (
                          <ToggleLeft size={26} className="text-coal/30" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remover promoção "${promo.nome}"?`)) {
                            deletePromocao(promo.id);
                          }
                        }}
                        className="p-2 text-coal/40 hover:text-clay hover:bg-clay/5 rounded transition-all active:scale-95"
                        title="Excluir Promoção"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-coal/40 text-sm">
                    Nenhuma promoção ou cupom ativo no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
