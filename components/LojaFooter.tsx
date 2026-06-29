"use client";

import Link from "next/link";

export default function LojaFooter() {
  return (
    <footer className="bg-ink px-5 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <img
              src="/brand/logo-horizontal-branco.png"
              alt="Fysi"
              className="h-7 w-auto object-contain"
            />
            <p className="max-w-sm text-sm text-white/60 leading-6">
              Plataforma e-commerce Fysi. Moda autoral, curadoria minimalista, alfaiataria premium e peças essenciais para o seu dia a dia.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-4">Navegação</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Vitrine / Home</Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-white transition-colors">Catálogo Completo</Link>
              </li>
              <li>
                <Link href="/meus-pedidos" className="hover:text-white transition-colors">Acompanhar Pedidos</Link>
              </li>
            </ul>
          </div>


        </div>

        <div className="pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-white/40">
          <p>© {new Date().getFullYear()} Fysi. Todos os direitos reservados.</p>
          <p>Feito com elegância para vender, clareza para gerenciar.</p>
        </div>
      </div>
    </footer>
  );
}
