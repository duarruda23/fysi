"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Search, Plus, Trash2, X, ChevronDown } from "lucide-react";
import type { StatusPedido, ItemPedido, Peca } from "@/lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// ── Tipos internos do modal ──────────────────────────────────────────────────
interface ItemAvulso {
  key: string; // uuid local para o React key
  pecaId: string;
  variacaoId: string;
  nomePeca: string;
  cor: string;
  tamanho: string;
  quantidade: number;
  precoUnitario: number;
}

interface PedidoAvulsoModalProps {
  pecas: Peca[];
  onClose: () => void;
  onSuccess: (novoPedido: { id: string; numero: number }) => void;
}

function PedidoAvulsoModal({ pecas, onClose, onSuccess }: PedidoAvulsoModalProps) {
  const pecasAtivas = pecas.filter((p) => p.ativo && p.variacoes.length > 0);

  // ── Dados do cliente ──────────────────────────────────────────────────────
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteQuery, setClienteQuery] = useState("");
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [clientesSugeridos, setClientesSugeridos] = useState<{ id: string; nome: string; email: string; telefone: string }[]>([]);
  const clienteSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clienteQuery.length < 2) { setClientesSugeridos([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/clientes?q=${encodeURIComponent(clienteQuery)}`);
        const data = await res.json();
        setClientesSugeridos(Array.isArray(data) ? data.slice(0, 6) : []);
        setClienteDropdownOpen(true);
      } catch { setClientesSugeridos([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [clienteQuery]);

  function selecionarCliente(c: { id: string; nome: string; email: string; telefone: string }) {
    setClienteNome(c.nome);
    setClienteEmail(c.email);
    setClienteTelefone(c.telefone);
    setClienteQuery(c.nome);
    setClienteDropdownOpen(false);
    setClientesSugeridos([]);
  }

  function formatPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  // ── Itens do pedido ───────────────────────────────────────────────────────
  const [itens, setItens] = useState<ItemAvulso[]>([]);
  const [selectedPecaId, setSelectedPecaId] = useState("");
  const [selectedVarId, setSelectedVarId] = useState("");
  const [selectedQtd, setSelectedQtd] = useState(1);
  const [selectedPreco, setSelectedPreco] = useState("");

  const pecaSelecionada = pecasAtivas.find((p) => p.id === selectedPecaId);
  const variacoesDaPeca = pecaSelecionada?.variacoes ?? [];

  function handlePecaChange(pecaId: string) {
    setSelectedPecaId(pecaId);
    setSelectedVarId("");
    const p = pecasAtivas.find((x) => x.id === pecaId);
    setSelectedPreco(p ? String(p.preco) : "");
  }

  function adicionarItem() {
    if (!selectedPecaId || !selectedVarId || selectedQtd < 1) return;
    const peca = pecasAtivas.find((p) => p.id === selectedPecaId)!;
    const variac = peca.variacoes.find((v) => v.id === selectedVarId)!;
    const preco = parseFloat(selectedPreco) || peca.preco;
    setItens((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        pecaId: peca.id,
        variacaoId: variac.id,
        nomePeca: peca.nome,
        cor: variac.cor,
        tamanho: variac.tamanho,
        quantidade: selectedQtd,
        precoUnitario: preco,
      },
    ]);
    setSelectedPecaId("");
    setSelectedVarId("");
    setSelectedQtd(1);
    setSelectedPreco("");
  }

  function removerItem(key: string) {
    setItens((prev) => prev.filter((i) => i.key !== key));
  }

  // ── Desconto ──────────────────────────────────────────────────────────────
  const [desconto, setDesconto] = useState("");
  const descontoNum = Math.min(100, Math.max(0, parseFloat(desconto) || 0));

  // ── Status inicial ────────────────────────────────────────────────────────
  const [statusInicial, setStatusInicial] = useState<"pendente" | "aprovado">("aprovado");

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const subtotal = itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
  const totalFinal = subtotal * (1 - descontoNum / 100);

  // ── Submissão ─────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteNome.trim() || !clienteTelefone.trim()) {
      setError("Nome e telefone do cliente são obrigatórios.");
      return;
    }
    if (itens.length === 0) {
      setError("Adicione ao menos um item ao pedido.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        avulso: true,
        cliente: { nome: clienteNome.trim(), telefone: clienteTelefone.trim(), email: clienteEmail.trim() },
        itens: itens.map(({ key: _k, ...rest }) => rest) as ItemPedido[],
        descontoPercentual: descontoNum || undefined,
        statusInicial,
      };
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar pedido.");
      onSuccess({ id: data.id, numero: data.numero });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar pedido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 backdrop-blur-sm p-4 pt-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-ink/10 overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10 bg-pearl/30">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">Registrar Pedido Avulso</h2>
            <p className="text-xs text-coal/55 mt-0.5">Sem validação de regras de atacado. Desconto livre.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink/8 transition-colors">
            <X size={18} className="text-ink" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="divide-y divide-ink/8">
          {/* ── 1. Cliente ── */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-coal/50">Cliente</p>

            {/* Busca de cliente cadastrado */}
            <div className="relative" ref={clienteSearchRef}>
              <label className="text-xs text-coal/55 block mb-1">Buscar cliente cadastrado <span className="text-coal/35">(opcional)</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={clienteQuery}
                  onChange={(e) => setClienteQuery(e.target.value)}
                  placeholder="Digite nome, e-mail ou telefone..."
                  className="w-full h-9 px-3 pr-8 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink"
                />
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-coal/40 pointer-events-none" />
              </div>
              {clienteDropdownOpen && clientesSugeridos.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-ink/10 shadow-lg overflow-hidden">
                  {clientesSugeridos.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selecionarCliente(c)}
                      className="w-full text-left px-4 py-2.5 hover:bg-pearl/40 transition-colors"
                    >
                      <p className="text-sm font-semibold text-ink">{c.nome}</p>
                      <p className="text-xs text-coal/50">{c.telefone} · {c.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-coal/55 block">Nome <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full h-9 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-coal/55 block">Telefone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="w-full h-9 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-coal/55 block">E-mail <span className="text-coal/35">(opcional)</span></label>
                <input
                  type="email"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full h-9 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink"
                />
              </div>
            </div>
          </div>

          {/* ── 2. Itens ── */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-coal/50">Itens do Pedido</p>

            {/* Seletor de item */}
            <div className="grid sm:grid-cols-[1fr_1fr_80px_110px_auto] gap-2 items-end">
              {/* Peça */}
              <div className="space-y-1">
                <label className="text-xs text-coal/55 block">Peça</label>
                <select
                  value={selectedPecaId}
                  onChange={(e) => handlePecaChange(e.target.value)}
                  className="w-full h-9 px-2 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink bg-white"
                >
                  <option value="">Selecione...</option>
                  {pecasAtivas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              {/* Variação */}
              <div className="space-y-1">
                <label className="text-xs text-coal/55 block">Variação</label>
                <select
                  value={selectedVarId}
                  onChange={(e) => setSelectedVarId(e.target.value)}
                  disabled={!selectedPecaId}
                  className="w-full h-9 px-2 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink bg-white disabled:opacity-40"
                >
                  <option value="">Cor / Tam</option>
                  {variacoesDaPeca.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.cor} · {v.tamanho} ({v.quantidadeEstoque} em estoque)
                    </option>
                  ))}
                </select>
              </div>

              {/* Qtd */}
              <div className="space-y-1">
                <label className="text-xs text-coal/55 block">Qtd</label>
                <input
                  type="number"
                  min={1}
                  value={selectedQtd}
                  onChange={(e) => setSelectedQtd(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-9 px-2 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink text-center"
                />
              </div>

              {/* Preço unitário */}
              <div className="space-y-1">
                <label className="text-xs text-coal/55 block">Preço unit. (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={selectedPreco}
                  onChange={(e) => setSelectedPreco(e.target.value)}
                  placeholder={pecaSelecionada ? String(pecaSelecionada.preco) : "0,00"}
                  className="w-full h-9 px-2 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink"
                />
              </div>

              {/* Botão adicionar */}
              <button
                type="button"
                onClick={adicionarItem}
                disabled={!selectedPecaId || !selectedVarId}
                className="h-9 px-3 rounded-md bg-ink text-white text-xs font-semibold hover:bg-ink/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Plus size={13} /> Add
              </button>
            </div>

            {/* Lista de itens adicionados */}
            {itens.length > 0 && (
              <div className="rounded-lg border border-ink/10 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 py-2 bg-pearl/30 text-[10px] font-semibold uppercase tracking-wider text-coal/50">
                  <span>Peça</span><span>Qtd</span><span>Unit.</span><span></span>
                </div>
                {itens.map((item) => (
                  <div key={item.key} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-3 py-2.5 border-t border-ink/8 text-sm">
                    <div>
                      <p className="font-medium text-ink">{item.nomePeca}</p>
                      <p className="text-xs text-coal/50">{item.cor} · {item.tamanho}</p>
                    </div>
                    <span className="text-ink text-xs font-mono w-8 text-center">{item.quantidade}x</span>
                    <span className="text-ink text-xs font-mono w-20 text-right">{currency(item.precoUnitario)}</span>
                    <button type="button" onClick={() => removerItem(item.key)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. Desconto + Status ── */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-coal/50">Condições</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-coal/55 block">Desconto (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                  placeholder="0"
                  className="w-full h-9 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink"
                />
                <p className="text-[10px] text-coal/40">Sem restrições — aplique o valor que desejar.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-coal/55 block">Status inicial</label>
                <div className="flex gap-2 mt-1">
                  {(["aprovado", "pendente"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusInicial(s)}
                      className={`flex-1 h-9 rounded-md border text-xs font-semibold capitalize transition-all ${
                        statusInicial === s
                          ? s === "aprovado"
                            ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                            : "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-ink/10 bg-white text-coal/55 hover:border-ink/20"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Resumo + Submit ── */}
          <div className="px-6 py-5 bg-pearl/20">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-0.5">
                {descontoNum > 0 && (
                  <p className="text-xs text-coal/50 line-through">{currency(subtotal)}</p>
                )}
                <p className="text-lg font-bold text-ink font-serif">
                  Total: {currency(totalFinal)}
                  {descontoNum > 0 && (
                    <span className="ml-2 text-xs font-sans font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                      -{descontoNum}% OFF
                    </span>
                  )}
                </p>
              </div>
              <button
                type="submit"
                disabled={saving || itens.length === 0}
                className="h-10 px-6 rounded-lg bg-ink text-white text-sm font-semibold hover:bg-ink/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Salvando..." : "Registrar Pedido"}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const statusBadgeStyle: Record<StatusPedido, string> = {
  pendente: "border-amber-200 bg-amber-50 text-amber-800",
  aprovado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  recusado: "border-red-200 bg-red-50 text-red-800"
};

const statusLabels: Record<StatusPedido, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado"
};

export default function AdminOrdersPage() {
  const { pedidos, pecas, refetchPedidos } = useStore();
  
  // States
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return pedidos.filter((pedido) => {
      // 1. Status Filter
      if (selectedStatus !== "todos" && pedido.status !== selectedStatus) {
        return false;
      }

      // 2. Search query (client name or order number)
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = pedido.cliente.nome.toLowerCase().includes(query);
        const matchesNumber = pedido.numero.toString().includes(query);
        const matchesPhone = pedido.cliente.telefone.replace(/\D/g, "").includes(query.replace(/\D/g, ""));
        
        if (!matchesName && !matchesNumber && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [pedidos, selectedStatus, searchTerm]);

  function handlePedidoAvulsoCriado(novoPedido: { id: string; numero: number }) {
    setModalOpen(false);
    setSuccessMsg(`Pedido #${novoPedido.numero} registrado com sucesso!`);
    setTimeout(() => setSuccessMsg(""), 5000);
    refetchPedidos();
  }

  return (
    <>
    {modalOpen && (
      <PedidoAvulsoModal
        pecas={pecas ?? []}
        onClose={() => setModalOpen(false)}
        onSuccess={handlePedidoAvulsoCriado}
      />
    )}
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink font-serif md:text-3xl">Pedidos</h2>
          <p className="text-sm text-coal/60">Monitore chamados de compra, verifique dados do cliente e aprove/recuse solicitações</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="shrink-0 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-ink text-white text-sm font-semibold hover:bg-ink/85 transition-colors"
        >
          <Plus size={15} />
          Pedido Avulso
        </button>
      </div>

      {/* Mensagem de sucesso */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Toolbar Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus("todos")}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedStatus === "todos"
                ? "border-ink bg-ink text-white"
                : "border-ink/10 bg-white text-coal/65 hover:border-ink/20"
            }`}
          >
            Todos
          </button>
          
          {(["pendente", "aprovado", "recusado"] as StatusPedido[]).map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? statusBadgeStyle[status] + " border-ink"
                    : "border-ink/10 bg-white text-coal/65 hover:border-ink/20"
                }`}
              >
                <span>{statusLabels[status]}</span>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="relative flex items-center rounded-md border border-ink/10 bg-white max-w-sm w-full">
          <Search size={16} className="absolute left-3 text-coal/45" />
          <input
            type="text"
            placeholder="Buscar por cliente, nº ou tel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 bg-transparent pl-10 pr-3 text-sm text-ink outline-none placeholder:text-coal/35 focus:border-ink rounded-md"
          />
        </div>
      </div>

      {/* Orders Grid Table */}
      <div className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-line">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[100px_1fr_120px_130px_120px_110px] gap-4 p-4 border-b border-ink/10 text-xs font-semibold uppercase tracking-wider text-coal/50 bg-pearl/20">
          <span>Número</span>
          <span>Cliente</span>
          <span>Data / Hora</span>
          <span>Itens</span>
          <span>Valor Total</span>
          <span className="text-center">Status</span>
        </div>

        {/* Table Rows */}
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-ink/8">
            {filteredOrders.map((pedido) => (
              <Link
                key={pedido.id}
                href={`/admin/pedidos/${pedido.id}`}
                className="grid grid-cols-[80px_1fr_auto] md:grid-cols-[100px_1fr_120px_130px_120px_110px] gap-4 items-center p-4 hover:bg-pearl/5 transition-colors cursor-pointer"
              >
                {/* Number */}
                <span className="font-bold text-ink text-sm md:text-base">#{pedido.numero}</span>

                {/* Cliente */}
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm md:text-base line-clamp-1">
                    {pedido.cliente.nome}
                  </p>
                  <p className="text-xs text-coal/50 font-mono mt-0.5">{pedido.cliente.telefone}</p>
                </div>

                {/* Data */}
                <span className="hidden md:block text-xs text-coal/65">
                  {new Date(pedido.criadoEm).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}{" "}
                  {new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>

                {/* Itens Count */}
                <span className="hidden md:block text-sm text-coal/70">
                  {pedido.itens.reduce((sum, item) => sum + item.quantidade, 0)} itens
                </span>

                {/* Valor Total */}
                <span className="text-sm font-semibold text-ink md:font-bold">
                  {currency(pedido.total)}
                </span>

                {/* Status Badge */}
                <div className="text-right md:text-center flex justify-end md:justify-center items-center">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${statusBadgeStyle[pedido.status]}`}>
                    {pedido.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-coal/45 text-sm">
            Nenhum pedido localizado para os critérios aplicados.
          </div>
        )}
      </div>
    </div>
    </>
  );
}
