"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function ImageUpload({ value, onChange, label, hint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");
      onChange(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-coal/60 block">
          {label}
        </label>
      )}

      {/* Preview com botão de remover se já há imagem */}
      {value && (
        <div className="relative w-full aspect-[16/7] rounded-lg overflow-hidden border border-ink/10 bg-linen group">
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/brand/logo-preto.png";
            }}
          />
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-9 px-3 rounded-md bg-white text-ink text-xs font-bold flex items-center gap-1.5 shadow hover:bg-pearl transition-all"
            >
              <Upload size={13} /> Trocar imagem
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="h-9 w-9 rounded-md bg-white text-clay flex items-center justify-center shadow hover:bg-red-50 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Drop zone — só aparece quando não há imagem */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className="relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-ink/20 bg-pearl/30 p-8 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all"
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="text-gold animate-spin" />
              <p className="text-sm text-coal/60 font-medium">Enviando...</p>
            </>
          ) : (
            <>
              <div className="h-11 w-11 rounded-full bg-ink/5 flex items-center justify-center">
                <ImageIcon size={20} className="text-coal/40" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  Clique para escolher ou arraste aqui
                </p>
                <p className="text-xs text-coal/50 mt-0.5">JPG, PNG ou WebP — máximo 5MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Input file oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="sr-only"
      />

      {hint && !error && (
        <p className="text-[11px] text-coal/45">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-clay font-medium">{error}</p>
      )}
    </div>
  );
}
