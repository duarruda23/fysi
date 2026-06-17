"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Phone, MapPin, ArrowRight, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import ClientOnly from "@/components/ClientOnly";

function CustomerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clienteLogado, loginCliente, cadastrarCliente } = useStore();

  const redirectPath = searchParams.get("redirect") || "/";

  // Tab State: "login" or "register"
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form inputs
  const [phoneLogin, setPhoneLogin] = useState("");
  const [nameReg, setNameReg] = useState("");
  const [phoneReg, setPhoneReg] = useState("");
  const [addressReg, setAddressReg] = useState("");

  // UI States
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (clienteLogado) {
      router.push(redirectPath);
    }
  }, [clienteLogado, router, redirectPath]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanInput = phoneLogin.replace(/\D/g, "");
    if (!cleanInput) {
      setErrorMsg("Digite um número de WhatsApp/Telefone válido.");
      return;
    }

    const success = await loginCliente(phoneLogin);
    if (success) {
      setSuccessMsg("Acesso autorizado!");
      setTimeout(() => {
        router.push(redirectPath);
      }, 800);
    } else {
      setErrorMsg(
        "Nenhuma conta localizada para este telefone. Use a aba de cadastro para criar sua conta."
      );
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!nameReg.trim()) {
      setErrorMsg("Nome é obrigatório.");
      return;
    }
    if (!phoneReg.trim()) {
      setErrorMsg("WhatsApp / Telefone é obrigatório.");
      return;
    }

    cadastrarCliente({
      nome: nameReg.trim(),
      telefone: phoneReg.trim(),
      endereco: addressReg.trim()
    });

    setSuccessMsg("Cadastro realizado com sucesso!");
    setTimeout(() => {
      router.push(redirectPath);
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-6 md:py-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl font-bold text-ink">Área do Cliente</h1>
        <p className="text-sm text-coal/60">
          Identifique-se para finalizar compras e acompanhar seus pedidos em tempo real
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-ink/10">
        <button
          onClick={() => {
            setActiveTab("login");
            setErrorMsg("");
          }}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "login"
              ? "border-gold text-ink font-bold"
              : "border-transparent text-coal/50 hover:text-ink/80"
          }`}
        >
          <User size={16} />
          Já sou cliente
        </button>
        <button
          onClick={() => {
            setActiveTab("register");
            setErrorMsg("");
          }}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "register"
              ? "border-gold text-ink font-bold"
              : "border-transparent text-coal/50 hover:text-ink/80"
          }`}
        >
          <UserPlus size={16} />
          Criar minha conta
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-2.5 text-red-800 text-xs leading-relaxed animate-fade-in">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-2.5 text-emerald-800 text-xs leading-relaxed animate-pulse">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Forms container */}
      <div className="bg-white rounded-xl border border-ink/10 p-6 shadow-line">
        {activeTab === "login" ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="phone-login" className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">
                Seu WhatsApp / Telefone *
              </label>
              <div className="relative flex items-center rounded-md border border-ink/10 bg-white">
                <Phone size={15} className="absolute left-3 text-coal/45" />
                <input
                  type="text"
                  id="phone-login"
                  required
                  value={phoneLogin}
                  onChange={(e) => setPhoneLogin(e.target.value)}
                  placeholder="Ex: (11) 99912-4300"
                  className="w-full h-11 bg-transparent pl-10 pr-3 text-sm text-ink outline-none focus:border-ink"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-ink hover:bg-coal text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <span>Entrar</span>
              <ArrowRight size={15} />
            </button>

            {/* Helper tips for testing */}
            <div className="pt-4 border-t border-ink/5 mt-4 space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gold">
                Dica de Teste (Mock accounts):
              </p>
              <p className="text-[11px] text-coal/55 leading-relaxed">
                Você pode utilizar qualquer um dos telefones dos clientes de exemplo para entrar e ver os históricos salvos:
              </p>
              <ul className="text-[11px] text-ink font-mono space-y-1 list-disc pl-4">
                <li>Marina Torres: <span className="font-bold select-all">(11) 99912-4300</span></li>
                <li>Bianca Prado: <span className="font-bold select-all">(21) 98871-9021</span></li>
                <li>Clara Mendes: <span className="font-bold select-all">(31) 97712-8080</span></li>
              </ul>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <label htmlFor="name-reg" className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">
                Nome Completo *
              </label>
              <div className="relative flex items-center rounded-md border border-ink/10 bg-white">
                <User size={15} className="absolute left-3 text-coal/45" />
                <input
                  type="text"
                  id="name-reg"
                  required
                  value={nameReg}
                  onChange={(e) => setNameReg(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full h-11 bg-transparent pl-10 pr-3 text-sm text-ink outline-none"
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label htmlFor="phone-reg" className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">
                WhatsApp / Telefone *
              </label>
              <div className="relative flex items-center rounded-md border border-ink/10 bg-white">
                <Phone size={15} className="absolute left-3 text-coal/45" />
                <input
                  type="text"
                  id="phone-reg"
                  required
                  value={phoneReg}
                  onChange={(e) => setPhoneReg(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full h-11 bg-transparent pl-10 pr-3 text-sm text-ink outline-none"
                />
              </div>
            </div>

            {/* Endereco */}
            <div className="space-y-1.5">
              <label htmlFor="address-reg" className="text-[10px] font-semibold uppercase tracking-wider text-coal/60 block">
                Endereço de Entrega (Opcional)
              </label>
              <div className="relative flex items-start rounded-md border border-ink/10 bg-white p-2">
                <MapPin size={15} className="text-coal/45 mt-1 mr-2 shrink-0" />
                <textarea
                  id="address-reg"
                  rows={2}
                  value={addressReg}
                  onChange={(e) => setAddressReg(e.target.value)}
                  placeholder="Rua, número, cidade, CEP..."
                  className="w-full bg-transparent text-sm text-ink outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-gold text-ink text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <span>Cadastrar & Entrar</span>
              <CheckCircle2 size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <React.Suspense fallback={
      <div className="max-w-md mx-auto py-12 text-center text-sm text-coal/50">
        Carregando formulário...
      </div>
    }>
      <CustomerLoginContent />
    </React.Suspense>
  );
}
