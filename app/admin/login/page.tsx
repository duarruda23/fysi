"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, User, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import ClientOnly from "@/components/ClientOnly";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminLogado, loginAdmin } = useStore();

  const redirectPath = searchParams.get("redirect") || "/admin/dashboard";

  // Form Inputs
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (adminLogado) {
      router.push(redirectPath);
    }
  }, [adminLogado, router, redirectPath]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!usuario.trim() || !senha.trim()) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = loginAdmin(usuario, senha);
      setIsSubmitting(false);

      if (success) {
        setSuccessMsg("Credenciais validadas! Redirecionando...");
        setTimeout(() => {
          router.push(redirectPath);
        }, 800);
      } else {
        setErrorMsg("Usuário ou senha incorretos. Verifique os dados e tente novamente.");
      }
    }, 600); // Tiny loading simulation
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-ink font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Branding Headers */}
        <div className="text-center space-y-2">
          <img
            src="/brand/logo-horizontal-preto.png"
            alt="Fysi"
            className="h-10 mx-auto object-contain"
          />
          <p className="text-[10px] uppercase tracking-[0.25em] text-coal/45 font-bold">
            Acesso Restrito · Gestão
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-ink/10 p-6 shadow-soft space-y-5">
          <h2 className="font-serif text-xl font-bold text-ink text-center">
            Login Administrativo
          </h2>

          {/* Messages */}
          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-800 text-xs animate-fade-in leading-relaxed">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2 text-emerald-800 text-xs animate-pulse leading-relaxed">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuário */}
            <div className="space-y-1.5">
              <label htmlFor="usuario" className="text-[10px] font-semibold uppercase tracking-wider text-coal/65 block">
                Nome de Usuário
              </label>
              <div className="relative flex items-center rounded-md border border-ink/10 bg-white">
                <User size={15} className="absolute left-3 text-coal/45" />
                <input
                  type="text"
                  id="usuario"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ex: admin"
                  className="w-full h-10 bg-transparent pl-10 pr-3 text-sm text-ink outline-none focus:border-ink rounded-md"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label htmlFor="senha" className="text-[10px] font-semibold uppercase tracking-wider text-coal/65 block">
                Senha de Acesso
              </label>
              <div className="relative flex items-center rounded-md border border-ink/10 bg-white">
                <Lock size={15} className="absolute left-3 text-coal/45" />
                <input
                  type="password"
                  id="senha"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 bg-transparent pl-10 pr-3 text-sm text-ink outline-none focus:border-ink rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-ink hover:bg-coal text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:bg-coal/60 disabled:cursor-not-allowed"
            >
              <KeyRound size={15} />
              <span>{isSubmitting ? "Autenticando..." : "Entrar no Painel"}</span>
            </button>
          </form>


        </div>

        {/* Back to store link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-coal/50 hover:text-ink transition-colors"
          >
            ← Voltar para a Loja
          </Link>
        </div>
      </div>
    </div>
  );
}
