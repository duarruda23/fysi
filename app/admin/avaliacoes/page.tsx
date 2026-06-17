"use client";

import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, Clock } from "lucide-react";
import type { Avaliacao } from "@/lib/types";

function StarDisplay({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= nota ? "fill-gold text-gold" : "text-coal/20"}
        />
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "pendentes" | "aprovadas">("todas");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/avaliacoes/admin");
      const data = await res.json();
      setAvaliacoes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleToggleAprovado = async (id: string, aprovado: boolean) => {
    await fetch("/api/avaliacoes/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, aprovado }),
    });
    setAvaliacoes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, aprovado } : a))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta avaliação permanentemente?")) return;
    await fetch("/api/avaliacoes/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAvaliacoes((prev) => prev.filter((a) => a.id !== id));
  };

  const filtered = avaliacoes.filter((a) => {
    if (filtro === "pendentes") return !a.aprovado;
    if (filtro === "aprovadas") return a.aprovado;
    return true;
  });

  const pendentes = avaliacoes.filter((a) => !a.aprovado).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gold">Moderação</p>
        <h1 className="font-serif text-3xl font-semibold text-ink mt-1">Avaliações</h1>
        <p className="text-sm text-coal/60 mt-1">
          Aprove ou remova avaliações enviadas pelos clientes antes de publicar na loja.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["todas", "pendentes", "aprovadas"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
              filtro === f
                ? "bg-ink text-white border-ink"
                : "bg-white text-coal/70 border-ink/15 hover:border-ink/40"
            }`}
          >
            {f === "todas" ? "Todas" : f === "pendentes" ? `Pendentes ${pendentes > 0 ? `(${pendentes})` : ""}` : "Aprovadas"}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-ink/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-ink/10 bg-white p-10 text-center">
          <p className="text-sm text-coal/50">Nenhuma avaliação encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((av) => (
            <div
              key={av.id}
              className={`rounded-xl border bg-white p-4 transition-all ${
                av.aprovado ? "border-ink/10" : "border-amber-200 bg-amber-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink">{av.autorNome}</span>
                    <StarDisplay nota={av.nota} />
                    {!av.aprovado && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        <Clock size={9} /> Pendente
                      </span>
                    )}
                    {av.aprovado && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        <Check size={9} /> Publicada
                      </span>
                    )}
                  </div>
                  {av.comentario && (
                    <p className="text-sm text-coal/70 leading-relaxed">{av.comentario}</p>
                  )}
                  <p className="text-[11px] text-coal/40">{formatDate(av.criadoEm)}</p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!av.aprovado ? (
                    <button
                      onClick={() => handleToggleAprovado(av.id, true)}
                      title="Aprovar"
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all"
                    >
                      <Check size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleAprovado(av.id, false)}
                      title="Despublicar"
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(av.id)}
                    title="Excluir"
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
