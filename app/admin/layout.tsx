"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Menu, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";
import { useStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { adminLogado, loading } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  // Guard: Redirect if not logged in and not on login page
  useEffect(() => {
    if (!loading && !adminLogado && pathname !== "/admin/login") {
      router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [adminLogado, loading, pathname, router]);

  // If on login page, just render children without Admin Shell structure!
  if (pathname === "/admin/login") {
    return <ClientOnly>{children}</ClientOnly>;
  }

  // If loading or not logged in yet, render placeholder to avoid flash of content
  if (loading || !adminLogado) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center font-sans">
        <p className="text-sm text-coal/50 font-serif animate-pulse">Verificando credenciais Fysi...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F7F3EC] text-ink font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/40 backdrop-blur-sm">
          <div className="relative w-64 h-full bg-coal animate-slide-in flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X size={16} />
            </button>
            <AdminSidebar />
          </div>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="bg-white border-b border-ink/8 py-4 px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-pearl/50 border border-ink/10 rounded-md text-ink"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-coal/45 font-bold">
                Painel Admin
              </p>
              <h1 className="text-sm md:text-base font-bold text-ink leading-tight">
                Fysi Gestão
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick link to store */}
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-ink/15 bg-white px-3 text-xs font-semibold hover:bg-pearl/5 transition-all"
            >
              <ArrowLeft size={13} />
              <span>Ver Loja</span>
            </Link>
            
            <div className="h-8 w-8 rounded-full bg-ink flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title="Administrador">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <ClientOnly>
            {children}
          </ClientOnly>
        </main>
      </div>
    </div>
  );
}
