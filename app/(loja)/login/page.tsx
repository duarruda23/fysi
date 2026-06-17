"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, ArrowRight, UserPlus, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useStore } from "@/lib/store";
import ClientOnly from "@/components/ClientOnly";

function CustomerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clienteLogado, loginCliente, cadastrarCliente } = useStore();

  const redirectPath = searchParams.get("redirect") || "/minha-conta";
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [showLoginSenha, setShowLoginSenha] = useState(false);

  // Cadastro
  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regTelefone, setRegTelefone] = useState("");
  const [regSenha, setRegSenha] = useState("");
  const [showRegSenha, setShowRegSenha] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clienteLogado) router.push(redirectPath);
  }, [clienteLogado, router, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    if (!loginEmail.trim() || !loginSenha.trim()) {
      setErrorMsg("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    const result = await loginCliente(loginEmail.trim(), loginSenha);
    setLoading(false);
    if (result.ok) {
      setSuccessMsg("Bem-vindo de volta!");
      setTimeout(() => router.push(redirectPath), 600);
    } else {
      setErrorMsg(result.error || "Credenciais incorretas.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    if (!regNome.trim() || !regEmail.trim() || !regSenha.trim()) {
      setErrorMsg("Nome, e-mail e senha são obrigatórios.");
      return;
    }
    if (regSenha.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const result = await cadastrarCliente({
      nome: regNome.trim(),
      email: regEmail.trim(),
      telefone: regTelefone.trim(),
      senha: regSenha,
    });
    setLoading(false);
    if (result.ok) {
      setSuccessMsg("Conta criada com sucesso!");
      setTimeout(() => router.push(redirectPath), 600);
    } else {
      setErrorMsg(result.error || "Erro ao criar conta.");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-6 md:py-12">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl font-bold text-ink">Área do Cliente</h1>
        <p className="text-sm text-coal/60">
          Entre ou crie sua conta para acompanhar pedidos e gerenciar endereços
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink/10">
        {(["login", "register"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setErrorMsg(""); }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab
                ? "border-gold text-ink"
                : "border-transparent text-coal/50 hover:text-ink/80"
            }`}
          >
            {tab === "login" ? <><User size={15} /> Já tenho conta</> : <><UserPlus size={15} /> Criar conta</>}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-800 text-xs leading-relaxed">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2 text-emerald-800 text-xs leading-relaxed">
          <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-ink/10 p-6 shadow-line">
        {activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">E-mail *</label>
              <div className="relative flex items-center rounded-md border border-ink/10">
                <Mail size={14} className="absolute left-3 text-coal/40" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full h-11 bg-transparent pl-9 pr-3 text-sm text-ink outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">Senha *</label>
              <div className="relative flex items-center rounded-md border border-ink/10">
                <Lock size={14} className="absolute left-3 text-coal/40" />
                <input
                  type={showLoginSenha ? "text" : "password"}
                  required
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  placeholder="••••••"
                  className="w-full h-11 bg-transparent pl-9 pr-10 text-sm text-ink outline-none"
                />
                <button type="button" onClick={() => setShowLoginSenha(!showLoginSenha)} className="absolute right-3 text-coal/40 hover:text-ink">
                  {showLoginSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-ink hover:bg-coal text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-60"
            >
              {loading ? "Entrando..." : <><span>Entrar</span><ArrowRight size={15} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">Nome Completo *</label>
              <div className="relative flex items-center rounded-md border border-ink/10">
                <User size={14} className="absolute left-3 text-coal/40" />
                <input
                  type="text"
                  required
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full h-11 bg-transparent pl-9 pr-3 text-sm text-ink outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">E-mail *</label>
              <div className="relative flex items-center rounded-md border border-ink/10">
                <Mail size={14} className="absolute left-3 text-coal/40" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full h-11 bg-transparent pl-9 pr-3 text-sm text-ink outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">
                WhatsApp / Telefone <span className="normal-case font-normal text-coal/40">(opcional)</span>
              </label>
              <div className="relative flex items-center rounded-md border border-ink/10">
                <Phone size={14} className="absolute left-3 text-coal/40" />
                <input
                  type="text"
                  value={regTelefone}
                  onChange={(e) => setRegTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full h-11 bg-transparent pl-9 pr-3 text-sm text-ink outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">Senha * <span className="normal-case font-normal text-coal/40">(mín. 6 caracteres)</span></label>
              <div className="relative flex items-center rounded-md border border-ink/10">
                <Lock size={14} className="absolute left-3 text-coal/40" />
                <input
                  type={showRegSenha ? "text" : "password"}
                  required
                  minLength={6}
                  value={regSenha}
                  onChange={(e) => setRegSenha(e.target.value)}
                  placeholder="••••••"
                  className="w-full h-11 bg-transparent pl-9 pr-10 text-sm text-ink outline-none"
                />
                <button type="button" onClick={() => setShowRegSenha(!showRegSenha)} className="absolute right-3 text-coal/40 hover:text-ink">
                  {showRegSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gold text-ink text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-60"
            >
              {loading ? "Criando conta..." : <><span>Criar Conta</span><CheckCircle2 size={15} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <React.Suspense fallback={<div className="max-w-md mx-auto py-12 text-center text-sm text-coal/50">Carregando...</div>}>
      <CustomerLoginContent />
    </React.Suspense>
  );
}
