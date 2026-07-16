"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type {
  Peca,
  Pedido,
  ItemPedido,
  Categoria,
  Promocao,
  InscricaoVIP,
  ConfiguracoesLoja,
  Banner,
} from "./types";

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

// Dados do cliente usados na criação de pedidos (id não é necessário aqui)
export interface ClientePedidoInput {
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  clienteId?: string;
}

interface StoreContextProps {
  pecas: Peca[];
  pedidos: Pedido[];
  carrinho: ItemPedido[];
  loading: boolean;

  // Cliente Session
  clienteLogado: Cliente | null;
  loginCliente: (email: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  cadastrarCliente: (dados: { nome: string; email: string; telefone: string; senha: string }) => Promise<{ ok: boolean; error?: string }>;
  logoutCliente: () => Promise<void>;
  refetchCliente: () => Promise<void>;

  // Admin Session
  adminLogado: boolean;
  loginAdmin: (email: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;

  // Pecas Actions
  addPeca: (pecaData: Omit<Peca, "id" | "criadoEm">) => Promise<void>;
  updatePeca: (id: string, updates: Partial<Peca>) => Promise<void>;
  deletePeca: (id: string) => Promise<void>;
  refetchPecas: () => Promise<void>;

  // Pedidos Actions
  addPedido: (
    cliente: ClientePedidoInput,
    cupom?: string,
    descontoPercentual?: number
  ) => Promise<Pedido | null>;
  responderPedido: (
    id: string,
    status: "aprovado" | "recusado",
    motivoRecusa?: string
  ) => Promise<void>;
  refetchPedidos: () => Promise<void>;

  // Carrinho Actions
  addToCart: (peca: Peca, variacaoId: string, quantidade: number) => void;
  removeFromCart: (variacaoId: string) => void;
  updateCartQuantity: (variacaoId: string, quantidade: number) => void;
  clearCart: () => void;

  // Categorias
  categorias: Categoria[];
  addCategoria: (nome: string) => Promise<void>;
  deleteCategoria: (id: string) => Promise<void>;

  // Promocoes
  promocoes: Promocao[];
  addPromocao: (promocaoData: Omit<Promocao, "id" | "criadoEm">) => Promise<void>;
  updatePromocao: (id: string, updates: Partial<Promocao>) => Promise<void>;
  deletePromocao: (id: string) => Promise<void>;

  // Lista VIP
  listaVip: InscricaoVIP[];
  inscreverVip: (
    inscricaoData: Omit<InscricaoVIP, "id" | "criadoEm" | "notificado">
  ) => Promise<{ ok: boolean; error?: string }>;
  toggleNotificadoVip: (id: string) => Promise<void>;
  deleteVip: (id: string) => Promise<void>;

  // Configurações
  configuracoes: ConfiguracoesLoja;
  updateConfiguracoes: (updates: Partial<ConfiguracoesLoja>) => Promise<void>;

  // Banner (carrossel)
  banners: Banner[];
  addBanner: (data: Omit<Banner, "id" | "ordem" | "criadoEm">) => Promise<void>;
  updateBanner: (id: string, updates: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  refetchBanners: () => Promise<void>;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

const defaultConfigs: ConfiguracoesLoja = {
  googleAnalyticsId: "",
  metaPixelId: "",
  googleAdsId: "",
  tiktokPixelId: "",
  tiktokApiToken: "",
  minimoPecasAtacado: 12,
  valorMinimoAtacado: 1000,
};

const defaultBanner: Banner = {
  id: "",
  titulo: "Clean luxury para o seu dia a dia.",
  subtitulo: "Descubra peças de linho, cetim e alfaiataria esculpidas para durar.",
  eyebrow: "Coleção Essenciais 2026",
  botaoTexto: "Explorar Catálogo",
  botaoLink: "/produtos",
  imagemUrl: "/brand/perfil-5.png",
  ativo: true,
  ordem: 0,
  criadoEm: "",
};

// ─── helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Erro na requisição ${url}`);
  }
  return res.json() as Promise<T>;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);
  const [clienteLogado, setClienteLogado] = useState<Cliente | null>(null);
  const [adminLogado, setAdminLogado] = useState<boolean>(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [listaVip, setListaVip] = useState<InscricaoVIP[]>([]);
  const [configuracoes, setConfiguracoes] =
    useState<ConfiguracoesLoja>(defaultConfigs);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do Supabase na montagem
  // Usa allSettled para que a falha de UM endpoint não derrube todos os outros
  const fetchAll = useCallback(async () => {
    setLoading(true);

    const settle = async <T,>(url: string, fallback: T, set: (v: T) => void) => {
      try {
        const data = await apiFetch<T>(url);
        set(data);
      } catch (err) {
        console.error(`[Store] Falha ao carregar ${url}:`, err);
        set(fallback);
      }
    };

    await Promise.allSettled([
      settle<Peca[]>("/api/pecas", [], setPecas),
      settle<Pedido[]>("/api/pedidos", [], setPedidos),
      settle<Categoria[]>("/api/categorias", [], setCategorias),
      settle<Promocao[]>("/api/promocoes", [], setPromocoes),
      settle<InscricaoVIP[]>("/api/lista-vip", [], setListaVip),
      settle<ConfiguracoesLoja>("/api/configuracoes", defaultConfigs, setConfiguracoes),
      settle<Banner[]>("/api/banners", [], (v) => setBanners(Array.isArray(v) ? v : [])),
    ]);

    setLoading(false);
  }, []);

  // Rebuscar apenas peças do banco (usado após cadastro/edição)
  const refetchPecas = useCallback(async () => {
    try {
      const pecasData = await apiFetch<Peca[]>("/api/pecas");
      setPecas(pecasData);
    } catch (err) {
      console.error("[Store] Erro ao rebuscar peças:", err);
    }
  }, []);

  // ── Cliente Session ────────────────────────────────────────────────────────
  // Definido antes dos useEffects para evitar ReferenceError

  const refetchCliente = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setClienteLogado(data);
      } else {
        setClienteLogado(null);
      }
    } catch {
      setClienteLogado(null);
    }
  }, []);

  // Restaurar sessão do carrinho (localStorage) e cliente (cookie via API)
  useEffect(() => {
    try {
      const storedCarrinho = localStorage.getItem("fysi_carrinho");
      if (storedCarrinho) setCarrinho(JSON.parse(storedCarrinho));
    } catch {}
    // Verificar sessão do cliente e do admin via Supabase Auth
    refetchCliente();
    fetch("/api/auth/admin/me").then(r => { if (r.ok) setAdminLogado(true); });
  }, [refetchCliente]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Persistir carrinho em localStorage
  useEffect(() => {
    localStorage.setItem("fysi_carrinho", JSON.stringify(carrinho));
  }, [carrinho]);

  // Salvar carrinho abandonado no banco quando cliente logado tem itens
  useEffect(() => {
    if (!clienteLogado?.id) return;
    // Debounce: aguarda 3s de inatividade antes de salvar
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/clientes/${clienteLogado.id}/carrinho`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ carrinho }),
        });
      } catch {}
    }, 3000);
    return () => clearTimeout(timer);
  }, [carrinho, clienteLogado?.id]);

  // Sessão do cliente é gerenciada via cookie HttpOnly — sem localStorage

  // Sessão admin gerenciada via cookie Supabase — sem localStorage

  const loginCliente = async (email: string, senha: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };
      setClienteLogado(data);
      return { ok: true };
    } catch {
      return { ok: false, error: "Erro de conexão." };
    }
  };

  const cadastrarCliente = async (dados: { nome: string; email: string; telefone: string; senha: string }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };
      setClienteLogado(data);
      return { ok: true };
    } catch {
      return { ok: false, error: "Erro de conexão." };
    }
  };

  const logoutCliente = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setClienteLogado(null);
  };

  // ── Admin Session ──────────────────────────────────────────────────────────

  const loginAdmin = async (email: string, senha: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };
      setAdminLogado(true);
      return { ok: true };
    } catch {
      return { ok: false, error: "Erro de conexão." };
    }
  };

  const logoutAdmin = async () => {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    setAdminLogado(false);
    localStorage.removeItem("fysi_admin");
  };

  // ── Pecas ────────────────────────────────────────────���─────────────────────

  const addPeca = async (pecaData: Omit<Peca, "id" | "criadoEm">) => {
    await apiFetch<{ id: string }>("/api/pecas", {
      method: "POST",
      body: JSON.stringify(pecaData),
    });
    // Rebuscar do banco para garantir dados completos e consistentes
    await refetchPecas();
  };

  const updatePeca = async (id: string, updates: Partial<Peca>) => {
    await apiFetch(`/api/pecas/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    // Rebuscar do banco para refletir mudanças reais
    await refetchPecas();
  };

  const deletePeca = async (id: string) => {
    await apiFetch(`/api/pecas/${id}`, { method: "DELETE" });
    setPecas((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Pedidos ────────────────────────────────────────────────────────────────

  const refetchPedidos = useCallback(async () => {
    try {
      const data = await apiFetch<Pedido[]>("/api/pedidos");
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[Store] Erro ao rebuscar pedidos:", err);
    }
  }, []);

  const addPedido = async (
    cliente: ClientePedidoInput,
    _cupom?: string,
    descontoPercentual?: number
  ): Promise<Pedido | null> => {
    if (carrinho.length === 0) return null;

    const result = await apiFetch<{ id: string; numero: number; total: number }>(
      "/api/pedidos",
      {
        method: "POST",
        body: JSON.stringify({ cliente, itens: carrinho, descontoPercentual }),
      }
    );

    const newPedido: Pedido = {
      id: result.id,
      numero: result.numero,
      cliente,
      itens: [...carrinho],
      total: result.total,
      status: "pendente",
      criadoEm: new Date().toISOString(),
    };

    setPedidos((prev) => [newPedido, ...prev]);
    setCarrinho([]);
    return newPedido;
  };

  const responderPedido = async (
    id: string,
    status: "aprovado" | "recusado",
    motivoRecusa?: string
  ) => {
    const targetPedido = pedidos.find((p) => p.id === id);
    if (!targetPedido || targetPedido.status !== "pendente") return;

    await apiFetch(`/api/pedidos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, motivoRecusa, itens: targetPedido.itens }),
    });

    // Atualizar estado local de pedidos
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              motivoRecusa: status === "recusado" ? motivoRecusa : undefined,
              respondidoEm: new Date().toISOString(),
            }
          : p
      )
    );

    // Se aprovado, debitar estoque localmente também
    if (status === "aprovado") {
      setPecas((prevPecas) =>
        prevPecas.map((peca) => {
          const itensParaPeca = targetPedido.itens.filter(
            (item) => item.pecaId === peca.id
          );
          if (itensParaPeca.length === 0) return peca;
          return {
            ...peca,
            variacoes: peca.variacoes.map((v) => {
              const item = itensParaPeca.find((i) => i.variacaoId === v.id);
              if (item) {
                return {
                  ...v,
                  quantidadeEstoque: Math.max(
                    0,
                    v.quantidadeEstoque - item.quantidade
                  ),
                };
              }
              return v;
            }),
          };
        })
      );
    }
  };

  // ── Carrinho ───────────────────────────────────────────────────────────────

  const addToCart = (peca: Peca, variacaoId: string, quantidade: number) => {
    const varObj = peca.variacoes.find((v) => v.id === variacaoId);
    if (!varObj) return;

    setCarrinho((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.variacaoId === variacaoId
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantidade = Math.min(
          updated[existingIndex].quantidade + quantidade,
          varObj.quantidadeEstoque
        );
        return updated;
      }

      const promo = promocoes.find(
        (pr) => pr.ativo && pr.categoriaAlvo === peca.categoria && !pr.cupom
      );
      const precoVigente = promo
        ? peca.preco * (1 - promo.descontoPercentual / 100)
        : peca.preco;

      const newItem: ItemPedido = {
        pecaId: peca.id,
        variacaoId,
        nomePeca: peca.nome,
        cor: varObj.cor,
        tamanho: varObj.tamanho,
        quantidade: Math.min(quantidade, varObj.quantidadeEstoque),
        precoUnitario: precoVigente,
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (variacaoId: string) => {
    setCarrinho((prev) =>
      prev.filter((item) => item.variacaoId !== variacaoId)
    );
  };

  const updateCartQuantity = (variacaoId: string, quantidade: number) => {
    setCarrinho((prev) =>
      prev.map((item) => {
        if (item.variacaoId === variacaoId) {
          const targetPeca = pecas.find((p) => p.id === item.pecaId);
          const targetVar = targetPeca?.variacoes.find(
            (v) => v.id === variacaoId
          );
          const maxStock = targetVar ? targetVar.quantidadeEstoque : 999;
          return {
            ...item,
            quantidade: Math.min(Math.max(1, quantidade), maxStock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCarrinho([]);

  // ── Categorias ─────────────────────────────────────────────────────────────

  const addCategoria = async (nome: string) => {
    const { id } = await apiFetch<{ id: string }>("/api/categorias", {
      method: "POST",
      body: JSON.stringify({ nome }),
    });
    const nova: Categoria = { id, nome, criadoEm: new Date().toISOString() };
    setCategorias((prev) => [...prev, nova]);
  };

  const deleteCategoria = async (id: string) => {
    await apiFetch("/api/categorias", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Promoções ──────────────────────────────────────────────────────────────

  const addPromocao = async (
    promocaoData: Omit<Promocao, "id" | "criadoEm">
  ) => {
    const { id } = await apiFetch<{ id: string }>("/api/promocoes", {
      method: "POST",
      body: JSON.stringify(promocaoData),
    });
    const nova: Promocao = {
      ...promocaoData,
      id,
      criadoEm: new Date().toISOString(),
    };
    setPromocoes((prev) => [nova, ...prev]);
  };

  const updatePromocao = async (id: string, updates: Partial<Promocao>) => {
    await apiFetch(`/api/promocoes/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setPromocoes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePromocao = async (id: string) => {
    await apiFetch(`/api/promocoes/${id}`, { method: "DELETE" });
    setPromocoes((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Lista VIP ────────────────────────────────────��─────────────────────────

  const inscreverVip = async (
    inscricaoData: Omit<InscricaoVIP, "id" | "criadoEm" | "notificado">
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { id } = await apiFetch<{ id: string }>("/api/lista-vip", {
        method: "POST",
        body: JSON.stringify(inscricaoData),
      });
      const nova: InscricaoVIP = {
        ...inscricaoData,
        id,
        criadoEm: new Date().toISOString(),
        notificado: false,
      };
      setListaVip((prev) => [nova, ...prev]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Erro ao inscrever na lista VIP." };
    }
  };

  const toggleNotificadoVip = async (id: string) => {
    const item = listaVip.find((v) => v.id === id);
    if (!item) return;
    const novoValor = !item.notificado;
    await apiFetch(`/api/lista-vip/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ notificado: novoValor }),
    });
    setListaVip((prev) =>
      prev.map((v) => (v.id === id ? { ...v, notificado: novoValor } : v))
    );
  };

  const deleteVip = async (id: string) => {
    await apiFetch(`/api/lista-vip/${id}`, { method: "DELETE" });
    setListaVip((prev) => prev.filter((v) => v.id !== id));
  };

  // ── Configurações ──────────────────────────────────────────────────────────

  const updateConfiguracoes = async (updates: Partial<ConfiguracoesLoja>) => {
    await apiFetch("/api/configuracoes", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setConfiguracoes((prev) => ({ ...prev, ...updates }));
  };

  const refetchBanners = useCallback(async () => {
    try {
      const data = await apiFetch<Banner[]>("/api/banners");
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[Store] Erro ao rebuscar banners:", err);
    }
  }, []);

  const addBanner = async (bannerData: Omit<Banner, "id" | "ordem" | "criadoEm">) => {
    await apiFetch<Banner>("/api/banners", {
      method: "POST",
      body: JSON.stringify(bannerData),
    });
    await refetchBanners();
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    await apiFetch(`/api/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBanner = async (id: string) => {
    await apiFetch(`/api/banners/${id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        pecas,
        pedidos,
        carrinho,
        loading,
        adminLogado,
        clienteLogado,
        loginCliente,
        cadastrarCliente,
        logoutCliente,
        refetchCliente,
        loginAdmin,
        logoutAdmin,
        addPeca,
        updatePeca,
        deletePeca,
        refetchPecas,
        addPedido,
        responderPedido,
        refetchPedidos,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        categorias,
        addCategoria,
        deleteCategoria,
        promocoes,
        addPromocao,
        updatePromocao,
        deletePromocao,
        listaVip,
        inscreverVip,
        toggleNotificadoVip,
        deleteVip,
        configuracoes,
        updateConfiguracoes,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        refetchBanners,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
