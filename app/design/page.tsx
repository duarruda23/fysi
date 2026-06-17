"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardList,
  Edit3,
  Eye,
  Filter,
  LayoutDashboard,
  Package,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  UserRound
} from "lucide-react";
import { categorias, pecas, pedidos } from "@/lib/mock-data";
import type { Pedido, Peca, StatusPedido } from "@/lib/types";

const navItems = ["Marca", "Tokens", "Componentes", "Ecommerce", "Admin", "Telas"];

const colors = [
  { name: "Ink", value: "#11100E", role: "Texto principal / luxo" },
  { name: "Pearl", value: "#F8F5EF", role: "Background quente" },
  { name: "Linen", value: "#E8DDD0", role: "Superfícies suaves" },
  { name: "Sand", value: "#CDBEAE", role: "Marca secundária" },
  { name: "Gold", value: "#CCB72F", role: "Destaque premium" },
  { name: "Moss", value: "#6D7B64", role: "Sucesso elegante" },
  { name: "Clay", value: "#B46D54", role: "Atenção / calor" },
  { name: "Coal", value: "#25211C", role: "Admin escuro" }
];

const statusStyle: Record<StatusPedido, string> = {
  pendente: "border-amber-200 bg-amber-50 text-amber-800",
  aprovado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  recusado: "border-red-200 bg-red-50 text-red-800"
};

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function stockTotal(peca: Peca) {
  return peca.variacoes.reduce((total, variacao) => total + variacao.quantidadeEstoque, 0);
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
      <h2 className="font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-coal/70">{copy}</p>
    </div>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

function ProductCard({ peca }: { peca: Peca }) {
  return (
    <article className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-line">
      <div className="aspect-[4/5] overflow-hidden bg-linen">
        <img src={peca.fotos[0]} alt={peca.nome} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-coal/50">{peca.categoria}</p>
            <h3 className="mt-1 text-sm font-semibold text-ink">{peca.nome}</h3>
          </div>
          <p className="text-sm font-semibold text-ink">{currency(peca.preco)}</p>
        </div>
        <div className="flex items-center gap-2">
          {peca.variacoes.slice(0, 3).map((variacao) => (
            <span key={variacao.id} className="h-5 w-5 rounded-full border border-ink/10" style={{ backgroundColor: variacao.corHex }} />
          ))}
        </div>
      </div>
    </article>
  );
}

function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div className="flex min-h-[520px]">
        <aside className="hidden w-56 shrink-0 bg-coal p-5 text-white md:block">
          <img src="/brand/logo-horizontal-branco.png" alt="Fysi" className="mb-10 h-7 w-auto object-contain" />
          <nav className="space-y-2 text-sm">
            {["Dashboard", "Peças", "Pedidos", "Clientes"].map((item, index) => (
              <div key={item} className={`flex items-center gap-3 rounded-md px-3 py-2 ${index === 0 ? "bg-white/12" : "text-white/65"}`}>
                {index === 0 ? <LayoutDashboard size={16} /> : index === 1 ? <Package size={16} /> : <ClipboardList size={16} />}
                {item}
              </div>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 bg-[#F7F3EC] p-4 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-coal/45">Admin Fysi</p>
              <h3 className="text-xl font-semibold text-ink">{title}</h3>
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white">
              <Search size={15} /> Buscar
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="mx-auto w-full max-w-[330px] rounded-[2rem] border border-ink/12 bg-ink p-2 shadow-soft">
      <div className="overflow-hidden rounded-[1.55rem] bg-pearl">
        <div className="flex items-center justify-between border-b border-ink/8 bg-white px-4 py-3">
          <img src="/brand/logo-horizontal-preto.png" alt="Fysi" className="h-5 w-auto object-contain" />
          <ShoppingBag size={18} />
        </div>
        <div className="min-h-[520px]">{children}</div>
        <div className="border-t border-ink/8 bg-white px-4 py-3 text-center text-[11px] uppercase tracking-[0.2em] text-coal/45">{label}</div>
      </div>
    </div>
  );
}

function OrderRows({ rows = pedidos }: { rows?: Pedido[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      {rows.map((pedido) => (
        <div key={pedido.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-ink/8 p-4 last:border-b-0 md:grid-cols-[90px_1fr_120px_120px]">
          <p className="font-medium text-ink">#{pedido.numero}</p>
          <p className="text-sm text-coal/70">{pedido.cliente.nome}</p>
          <p className="text-sm font-semibold text-ink">{currency(pedido.total)}</p>
          <Badge className={statusStyle[pedido.status]}>{pedido.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function HomeMockup() {
  return (
    <PhoneFrame label="Vitrine / Home">
      <div className="space-y-5 p-4">
        <div className="relative overflow-hidden rounded-lg bg-ink text-white">
          <img src="/brand/perfil-1.png" alt="Editorial Fysi" className="h-56 w-full object-cover opacity-75" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Nova coleção</p>
            <h3 className="mt-1 font-serif text-3xl leading-none">Essenciais de inverno</h3>
            <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-semibold text-ink">Ver peças <ArrowRight size={14} /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {pecas.slice(1, 5).map((peca) => <ProductCard key={peca.id} peca={peca} />)}
        </div>
      </div>
    </PhoneFrame>
  );
}

function CatalogMockup() {
  return (
    <PhoneFrame label="Catálogo">
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-coal/50">
          <Search size={16} /> Buscar vestido, blusa...
        </div>
        <div className="flex gap-2 overflow-hidden">
          {categorias.slice(0, 4).map((categoria, index) => (
            <Badge key={categoria} className={index === 0 ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-coal/70"}>{categoria}</Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {pecas.slice(0, 4).map((peca) => <ProductCard key={peca.id} peca={peca} />)}
        </div>
      </div>
    </PhoneFrame>
  );
}

function ProductMockup() {
  const peca = pecas[0];
  return (
    <PhoneFrame label="Página do Produto">
      <div>
        <img src={peca.fotos[0]} alt={peca.nome} className="h-72 w-full object-cover" />
        <div className="space-y-5 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold">{peca.referencia}</p>
            <h3 className="mt-1 font-serif text-3xl font-semibold text-ink">{peca.nome}</h3>
            <p className="mt-2 text-xl font-semibold">{currency(peca.preco)}</p>
          </div>
          <p className="text-sm leading-6 text-coal/70">{peca.descricao}</p>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coal/55">Cor</p>
            <div className="flex gap-2">{peca.variacoes.map((v) => <span key={v.id} className="h-8 w-8 rounded-full border border-ink/20" style={{ backgroundColor: v.corHex }} />)}</div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coal/55">Tamanho</p>
            <div className="flex gap-2">{["PP", "P", "M", "G", "GG"].map((size, index) => <button key={size} className={`h-9 min-w-9 rounded-md border text-sm ${index === 2 ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink"}`}>{size}</button>)}</div>
          </div>
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gold text-sm font-bold text-ink">Adicionar ao carrinho <ShoppingBag size={16} /></button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// @ts-ignore
function CheckoutMockup() {
  return (
    <PhoneFrame label="Checkout / Confirmação">
      <div className="space-y-5 p-5">
        <div className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-coal/45">Carrinho</p>
          {pecas.slice(0, 2).map((peca) => (
            <div key={peca.id} className="mt-4 flex gap-3">
              <img src={peca.fotos[0]} alt={peca.nome} className="h-16 w-12 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{peca.nome}</p>
                <p className="text-xs text-coal/55">Areia · M · Qtd 1</p>
                <p className="mt-1 text-sm font-semibold">{currency(peca.preco)}</p>
              </div>
            </div>
          ))}
          <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 text-sm font-bold"><span>Total</span><span>{currency(518)}</span></div>
        </div>
        <div className="space-y-3 rounded-lg border border-ink/10 bg-white p-4">
          {['Nome completo', 'WhatsApp', 'Entrega ou retirada'].map((field) => <div key={field} className="rounded-md border border-ink/10 px-3 py-3 text-sm text-coal/45">{field}</div>)}
          <button className="h-11 w-full rounded-md bg-ink text-sm font-semibold text-white">Finalizar pedido</button>
        </div>
        <div className="rounded-lg border border-moss/20 bg-moss/10 p-4 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-moss text-white"><Check size={18} /></div>
          <p className="font-serif text-2xl font-semibold">Pedido nº 1204 received</p>
          <p className="mt-1 text-sm text-coal/65">Aguardando aprovação da loja.</p>
        </div>
      </div>
    </PhoneFrame>
  );
}

function DashboardMockup() {
  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        {["Peças ativas", "Pendentes", "Estoque baixo", "Faturamento mês"].map((label, index) => (
          <div key={label} className="rounded-lg border border-ink/10 bg-white p-4 shadow-line">
            <p className="text-xs uppercase tracking-[0.16em] text-coal/45">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-ink">{[6, 1, 5, "R$ 389"][index]}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <OrderRows rows={pedidos.slice(0, 2)} />
        <div className="rounded-lg border border-ink/10 bg-white p-5">
          <p className="font-semibold">Alertas de estoque</p>
          <div className="mt-4 space-y-3">
            {pecas.filter((peca) => stockTotal(peca) <= 10).slice(0, 3).map((peca) => (
              <div key={peca.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{peca.nome}</span>
                <Badge className="border-clay/20 bg-clay/10 text-clay">{stockTotal(peca)} un.</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function PiecesMockup() {
  return (
    <AdminShell title="Peças">
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex h-10 min-w-[220px] items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm text-coal/45"><Search size={15} /> Buscar por nome ou SKU</div>
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-white px-4 text-sm"><Filter size={15} /> Categoria</button>
        <button className="h-10 rounded-md bg-gold px-4 text-sm font-bold text-ink">Nova peça</button>
      </div>
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        {pecas.slice(0, 5).map((peca) => (
          <div key={peca.id} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-ink/8 p-3 last:border-b-0 md:grid-cols-[52px_1fr_110px_90px_90px_90px]">
            <img src={peca.fotos[0]} alt={peca.nome} className="h-11 w-11 rounded-md object-cover" />
            <div><p className="text-sm font-semibold">{peca.nome}</p><p className="text-xs text-coal/50">{peca.referencia}</p></div>
            <p className="hidden text-sm text-coal/65 md:block">{peca.categoria}</p>
            <p className="hidden text-sm font-semibold md:block">{currency(peca.preco)}</p>
            <Badge className="hidden border-ink/10 bg-pearl text-coal md:inline-flex">{stockTotal(peca)} un.</Badge>
            <div className="flex gap-2"><Edit3 size={16} /><Trash2 size={16} /></div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

function FormMockup() {
  return (
    <AdminShell title="Cadastro / edição de peça">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-3 rounded-lg border border-ink/10 bg-white p-5">
          {['Nome da peça', 'Referência / SKU', 'Categoria', 'Preço', 'Descrição', 'URL da foto'].map((field) => <div key={field} className="rounded-md border border-ink/10 px-3 py-3 text-sm text-coal/45">{field}</div>)}
          <button className="h-11 rounded-md bg-ink px-5 text-sm font-semibold text-white">Salvar peça</button>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-5">
          <p className="font-semibold">Variações</p>
          <div className="mt-4 space-y-3">
            {["Areia · P · 7 un.", "Areia · M · 4 un.", "Preto · G · 3 un."].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-md border border-ink/10 p-3 text-sm"><span>{item}</span><Trash2 size={15} /></div>
            ))}
          </div>
          <button className="mt-4 h-10 w-full rounded-md border border-dashed border-ink/25 text-sm font-semibold">Adicionar variação</button>
        </div>
      </div>
    </AdminShell>
  );
}

function OrdersMockup() {
  return (
    <AdminShell title="Pedidos">
      <div className="mb-4 flex gap-2">
        {['Todos', 'Pendente', 'Aprovado', 'Recusado'].map((status, index) => <Badge key={status} className={index === 1 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-ink/10 bg-white text-coal/65"}>{status}</Badge>)}
      </div>
      <OrderRows />
      <div className="mt-5 rounded-lg border border-ink/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-coal/45">Detalhe do pedido</p>
            <h4 className="mt-1 text-xl font-semibold">Pedido #1204 · Marina Torres</h4>
            <p className="mt-2 text-sm text-coal/60">2 itens · Total {currency(518)} · WhatsApp (11) 99912-4300</p>
          </div>
          <Badge className="border-amber-200 bg-amber-50 text-amber-800">pendente</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {pedidos[0].itens.map((item) => <div key={item.variacaoId} className="rounded-md border border-ink/10 p-3 text-sm"><p className="font-semibold">{item.nomePeca}</p><p className="text-coal/55">{item.cor} · {item.tamanho} · {item.quantidade} un.</p></div>)}
        </div>
        <div className="mt-5 flex gap-3"><button className="h-10 rounded-md bg-moss px-4 text-sm font-semibold text-white">Aprovar</button><button className="h-10 rounded-md bg-clay px-4 text-sm font-semibold text-white">Recusar</button></div>
      </div>
    </AdminShell>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="bg-pearl min-h-screen text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-pearl/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <a href="#top" className="flex items-center gap-3"><img src="/brand/logo-horizontal-preto.png" alt="Fysi" className="h-8 w-auto object-contain" /></a>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => <a key={item} href={`#${item.toLowerCase()}`} className="rounded-md px-3 py-2 text-sm text-coal/70 hover:bg-white hover:text-ink">{item}</a>)}
          </nav>
        </div>
      </header>

      <section id="top" className="mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge className="border-gold/30 bg-gold/10 text-ink"><Sparkles size={14} className="mr-2" /> Design system · Fysi</Badge>
          <h1 className="mt-6 font-serif text-6xl font-semibold leading-[0.95] text-ink md:text-8xl">Moda, gestão e compra em uma linguagem só.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-coal/70">Guia visual para o ecommerce e o painel administrativo da Fysi: elegante para vender, claro para operar e consistente para evoluir depois para Supabase/Postgres.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#telas" className="inline-flex h-12 items-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white">Ver telas <ArrowRight size={16} /></a>
            <a href="#componentes" className="inline-flex h-12 items-center gap-2 rounded-md border border-ink/15 bg-white px-5 text-sm font-semibold text-ink">Componentes</a>
          </div>
        </div>
        <div className="relative min-h-[560px] overflow-hidden rounded-lg bg-ink text-white shadow-soft">
          <img src="/brand/perfil-5.png" alt="Editorial Fysi" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6"><img src="/brand/logo-horizontal-branco.png" alt="Fysi" className="h-8 w-auto object-contain" /><Badge className="border-white/25 bg-white/10 text-white">2026</Badge></div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-white/70">Coleção preview</p>
            <h2 className="mt-2 font-serif text-5xl font-semibold">Clean luxury para rotina real.</h2>
          </div>
        </div>
      </section>

      <section id="marca" className="border-y border-ink/10 bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Marca" title="Sistema de logo e presença visual" copy="A marca pode atuar com assinatura horizontal para navegação, símbolo/stacked para momentos editoriais e versões de contraste para fundos claros ou escuros." />
          <div className="grid gap-4 md:grid-cols-3">
            {["preto", "ouro", "branco"].map((variant) => (
              <div key={variant} className={`rounded-lg border border-ink/10 p-8 ${variant === "branco" ? "bg-ink" : "bg-pearl"}`}>
                <img src={`/brand/logo-horizontal-${variant}.png`} alt={`Logo Fysi ${variant}`} className="h-16 w-full object-contain" />
                <p className={`mt-6 text-sm capitalize ${variant === "branco" ? "text-white/70" : "text-coal/65"}`}>Logo horizontal {variant}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tokens" className="mx-auto max-w-7xl px-5 py-20">
        <SectionHeader eyebrow="Tokens" title="Cores, tipografia e ritmo" copy="A base combina neutros quentes com preto sofisticado e ouro pontual. A fonte serifada dá assinatura editorial; a sans mantém leitura limpa no admin." />
        <div className="grid gap-4 md:grid-cols-4">
          {colors.map((color) => (
            <div key={color.name} className="rounded-lg border border-ink/10 bg-white p-4 shadow-line">
              <div className="h-28 rounded-md border border-ink/10" style={{ backgroundColor: color.value }} />
              <p className="mt-4 font-semibold">{color.name}</p>
              <p className="font-mono text-xs text-coal/50">{color.value}</p>
              <p className="mt-2 text-sm text-coal/65">{color.role}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-ink/10 bg-white p-8"><p className="text-xs uppercase tracking-[0.2em] text-gold">Cormorant Garamond</p><p className="mt-3 font-serif text-6xl font-semibold leading-none">Elegância com personalidade.</p></div>
          <div className="rounded-lg border border-ink/10 bg-white p-8"><p className="text-xs uppercase tracking-[0.2em] text-gold">Inter</p><p className="mt-3 text-3xl font-semibold">Interface clara para operação diária.</p><p className="mt-4 text-coal/65">Busca, tabelas, filtros, status e dados precisam ser objetivos e fáceis de escanear.</p></div>
        </div>
      </section>

      <section id="componentes" className="border-y border-ink/10 bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Componentes" title="Elementos base para ecommerce e admin" copy="Botões, filtros, cards, badges e tabelas já aparecem com estados suficientes para montar as telas planejadas sem mudar a linguagem visual." />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-lg border border-ink/10 p-6">
              <h3 className="font-semibold">Botões</h3>
              <div className="mt-5 flex flex-wrap gap-3"><button className="h-11 rounded-md bg-ink px-5 text-sm font-semibold text-white">Primário</button><button className="h-11 rounded-md bg-gold px-5 text-sm font-bold text-ink">Destaque</button><button className="h-11 rounded-md border border-ink/15 px-5 text-sm font-semibold">Secundário</button></div>
            </div>
            <div className="rounded-lg border border-ink/10 p-6">
              <h3 className="font-semibold">Campos e filtros</h3>
              <div className="mt-5 space-y-3"><div className="flex h-11 items-center gap-2 rounded-md border border-ink/10 px-3 text-sm text-coal/45"><Search size={16} /> Buscar peça</div><div className="flex h-11 items-center justify-between rounded-md border border-ink/10 px-3 text-sm"><span>Categoria</span><SlidersHorizontal size={16} /></div></div>
            </div>
            <div className="rounded-lg border border-ink/10 p-6">
              <h3 className="font-semibold">Status</h3>
              <div className="mt-5 flex flex-wrap gap-2"><Badge className={statusStyle.pendente}>pendente</Badge><Badge className={statusStyle.aprovado}>aprovado</Badge><Badge className={statusStyle.recusado}>recusado</Badge><Badge className="border-ink/10 bg-pearl text-coal">inativo</Badge></div>
            </div>
          </div>
        </div>
      </section>

      <section id="ecommerce" className="mx-auto max-w-7xl px-5 py-20">
        <SectionHeader eyebrow="Ecommerce" title="Experiência mobile-first de compra" copy="A loja prioriza fotografia, escolha rápida de variações e checkout sem pagamento, deixando claro que o pedido ficará pendente de aprovação." />
        <div className="grid gap-8 lg:grid-cols-4"><HomeMockup /><CatalogMockup /><ProductMockup /><CheckoutMockup /></div>
      </section>

      <section id="admin" className="border-y border-ink/10 bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Admin" title="Painel objetivo para estoque e chamados" copy="O admin usa a mesma marca, mas com densidade maior, sidebar escura e foco em decisões: aprovar pedido, identificar estoque baixo e editar peças." />
          <div className="space-y-8"><DashboardMockup /><PiecesMockup /><FormMockup /><OrdersMockup /></div>
        </div>
      </section>

      <section id="telas" className="mx-auto max-w-7xl px-5 py-20">
        <SectionHeader eyebrow="Mapa de telas" title="Cobertura do protótipo visual" copy="Resumo das telas contempladas no design system para orientar a implementação completa depois." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Vitrine / Home", "Banner editorial, categorias e peças recentes."],
            ["Catálogo", "Grid com filtros por categoria, cor, tamanho e preço."],
            ["Produto", "Galeria, swatches, tamanhos e compra."],
            ["Carrinho", "Itens, edição de quantidade e total."],
            ["Checkout", "Dados do cliente sem pagamento."],
            ["Confirmação", "Pedido recebido e status pendente."],
            ["Meus pedidos", "Consulta simplificada por telefone."],
            ["Admin Dashboard", "Resumo de peças, chamados, estoque e faturamento."],
            ["Peças", "Busca, filtro, status e ações."],
            ["Cadastro/Edição", "Campos de produto e variações dinâmicas."],
            ["Pedidos", "Lista de chamados com filtros por status."],
            ["Detalhe do pedido", "Itens, cliente, aprovar e recusar."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-lg border border-ink/10 bg-white p-5 shadow-line">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-pearl"><Eye size={18} /></div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-coal/65">{copy}</p>
              <div className="mt-4 flex items-center text-xs font-semibold uppercase tracking-[0.16em] text-gold">Padrão definido <ChevronRight size={14} /></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-ink px-5 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <img src="/brand/logo-horizontal-branco.png" alt="Fysi" className="h-8 w-auto object-contain" />
          <p className="max-w-xl text-sm text-white/60">Design system visual para orientar a construção do ecommerce e do admin com dados mockados e futura migração para backend real.</p>
        </div>
      </footer>
    </main>
  );
}
