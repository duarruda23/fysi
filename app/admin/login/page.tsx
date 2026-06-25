"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminLogado, loginAdmin } = useStore();

  const redirectPath = searchParams.get("redirect") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (adminLogado) {
      router.push(redirectPath);
    }
  }, [adminLogado, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !senha.trim()) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);
    const result = await loginAdmin(email, senha);
    setIsSubmitting(false);

    if (result.ok) {
      setSuccessMsg("Credenciais validadas! Redirecionando...");
      setTimeout(() => router.push(redirectPath), 800);
    } else {
      setErrorMsg(result.error ?? "E-mail ou senha incorretos. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-ink font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
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

        <div className="bg-white rounded-2xl border border-ink/10 p-6 shadow-soft space-y-5">
          <h2 className="font-serif text-xl font-bold text-ink text-center">
            Login Administrativo
          </h2>

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-800 text-xs leading-relaxed">
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
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-wider text-coal/65 block">
                E-mail
              </label>
              <div className="relative flex items-center rounded-md border border-ink/10 bg-white">
                <Mail size={15} className="absolute left-3 text-coal/45" />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fysiatacado@gmail.com"
                  className="w-full h-10 bg-transparent pl-10 pr-3 text-sm text-ink outline-none focus:border-ink rounded-md"
                />
              </div>
            </div>

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
              className="w-full h-11 bg-ink hover:bg-coal text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <KeyRound size={15} />
              <span>{isSubmitting ? "Autenticando..." : "Entrar no Painel"}</span>
            </button>
          </form>
        </div>

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
