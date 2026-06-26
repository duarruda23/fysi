"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import type { Banner } from "@/lib/types";
import {
  Save, Check, Plus, Trash2, Eye, EyeOff, Image,
  ExternalLink, ChevronUp, ChevronDown, Pencil, X,
} from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

const EMPTY: Omit<Banner, "id" | "ordem" | "criadoEm"> = {
  titulo: "",
  subtitulo: "",
  eyebrow: "",
  botaoTexto: "",
  botaoLink: "/produtos",
  imagemUrl: "",
  ativo: true,
  watermarkTexto: "",
  layoutPos: "esquerda",
};

function BannerForm({
  initial,
  onSave,
  onCancel,
  saving,
  saved,
  submitLabel = "Salvar",
}: {
  initial: Omit<Banner, "id" | "ordem" | "criadoEm">;
  onSave: (data: Omit<Banner, "id" | "ordem" | "criadoEm">) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  saved: boolean;
  submitLabel?: string;
}) {
  const [titulo, setTitulo] = useState(initial.titulo);
  const [subtitulo, setSubtitulo] = useState(initial.subtitulo);
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [botaoTexto, setBotaoTexto] = useState(initial.botaoTexto);
  const [botaoLink, setBotaoLink] = useState(initial.botaoLink);
  const [imagemUrl, setImagemUrl] = useState(initial.imagemUrl);
  const [ativo, setAtivo] = useState(initial.ativo);
  const [watermarkTexto, setWatermarkTexto] = useState(initial.watermarkTexto ?? "");
  const [layoutPos, setLayoutPos] = useState<"esquerda" | "direita">(initial.layoutPos ?? "esquerda");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ titulo, subtitulo, eyebrow, botaoTexto, botaoLink, imagemUrl, ativo, watermarkTexto, layoutPos });
  };

  const preview = { titulo, subtitulo, eyebrow, botaoTexto, imagemUrl, ativo };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Conteúdo */}
        <div className="bg-white rounded-xl border border-ink/10 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-coal/50">Conteúdo</h3>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-coal/60">Eyebrow</label>
            <input type="text" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)}
              placeholder="Ex: Nova Coleção 2026"
              className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-2.5 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-coal/60">Título *</label>
            <textarea value={titulo} onChange={(e) => setTitulo(e.target.value)} rows={2} required
              placeholder="Ex: Clean luxury para o seu dia a dia."
              className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-2.5 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-coal/60">Subtítulo</label>
            <textarea value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} rows={3}
              placeholder="Descrição exibida abaixo do título..."
              className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-2.5 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none" />
          </div>
        </div>

        {/* Estética editorial */}
        <div className="bg-white rounded-xl border border-ink/10 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-coal/50">Estética Editorial</h3>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-coal/60">Texto Watermark</label>
            <p className="text-[10px] text-coal/40">Aparece gigante e semi-transparente ao fundo do banner (ex: FYSI, VERÃO, NOVA COLEÇÃO).</p>
            <input
              type="text"
              value={watermarkTexto}
              onChange={(e) => setWatermarkTexto(e.target.value)}
              placeholder="Ex: FYSI"
              className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-2.5 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-coal/60">Posição do Conteúdo</label>
            <div className="grid grid-cols-2 gap-2">
              {(["esquerda", "direita"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setLayoutPos(pos)}
                  className={`h-10 rounded-md border text-sm font-semibold capitalize transition-all ${
                    layoutPos === pos
                      ? "border-ink bg-ink text-white"
                      : "border-ink/15 bg-pearl text-coal/60 hover:border-ink/40"
                  }`}
                >
                  {pos === "esquerda" ? "← Esquerda" : "Direita →"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botão */}
        <div className="bg-white rounded-xl border border-ink/10 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-coal/50">Botão de Ação</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-coal/60">Texto</label>
              <input type="text" value={botaoTexto} onChange={(e) => setBotaoTexto(e.target.value)}
                placeholder="Ex: Ver Coleção"
                className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-2.5 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-coal/60">Link</label>
              <div className="relative">
                <input type="text" value={botaoLink} onChange={(e) => setBotaoLink(e.target.value)}
                  placeholder="/produtos"
                  className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-2.5 pr-9 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40" />
                <ExternalLink size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-coal/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Imagem */}
        <div className="bg-white rounded-xl border border-ink/10 p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-coal/50 mb-4">Imagem de Fundo</h3>
          <ImageUpload
            label="Foto do Banner *"
            value={imagemUrl}
            onChange={setImagemUrl}
            hint="Recomendado: proporção 16:9, mínimo 1200px de largura."
          />
        </div>

        {/* Visibilidade */}
        <div className="bg-white rounded-xl border border-ink/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink">Visível na loja</p>
              <p className="text-xs text-coal/50">Controla se este banner aparece no carrossel.</p>
            </div>
            <button type="button" onClick={() => setAtivo((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40 ${ativo ? "bg-gold" : "bg-ink/20"}`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${ativo ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-5 text-sm font-bold text-white hover:bg-ink/90 disabled:opacity-50 transition-all">
            {saving ? "Salvando..." : saved ? <><Check size={14} className="text-green-400" /> Salvo!</> : <><Save size={14} /> {submitLabel}</>}
          </button>
          <button type="button" onClick={onCancel}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/15 px-5 text-sm font-medium text-coal/70 hover:bg-ink/5 transition-all">
            <X size={14} /> Cancelar
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-coal/50">Preview</p>
        <div className={`relative overflow-hidden rounded-xl min-h-[300px] flex items-end transition-opacity ${ativo ? "opacity-100" : "opacity-40"}`}>
          {preview.imagemUrl ? (
            <img src={preview.imagemUrl} alt="Preview" className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/brand/logo-preto.png"; }} />
          ) : (
            <div className="absolute inset-0 bg-ink/80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
          <div className="relative p-5 space-y-2 w-full">
            {preview.eyebrow && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />{preview.eyebrow}
              </div>
            )}
            <p className="font-serif text-lg font-semibold text-white leading-snug">
              {preview.titulo || <span className="opacity-40">Título do banner...</span>}
            </p>
            {preview.subtitulo && <p className="text-xs text-white/70 line-clamp-2">{preview.subtitulo}</p>}
            {preview.botaoTexto && (
              <span className="inline-flex items-center rounded-md bg-gold px-3 py-1 text-xs font-bold text-ink">
                {preview.botaoTexto}
              </span>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${ativo ? "bg-green-500/90 text-white" : "bg-ink/60 text-white/60"}`}>
              {ativo ? <Eye size={9} /> : <EyeOff size={9} />}{ativo ? "Visível" : "Oculto"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBannersPage() {
  const { banners, addBanner, updateBanner, deleteBanner } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const sorted = [...banners].sort((a, b) => a.ordem - b.ordem);

  const handleCreate = async (data: Omit<Banner, "id" | "ordem" | "criadoEm">) => {
    setSaving(true);
    setSaveError(null);
    try {
      await addBanner(data);
      setSaved(true);
      setTimeout(() => { setSaved(false); setCreating(false); }, 1500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao criar banner. Tente novamente.");
    } finally { setSaving(false); }
  };

  const handleUpdate = async (id: string, data: Omit<Banner, "id" | "ordem" | "criadoEm">) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateBanner(id, data);
      setSaved(true);
      setTimeout(() => { setSaved(false); setEditingId(null); }, 1500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao atualizar banner. Tente novamente.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja remover este banner?")) return;
    await deleteBanner(id);
  };

  const handleMoveUp = async (id: string) => {
    const idx = sorted.findIndex((b) => b.id === id);
    if (idx <= 0) return;
    const a = sorted[idx];
    const b = sorted[idx - 1];
    await Promise.all([
      updateBanner(a.id, { ordem: b.ordem }),
      updateBanner(b.id, { ordem: a.ordem }),
    ]);
  };

  const handleMoveDown = async (id: string) => {
    const idx = sorted.findIndex((b) => b.id === id);
    if (idx >= sorted.length - 1) return;
    const a = sorted[idx];
    const b = sorted[idx + 1];
    await Promise.all([
      updateBanner(a.id, { ordem: b.ordem }),
      updateBanner(b.id, { ordem: a.ordem }),
    ]);
  };

  const toggleAtivo = async (banner: Banner) => {
    await updateBanner(banner.id, { ativo: !banner.ativo });
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gold font-bold">Loja</p>
          <h1 className="font-serif text-3xl font-semibold text-ink mt-1">Banners</h1>
          <p className="text-sm text-coal/60 mt-1">
            Gerencie o carrossel de banners exibido no topo da página inicial.
            {sorted.length > 1 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                {sorted.length} banners — carrossel ativo
              </span>
            )}
          </p>
        </div>
        {!creating && editingId === null && (
          <button onClick={() => setCreating(true)}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-gold px-4 text-sm font-bold text-ink hover:bg-gold/90 transition-all flex-shrink-0">
            <Plus size={15} /> Novo Banner
          </button>
        )}
      </div>

      {/* Banner de erro */}
      {saveError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-bold shrink-0">Erro:</span>
          <p>{saveError}</p>
        </div>
      )}

      {/* Formulário de criação */}
      {creating && (
        <div className="rounded-xl border-2 border-gold/40 bg-gold/5 p-6 space-y-4">
          <p className="text-sm font-bold text-ink uppercase tracking-wider">Novo Banner</p>
          <BannerForm
            initial={EMPTY}
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
            saving={saving}
            saved={saved}
            submitLabel="Adicionar Banner"
          />
        </div>
      )}

      {/* Lista de banners */}
      {sorted.length === 0 && !creating ? (
        <div className="rounded-xl border border-dashed border-ink/20 p-12 text-center">
          <Image size={36} className="mx-auto text-coal/25 mb-3" />
          <p className="text-coal/60 font-serif text-lg">Nenhum banner cadastrado.</p>
          <p className="text-xs text-coal/40 mt-1">Clique em &quot;Novo Banner&quot; para criar o primeiro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((banner, idx) => (
            <div key={banner.id} className="rounded-xl border border-ink/10 bg-white overflow-hidden">
              {editingId === banner.id ? (
                <div className="p-6 space-y-4">
                  <p className="text-sm font-bold text-ink uppercase tracking-wider">Editar Banner #{idx + 1}</p>
                  <BannerForm
                    initial={banner}
                    onSave={(data) => handleUpdate(banner.id, data)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                    saved={saved}
                    submitLabel="Salvar Alterações"
                  />
                </div>
              ) : (
                <div className="flex items-stretch gap-0">
                  {/* Thumb */}
                  <div className="relative w-28 flex-shrink-0 bg-linen overflow-hidden">
                    {banner.imagemUrl ? (
                      <img src={banner.imagemUrl} alt={banner.titulo}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/brand/logo-preto.png"; }} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image size={20} className="text-coal/30" />
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1">
                      <span className="text-[9px] font-bold bg-ink/70 text-white px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {banner.eyebrow && (
                          <p className="text-[10px] uppercase tracking-wider text-gold font-bold truncate">{banner.eyebrow}</p>
                        )}
                        <p className="text-sm font-bold text-ink line-clamp-1 mt-0.5">{banner.titulo || <span className="text-coal/40 italic">Sem título</span>}</p>
                        {banner.subtitulo && (
                          <p className="text-xs text-coal/50 line-clamp-1 mt-0.5">{banner.subtitulo}</p>
                        )}
                        {banner.botaoTexto && (
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-coal/50">
                            <ExternalLink size={9} /> {banner.botaoTexto} → {banner.botaoLink}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Toggle visível */}
                        <button onClick={() => toggleAtivo(banner)} title={banner.ativo ? "Ocultar" : "Exibir"}
                          className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors ${banner.ativo ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-ink/5 text-coal/40 hover:bg-ink/10"}`}>
                          {banner.ativo ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        {/* Reordenar */}
                        <button onClick={() => handleMoveUp(banner.id)} disabled={idx === 0}
                          className="h-7 w-7 rounded-md flex items-center justify-center bg-ink/5 text-coal/50 hover:bg-ink/10 disabled:opacity-30 transition-colors">
                          <ChevronUp size={14} />
                        </button>
                        <button onClick={() => handleMoveDown(banner.id)} disabled={idx === sorted.length - 1}
                          className="h-7 w-7 rounded-md flex items-center justify-center bg-ink/5 text-coal/50 hover:bg-ink/10 disabled:opacity-30 transition-colors">
                          <ChevronDown size={14} />
                        </button>
                        {/* Editar */}
                        <button onClick={() => { setEditingId(banner.id); setCreating(false); }}
                          className="h-7 w-7 rounded-md flex items-center justify-center bg-ink/5 text-coal/60 hover:bg-ink/10 transition-colors">
                          <Pencil size={13} />
                        </button>
                        {/* Deletar */}
                        <button onClick={() => handleDelete(banner.id)}
                          className="h-7 w-7 rounded-md flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
