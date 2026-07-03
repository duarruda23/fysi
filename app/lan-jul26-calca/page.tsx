"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { Peca } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────
   Componente: formulário de captura de leads
───────────────────────────────────────────────────────────── */
function LeadForm() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads-lancamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone, email }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setErrorMsg(data.error); return; }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Erro de conexão. Tente novamente.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mx-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-serif text-xl font-semibold text-ink">Você está na lista!</p>
        <p className="text-sm text-coal/70 leading-relaxed">
          Entraremos em contato com condições exclusivas antes do lançamento oficial.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Seu nome completo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        className="w-full h-12 px-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 text-sm outline-none focus:border-gold/60 focus:bg-white/15 transition-all"
      />
      <input
        type="tel"
        placeholder="WhatsApp (11) 99999-9999"
        value={telefone}
        onChange={(e) => setTelefone(formatPhone(e.target.value))}
        required
        className="w-full h-12 px-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 text-sm outline-none focus:border-gold/60 focus:bg-white/15 transition-all"
      />
      <input
        type="email"
        placeholder="Seu melhor e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full h-12 px-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 text-sm outline-none focus:border-gold/60 focus:bg-white/15 transition-all"
      />
      {errorMsg && <p className="text-red-300 text-xs">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-12 rounded-lg bg-gold text-ink font-semibold text-sm tracking-wide hover:bg-gold/90 disabled:opacity-60 transition-colors"
      >
        {status === "loading" ? "Enviando..." : "Quero acesso antecipado"}
      </button>
      <p className="text-center text-[11px] text-white/40">
        Sem spam. Apenas ofertas exclusivas para lojistas.
      </p>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────
   Componente: card de produto
───────────────────────────────────────────────────────────── */
function ProdutoCard({ peca }: { peca: Peca }) {
  const foto = peca.fotos?.[0];
  return (
    <div className="group relative overflow-hidden rounded-xl bg-linen border border-ink/8">
      <div className="aspect-square overflow-hidden bg-pearl">
        {foto ? (
          <img
            src={foto}
            alt={peca.nome}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <img src="/brand/logo-preto.png" alt="Fysi" className="w-16 opacity-20" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-serif text-base font-semibold text-ink leading-tight">{peca.nome}</p>
        <p className="text-xs text-coal/50 mt-0.5">{peca.categoria}</p>
        <p className="text-sm font-semibold text-gold mt-2">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(peca.preco)}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Componente: CTA final (sessão 3)
───────────────────────────────────────────────────────────── */
function CtaFinal() {
  const formRef = useRef<HTMLDivElement>(null);

  function scrollToForm() {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="bg-ink py-20 px-4 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Lançamento Julho 2026
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white leading-tight text-balance">
          Venda mais com calças que falam por si mesmas
        </h2>
        <p className="text-white/60 text-base leading-relaxed text-balance">
          Modelos exclusivos, tecidos premium e uma grade completa de tamanhos — direto de fábrica para a sua loja. Sem atravessador, sem compromisso mínimo alto.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={scrollToForm}
            className="h-12 px-8 rounded-lg bg-gold text-ink font-semibold text-sm tracking-wide hover:bg-gold/90 transition-colors"
          >
            Garantir acesso antecipado
          </button>
          <a
            href="https://wa.me/5500000000000?text=Olá! Vi o lançamento da Fysi e quero saber mais."
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 px-8 rounded-lg border border-white/20 text-white font-semibold text-sm tracking-wide hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.552 4.083 1.518 5.797L0 24l6.335-1.502A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.372l-.36-.214-3.727.884.939-3.638-.234-.373A9.818 9.818 0 1112 21.818z"/>
            </svg>
            Falar no WhatsApp
          </a>
        </div>

        {/* Diferenciais */}
        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
          {[
            { label: "Direto de fábrica", desc: "Preço sem atravessador" },
            { label: "Grade completa", desc: "Do 36 ao 52" },
            { label: "Mínimo acessível", desc: "A partir de 10 peças" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-white font-semibold text-sm">{item.label}</p>
              <p className="text-white/40 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Página principal
───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);

  useEffect(() => {
    fetch("/api/pecas")
      .then((r) => r.json())
      .then((data: Peca[]) => setPecas(data.filter((p) => p.ativo && p.fotos?.length > 0)))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-background font-sans">

      {/* ── SESSÃO 1: HERO ───────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-ink">

        {/* Imagem de fundo — desktop: sobreposição lateral direita */}
        <div className="absolute inset-0 hidden md:block">
          <img
            src="/landing/calca-hero.png"
            alt=""
            aria-hidden="true"
            className="absolute right-0 top-0 h-full w-[60%] object-cover object-left"
            fetchPriority="high"
            decoding="sync"
          />
          {/* degradê da esquerda cobrindo a imagem */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-transparent" />
        </div>

        {/* Imagem — mobile: acima do H1 com degradê embaixo */}
        <div className="block md:hidden absolute top-0 left-0 right-0 h-56">
          <img
            src="/landing/calca-hero.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            fetchPriority="high"
            decoding="sync"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/60 to-ink" />
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 md:py-0 flex flex-col md:flex-row md:items-center gap-10 md:gap-16">

          {/* Textos + formulário */}
          <div className="w-full md:max-w-[480px] pt-52 md:pt-0 space-y-6">
            {/* Badge */}
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-gold border border-gold/30 rounded-full px-3 py-1">
              Lançamento · Julho 2026
            </span>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] text-balance">
              A calça que sua{" "}
              <em className="not-italic text-gold">loja estava</em>{" "}
              esperando
            </h1>

            <p className="text-white/65 text-base md:text-lg leading-relaxed text-balance">
              Modelos exclusivos direto de fábrica. Tecido premium, caimento perfeito e uma grade de cores que vende por conta própria. Cadastre-se e garanta condições especiais de lançamento.
            </p>

            {/* Formulário */}
            <div id="hero-form" className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-6">
              <p className="text-white/80 text-sm font-medium mb-4">
                Garanta acesso antecipado e desconto exclusivo:
              </p>
              <LeadForm />
            </div>
          </div>

        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
          <span className="text-white text-[10px] uppercase tracking-widest">Ver coleção</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </div>
      </section>

      {/* ── SESSÃO 2: GALERIA DE PRODUTOS ─────────────────────── */}
      <section className="bg-pearl py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Coleção Fysi</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink text-balance">
              Peças que chegam prontas para vender
            </h2>
            <p className="text-coal/60 text-base max-w-xl mx-auto text-balance leading-relaxed">
              Cada modelo foi desenvolvido com foco no caimento, no tecido e na durabilidade — porque quando sua cliente fica satisfeita, ela volta.
            </p>
          </div>

          {pecas.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-linen animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pecas.map((p) => <ProdutoCard key={p.id} peca={p} />)}
            </div>
          )}

          {/* CTA intermediário */}
          <div className="mt-12 text-center">
            <button
              onClick={() => document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth" })}
              className="h-12 px-8 rounded-lg bg-ink text-white font-semibold text-sm tracking-wide hover:bg-ink/85 transition-colors"
            >
              Quero acesso antecipado
            </button>
          </div>
        </div>
      </section>

      {/* ── SESSÃO 3: CTA FINAL + DIFERENCIAIS ───────────────── */}
      <CtaFinal />

      {/* Footer mínimo */}
      <footer className="bg-ink border-t border-white/8 py-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/brand/logo-horizontal-branco.png"
            alt="Fysi"
            width={80}
            height={20}
            className="h-5 w-auto opacity-60"
          />
          <p className="text-white/30 text-[11px]">
            © {new Date().getFullYear()} Fysi. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-[11px] text-white/30">
            <a href="/politica-de-privacidade" className="hover:text-white/50 transition-colors">Privacidade</a>
            <a href="/termos-de-uso" className="hover:text-white/50 transition-colors">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
