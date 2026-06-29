"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Check, X } from "lucide-react";
import type { FaqItem } from "@/lib/types";

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");

  async function fetchFaq() {
    setLoading(true);
    const res = await fetch("/api/faq");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchFaq(); }, []);

  function openNew() {
    setEditingId(null);
    setPergunta("");
    setResposta("");
    setShowForm(true);
  }

  function openEdit(item: FaqItem) {
    setEditingId(item.id);
    setPergunta(item.pergunta);
    setResposta(item.resposta);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setPergunta("");
    setResposta("");
  }

  async function handleSave() {
    if (!pergunta.trim() || !resposta.trim()) return;
    setSaving(true);
    if (editingId) {
      const existing = items.find((i) => i.id === editingId)!;
      await fetch(`/api/faq/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: pergunta.trim(), resposta: resposta.trim(), ordem: existing.ordem, ativo: existing.ativo }),
      });
    } else {
      await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: pergunta.trim(), resposta: resposta.trim(), ordem: items.length, ativo: true }),
      });
    }
    await fetchFaq();
    cancelForm();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta pergunta?")) return;
    await fetch(`/api/faq/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleToggleAtivo(item: FaqItem) {
    await fetch(`/api/faq/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, ativo: !item.ativo }),
    });
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, ativo: !i.ativo } : i));
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    const updated = newItems.map((item, i) => ({ ...item, ordem: i }));
    setItems(updated);
    await Promise.all(
      updated.map((item) =>
        fetch(`/api/faq/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        })
      )
    );
  }

  async function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    const updated = newItems.map((item, i) => ({ ...item, ordem: i }));
    setItems(updated);
    await Promise.all(
      updated.map((item) =>
        fetch(`/api/faq/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        })
      )
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">FAQ</h1>
          <p className="text-xs text-coal/50 mt-0.5">Perguntas frequentes exibidas na loja</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          <Plus size={15} />
          Nova pergunta
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink mb-4">
            {editingId ? "Editar pergunta" : "Nova pergunta"}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-coal/50 font-semibold block mb-1">
                Pergunta
              </label>
              <input
                type="text"
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                placeholder="Ex: Qual o prazo de entrega?"
                className="w-full h-9 px-3 rounded border border-ink/10 text-sm text-ink placeholder:text-coal/30 outline-none focus:border-ink/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-coal/50 font-semibold block mb-1">
                Resposta
              </label>
              <textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Escreva a resposta completa..."
                rows={4}
                className="w-full px-3 py-2 rounded border border-ink/10 text-sm text-ink placeholder:text-coal/30 outline-none focus:border-ink/30 resize-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !pergunta.trim() || !resposta.trim()}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded bg-ink text-white text-xs font-semibold disabled:opacity-40 hover:bg-ink/90 transition-colors"
            >
              <Check size={13} />
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={cancelForm}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded border border-ink/10 text-xs text-coal/60 hover:text-ink transition-colors"
            >
              <X size={13} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-sm text-coal/40 py-12 text-center">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-coal/40 py-12 text-center border border-dashed border-ink/10 rounded-lg">
          Nenhuma pergunta cadastrada ainda.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-lg border bg-white p-4 flex gap-4 transition-opacity ${
                item.ativo ? "border-ink/10 opacity-100" : "border-ink/5 opacity-60"
              }`}
            >
              {/* Ordenação */}
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="text-coal/30 hover:text-ink disabled:opacity-20 transition-colors"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  className="text-coal/30 hover:text-ink disabled:opacity-20 transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink leading-snug">{item.pergunta}</p>
                <p className="text-xs text-coal/60 mt-1 leading-relaxed line-clamp-2">{item.resposta}</p>
              </div>

              {/* Ações */}
              <div className="flex items-start gap-1">
                <button
                  onClick={() => handleToggleAtivo(item)}
                  title={item.ativo ? "Desativar" : "Ativar"}
                  className="h-7 w-7 flex items-center justify-center rounded text-coal/40 hover:text-ink transition-colors"
                >
                  {item.ativo ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  title="Editar"
                  className="h-7 w-7 flex items-center justify-center rounded text-coal/40 hover:text-ink transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Excluir"
                  className="h-7 w-7 flex items-center justify-center rounded text-coal/40 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
