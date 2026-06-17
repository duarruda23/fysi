"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, Store, LogOut, Tags, Percent, Star, Settings } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logoutAdmin } = useStore();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Peças", href: "/admin/pecas", icon: Package },
    { name: "Pedidos", href: "/admin/pedidos", icon: ClipboardList },
    { name: "Categorias", href: "/admin/categorias", icon: Tags },
    { name: "Promoções", href: "/admin/promocoes", icon: Percent },
    { name: "Lista VIP", href: "/admin/lista-vip", icon: Star },
    { name: "Configurações", href: "/admin/configuracoes", icon: Settings }
  ];

  return (
    <aside className="w-64 shrink-0 bg-coal text-white flex flex-col min-h-screen">
      {/* Header / Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/admin/dashboard" className="block">
          <img
            src="/brand/logo-horizontal-branco.png"
            alt="Fysi Admin"
            className="h-7 w-auto object-contain"
          />
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
          Painel Administrativo
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white shadow-line"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Switch back to store & Logout */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-2.5 text-xs font-bold text-ink hover:bg-gold/90 transition-colors w-full"
        >
          <Store size={14} />
          Voltar para Loja
        </Link>
        <button
          onClick={logoutAdmin}
          className="flex items-center justify-center gap-2 rounded-md border border-white/10 hover:bg-white/5 text-white/80 hover:text-white px-4 py-2.5 text-xs font-bold transition-colors w-full"
        >
          <LogOut size={14} />
          Sair do Painel
        </button>
      </div>
    </aside>
  );
}
