"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";
import type { Avaliacao } from "@/lib/types";

interface AvaliacoesProps {
  pecaId: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            size={size}
            className={
              s <= (hovered || value)
                ? "fill-gold text-gold"
                : "fill-none text-coal/25"
            }
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function Avaliacoes({ pecaId }: AvaliacoesProps) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [nota, setNota] = useState(0);
  const [autorNome, setAutorNome] = useState("");
  const [comentario, setComentario] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchAvaliacoes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/avaliacoes?peca_id=${pecaId}`);
      const data = await res.json();
      setAvaliacoes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [pecaId]);

  useEffect(() => {
    fetchAvaliacoes();
  }, [fetchAvaliacoes]);

  const media =
    avaliacoes.length > 0
      ? avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length
      : 0;

  const distribuicao = [5, 4, 3, 2, 1].map((estrela) => ({
    estrela,
    count: avaliacoes.filter((a) => a.nota === estrela).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (nota === 0) { setFormError("Selecione uma nota antes de enviar."); return; }
    if (!autorNome.trim()) { setFormError("Informe seu nome."); return; }
    if (!comentario.trim()) { setFormError("Escreva um comentário."); return; }

    setSending(true);
    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pecaId, autorNome, nota, comentario }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setNota(0);
      setAutorNome("");
      setComentario("");
    } catch {
      setFormError("Erro ao enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-8 pt-2">
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-2xl font-semibold text-ink">Avaliações</h2>
        {avaliacoes.length > 0 && (
          <span className="text-xs text-coal/50 font-medium">
            {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
          </span>
        )}
      </div>

      {/* Summary + distribution */}
      {avaliacoes.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 bg-pearl/50 rounded-xl border border-ink/10 p-5">
          {/* Media */}
          <div className="flex flex-col items-center justify-center gap-1 min-w-[100px]">
            <span className="font-serif text-5xl font-bold text-ink leading-none">
              {media.toFixed(1)}
            </span>
            <StarRating value={Math.round(media)} readonly size={16} />
            <span className="text-[11px] text-coal/50">{avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"}</span>
          </div>
          {/* Barras */}
          <div className="flex-1 space-y-1.5">
            {distribuicao.map(({ estrela, count }) => {
              const pct = avaliacoes.length > 0 ? (count / avaliacoes.length) * 100 : 0;
              return (
                <div key={estrela} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right text-coal/60 font-medium">{estrela}</span>
                  <Star size={11} className="fill-gold text-gold shrink-0" />
                  <div className="flex-1 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-4 text-coal/50">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de avaliações */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-ink/5 animate-pulse" />
          ))}
        </div>
      ) : avaliacoes.length === 0 ? (
        <p className="text-sm text-coal/50 py-4">
          Nenhuma avaliação ainda. Seja o primeiro a avaliar este produto!
        </p>
      ) : (
        <div className="space-y-4">
          {avaliacoes.map((av) => (
            <div
              key={av.id}
              className="rounded-xl border border-ink/10 bg-white p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-ink">{av.autorNome}</p>
                  <StarRating value={av.nota} readonly size={13} />
                </div>
                <span className="text-[11px] text-coal/40 shrink-0">
                  {formatDate(av.criadoEm)}
                </span>
              </div>
              {av.comentario && (
                <p className="text-sm text-coal/70 leading-relaxed">{av.comentario}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulário de nova avaliação */}
      <div className="rounded-xl border border-ink/10 bg-white p-6 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
          Deixar avaliação
        </h3>

        {sent ? (
          <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm">
            <CheckCircle2 size={18} className="shrink-0" />
            <p>
              <span className="font-semibold">Avaliação enviada!</span> Ela será publicada após revisão da nossa equipe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nota */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-coal/60">
                Sua nota *
              </label>
              <StarRating value={nota} onChange={setNota} size={24} />
            </div>

            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-coal/60">
                Seu nome *
              </label>
              <input
                type="text"
                value={autorNome}
                onChange={(e) => setAutorNome(e.target.value)}
                placeholder="Como você quer ser identificado"
                maxLength={80}
                className="w-full h-10 px-3 rounded-lg border border-ink/10 text-sm text-ink placeholder:text-coal/35 focus:outline-none focus:ring-2 focus:ring-gold/40 bg-pearl/30"
              />
            </div>

            {/* Comentário */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-coal/60">
                Comentário *
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte como foi sua experiência com esta peça..."
                rows={3}
                maxLength={800}
                className="w-full px-3 py-2.5 rounded-lg border border-ink/10 text-sm text-ink placeholder:text-coal/35 focus:outline-none focus:ring-2 focus:ring-gold/40 bg-pearl/30 resize-none"
              />
              <p className="text-[10px] text-coal/35 text-right">{comentario.length}/800</p>
            </div>

            {formError && (
              <p className="text-xs text-red-600 font-medium">{formError}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/85 transition-all active:scale-95 disabled:opacity-60"
            >
              {sending ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {sending ? "Enviando..." : "Enviar avaliação"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
