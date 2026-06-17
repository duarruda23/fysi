"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, LogOut, User } from "lucide-react";
import { useStore } from "@/lib/store";
import ClientOnly from "./ClientOnly";

export default function LojaHeader() {
  const { carrinho, clienteLogado, logoutCliente } = useStore();
  const pathname = usePathname();
  
  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-pearl/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/brand/logo-horizontal-preto.png"
            alt="Fysi"
            className="h-7 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/produtos"
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/produtos"
                ? "bg-white text-ink shadow-line"
                : "text-coal/70 hover:bg-white/60 hover:text-ink"
            }`}
          >
            Catálogo
          </Link>
          <Link
            href="/minha-conta"
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/minha-conta"
                ? "bg-white text-ink shadow-line"
                : "text-coal/70 hover:bg-white/60 hover:text-ink"
            }`}
          >
            Minha Conta
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Cliente greeting / Login */}
          <ClientOnly>
            {clienteLogado ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/minha-conta" className="flex items-center gap-2 bg-white/50 border border-ink/8 rounded-md px-3 py-1.5 text-xs text-ink hover:bg-white transition-colors">
                  <User size={13} />
                  <span className="font-semibold">{clienteLogado.nome.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={logoutCliente}
                  className="h-8 w-8 flex items-center justify-center rounded-md border border-ink/10 bg-white hover:text-clay transition-colors"
                  title="Sair da Conta"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-md border border-ink/10 bg-white px-4 text-xs font-semibold text-coal hover:bg-pearl transition-colors"
              >
                <User size={14} />
                <span>Entrar</span>
              </Link>
            )}
          </ClientOnly>

          {/* Cart Icon with count */}
          <Link
            href="/carrinho"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-white text-ink hover:bg-pearl transition-colors"
            aria-label="Carrinho de compras"
          >
            <ShoppingBag size={18} />
            <ClientOnly>
              {totalItens > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink ring-2 ring-pearl animate-pulse">
                  {totalItens}
                </span>
              )}
            </ClientOnly>
          </Link>
        </div>
      </div>
      
      {/* Mobile navigation helper */}
      <div className="border-t border-ink/5 py-2 px-5 flex justify-between bg-pearl/40 md:hidden text-xs">
        <div className="flex gap-4">
          <Link
            href="/produtos"
            className={`font-semibold uppercase tracking-wider ${
              pathname === "/produtos" ? "text-gold" : "text-coal/65"
            }`}
          >
            Catálogo
          </Link>
          <span className="text-ink/10">|</span>
          <Link
            href="/minha-conta"
            className={`font-semibold uppercase tracking-wider ${
              pathname === "/minha-conta" ? "text-gold" : "text-coal/65"
            }`}
          >
            Minha Conta
          </Link>
        </div>
        
        <ClientOnly>
          {clienteLogado ? (
            <div className="flex items-center gap-2 text-ink font-semibold">
              <span>Olá, {clienteLogado.nome.split(" ")[0]}</span>
              <button onClick={logoutCliente} className="text-clay">
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-coal/65 uppercase tracking-wider font-bold">
              Entrar
            </Link>
          )}
        </ClientOnly>
      </div>
    </header>
  );
}
