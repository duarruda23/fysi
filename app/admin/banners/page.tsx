"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Save, Check, Image, ExternalLink, Eye, EyeOff } from "lucide-react";

export default function AdminBannersPage() {
  const { banner, updateBanner } = useStore();

  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [botaoTexto, setBotaoTexto] = useState("");
  const [botaoLink, setBotaoLink] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Preencher campos quando o banner carregar do banco
  useEffect(() => {
    if (banner) {
      setTitulo(banner.titulo || "");
      setSubtitulo(banner.subtitulo || "");
      setEyebrow(banner.eyebrow || "");
      setBotaoTexto(banner.botaoTexto || "");
      setBotaoLink(banner.botaoLink || "");
      setImagemUrl(banner.imagemUrl || "");
      setAtivo(banner.ativo ?? true);
    }
  }, [banner]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBanner({
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim(),
        eyebrow: eyebrow.trim(),
        botaoTexto: botaoTexto.trim(),
        botaoLink: botaoLink.trim(),
        imagemUrl: imagemUrl.trim(),
        ativo,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-gold font-bold">Loja</p>
        <h1 className="font-serif text-3xl font-semibold text-ink mt-1">Banner Principal</h1>
        <p className="text-sm text-coal/60 mt-1">
          Edite o banner hero que aparece no topo da página inicial da loja.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Formulário */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-xl border border-ink/10 p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-coal/50">Conteúdo</h2>

            {/* Eyebrow */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-coal/60">
                Texto Eyebrow
              </label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="Ex: Nova Coleção 2026"
                className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-3 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <p className="text-[11px] text-coal/40">Pequena tag exibida acima do título principal.</p>
            </div>

            {/* Titulo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-coal/60">
                Titulo Principal *
              </label>
              <textarea
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                rows={2}
                placeholder="Ex: Clean luxury para o seu dia a dia."
                required
                className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-3 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
              />
            </div>

            {/* Subtitulo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-coal/60">
                Subtitulo / Descrição
              </label>
              <textarea
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                rows={3}
                placeholder="Ex: Descubra peças de linho e cetim esculpidas para durar..."
                className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-3 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-ink/10 p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-coal/50">Botão de Ação</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-coal/60">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={botaoTexto}
                  onChange={(e) => setBotaoTexto(e.target.value)}
                  placeholder="Ex: Explorar Catálogo"
                  className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-3 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-coal/60">
                  Link do Botão
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={botaoLink}
                    onChange={(e) => setBotaoLink(e.target.value)}
                    placeholder="Ex: /produtos"
                    className="w-full rounded-md border border-ink/15 bg-pearl px-4 py-3 pr-10 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                  <ExternalLink size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-coal/30" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-ink/10 p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-coal/50">Imagem de Fundo</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-coal/60">
                URL da Imagem *
              </label>
              <div className="relative">
                <Image size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-coal/40" />
                <input
                  type="text"
                  value={imagemUrl}
                  onChange={(e) => setImagemUrl(e.target.value)}
                  placeholder="Ex: /brand/perfil-5.png ou https://..."
                  required
                  className="w-full rounded-md border border-ink/15 bg-pearl pl-9 pr-4 py-3 text-sm text-ink placeholder:text-coal/30 focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
              </div>
              <p className="text-[11px] text-coal/40">
                Use um caminho local (ex: /brand/foto.png) ou URL externa de imagem.
              </p>
            </div>
          </div>

          {/* Visibilidade */}
          <div className="bg-white rounded-xl border border-ink/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink">Exibir banner na loja</p>
                <p className="text-xs text-coal/50 mt-0.5">
                  Quando desativado, o banner não aparece na página inicial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAtivo((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40 ${
                  ativo ? "bg-gold" : "bg-ink/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    ativo ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Botão salvar */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-6 text-sm font-bold text-white hover:bg-ink/90 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>Salvando...</>
              ) : saved ? (
                <><Check size={15} className="text-green-400" /> Salvo com sucesso!</>
              ) : (
                <><Save size={15} /> Salvar Banner</>
              )}
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-coal/50">
            Preview em tempo real
          </p>
          <div className="sticky top-8">
            <div
              className={`relative overflow-hidden rounded-xl min-h-[360px] flex items-end transition-opacity ${
                ativo ? "opacity-100" : "opacity-40"
              }`}
            >
              {/* Background */}
              {imagemUrl ? (
                <img
                  src={imagemUrl}
                  alt="Preview banner"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/brand/logo-preto.png";
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-ink/80" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />

              {/* Overlay content */}
              <div className="relative p-6 space-y-3 w-full">
                {eyebrow && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    {eyebrow}
                  </div>
                )}
                <h3 className="font-serif text-xl font-semibold text-white leading-snug">
                  {titulo || <span className="opacity-40">Título do banner...</span>}
                </h3>
                {subtitulo && (
                  <p className="text-xs text-white/70 leading-relaxed line-clamp-2">{subtitulo}</p>
                )}
                {botaoTexto && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-ink">
                      {botaoTexto}
                    </span>
                  </div>
                )}
              </div>

              {/* Status pill */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${ativo ? "bg-green-500/90 text-white" : "bg-ink/60 text-white/60"}`}>
                  {ativo ? <Eye size={10} /> : <EyeOff size={10} />}
                  {ativo ? "Visível" : "Oculto"}
                </span>
              </div>
            </div>

            <p className="mt-2 text-center text-[10px] text-coal/40">
              Visualização aproximada — salve para aplicar na loja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
