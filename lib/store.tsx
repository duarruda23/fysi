"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Peca, Pedido, StatusPedido, ItemPedido, VariacaoPeca, Categoria, Promocao, InscricaoVIP, ConfiguracoesLoja } from "./types";
import { pecas as initialPecas, pedidos as initialPedidos } from "./mock-data";

interface Cliente {
  nome: string;
  telefone: string;
  endereco?: string;
}

interface StoreContextProps {
  pecas: Peca[];
  pedidos: Pedido[];
  carrinho: ItemPedido[];
  loading: boolean;
  
  // Cliente Session
  clienteLogado: Cliente | null;
  loginCliente: (telefone: string) => boolean;
  cadastrarCliente: (cliente: Cliente) => void;
  logoutCliente: () => void;
  
  // Admin Session
  adminLogado: boolean;
  loginAdmin: (usuario: string, senha: string) => boolean;
  logoutAdmin: () => void;
  
  // Pecas Actions
  addPeca: (pecaData: Omit<Peca, "id" | "criadoEm">) => void;
  updatePeca: (id: string, updates: Partial<Peca>) => void;
  deletePeca: (id: string) => void;
  
  // Pedidos Actions
  addPedido: (cliente: Cliente, cupom?: string, descontoPercentual?: number) => Pedido | null;
  responderPedido: (id: string, status: "aprovado" | "recusado", motivoRecusa?: string) => void;
  
  // Carrinho Actions
  addToCart: (peca: Peca, variacaoId: string, quantidade: number) => void;
  removeFromCart: (variacaoId: string) => void;
  updateCartQuantity: (variacaoId: string, quantidade: number) => void;
  clearCart: () => void;

  // Categorias
  categorias: Categoria[];
  addCategoria: (nome: string) => void;
  deleteCategoria: (id: string) => void;

  // Promocoes
  promocoes: Promocao[];
  addPromocao: (promocaoData: Omit<Promocao, "id" | "criadoEm">) => void;
  updatePromocao: (id: string, updates: Partial<Promocao>) => void;
  deletePromocao: (id: string) => void;

  // Lista VIP
  listaVip: InscricaoVIP[];
  inscreverVip: (inscricao: Omit<InscricaoVIP, "id" | "criadoEm" | "notificado">) => void;
  toggleNotificadoVip: (id: string) => void;
  deleteVip: (id: string) => void;

  // Configurações
  configuracoes: ConfiguracoesLoja;
  updateConfiguracoes: (updates: Partial<ConfiguracoesLoja>) => void;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

const initialCategorias: Categoria[] = [
  { id: "cat-1", nome: "Vestidos", criadoEm: new Date().toISOString() },
  { id: "cat-2", nome: "Blusas", criadoEm: new Date().toISOString() },
  { id: "cat-3", nome: "Calcas", criadoEm: new Date().toISOString() },
  { id: "cat-4", nome: "Saias", criadoEm: new Date().toISOString() },
  { id: "cat-5", nome: "Conjuntos", criadoEm: new Date().toISOString() },
  { id: "cat-6", nome: "Macacoes", criadoEm: new Date().toISOString() }
];

const defaultConfigs: ConfiguracoesLoja = {
  googleAnalyticsId: "G-VLBRWLD1PX",
  metaPixelId: "843008558568835",
  googleAdsId: "",
  minimoPecasAtacado: 12,
  valorMinimoAtacado: 1000
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [pecas, setPecas] = useState<Peca[]>(initialPecas);
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos);
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);
  const [clienteLogado, setClienteLogado] = useState<Cliente | null>(null);
  const [adminLogado, setAdminLogado] = useState<boolean>(false);
  
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [listaVip, setListaVip] = useState<InscricaoVIP[]>([]);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesLoja>(defaultConfigs);
  
  const [loading, setLoading] = useState(true);

  // Sync state from localStorage on mount
  useEffect(() => {
    try {
      const storedPecas = localStorage.getItem("fysi_pecas");
      const storedPedidos = localStorage.getItem("fysi_pedidos");
      const storedCarrinho = localStorage.getItem("fysi_carrinho");
      const storedCliente = localStorage.getItem("fysi_cliente");
      const storedAdmin = localStorage.getItem("fysi_admin");
      
      const storedCategorias = localStorage.getItem("fysi_categorias");
      const storedPromocoes = localStorage.getItem("fysi_promocoes");
      const storedListaVip = localStorage.getItem("fysi_listavip");
      const storedConfiguracoes = localStorage.getItem("fysi_configuracoes");

      if (storedPecas) setPecas(JSON.parse(storedPecas));
      if (storedPedidos) setPedidos(JSON.parse(storedPedidos));
      if (storedCarrinho) setCarrinho(JSON.parse(storedCarrinho));
      if (storedCliente) setClienteLogado(JSON.parse(storedCliente));
      if (storedAdmin) setAdminLogado(JSON.parse(storedAdmin) === "true");
      
      if (storedCategorias) setCategorias(JSON.parse(storedCategorias));
      if (storedPromocoes) setPromocoes(JSON.parse(storedPromocoes));
      if (storedListaVip) setListaVip(JSON.parse(storedListaVip));
      if (storedConfiguracoes) setConfiguracoes(JSON.parse(storedConfiguracoes));
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync states back to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("fysi_pecas", JSON.stringify(pecas));
    }
  }, [pecas, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("fysi_pedidos", JSON.stringify(pedidos));
    }
  }, [pedidos, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("fysi_carrinho", JSON.stringify(carrinho));
    }
  }, [carrinho, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("fysi_categorias", JSON.stringify(categorias));
    }
  }, [categorias, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("fysi_promocoes", JSON.stringify(promocoes));
    }
  }, [promocoes, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("fysi_listavip", JSON.stringify(listaVip));
    }
  }, [listaVip, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("fysi_configuracoes", JSON.stringify(configuracoes));
    }
  }, [configuracoes, loading]);

  useEffect(() => {
    if (!loading) {
      if (clienteLogado) {
        localStorage.setItem("fysi_cliente", JSON.stringify(clienteLogado));
      } else {
        localStorage.removeItem("fysi_cliente");
      }
    }
  }, [clienteLogado, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("fysi_admin", adminLogado ? "true" : "false");
    }
  }, [adminLogado, loading]);

  // Cliente Session actions
  const loginCliente = (telefone: string) => {
    const cleanInput = telefone.replace(/\D/g, "");
    if (!cleanInput) return false;

    // Search existing orders for this phone number
    const matchedOrder = pedidos.find(
      (p) => p.cliente.telefone.replace(/\D/g, "") === cleanInput
    );

    if (matchedOrder) {
      setClienteLogado({
        nome: matchedOrder.cliente.nome,
        telefone: matchedOrder.cliente.telefone,
        endereco: matchedOrder.cliente.endereco || ""
      });
      return true;
    }
    
    // Fallback: search initial mock data just in case
    return false;
  };

  const cadastrarCliente = (cliente: Cliente) => {
    setClienteLogado(cliente);
  };

  const logoutCliente = () => {
    setClienteLogado(null);
  };

  // Admin Session actions
  const loginAdmin = (usuario: string, senha: string) => {
    if (usuario.trim() === "admin" && senha === "fysi2026") {
      setAdminLogado(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminLogado(false);
  };

  // Pecas actions
  const addPeca = (pecaData: Omit<Peca, "id" | "criadoEm">) => {
    const newPeca: Peca = {
      ...pecaData,
      id: `peca-${Date.now()}`,
      criadoEm: new Date().toISOString()
    };
    setPecas((prev) => [newPeca, ...prev]);
  };

  const updatePeca = (id: string, updates: Partial<Peca>) => {
    setPecas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePeca = (id: string) => {
    setPecas((prev) => prev.filter((p) => p.id !== id));
  };

  // Pedidos actions
  const addPedido = (cliente: Cliente, cupom?: string, descontoPercentual?: number) => {
    if (carrinho.length === 0) return null;

    const nextNumero =
      pedidos.length > 0 ? Math.max(...pedidos.map((o) => o.numero)) + 1 : 1205;

    const subtotal = carrinho.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0);
    const desconto = descontoPercentual ? subtotal * (descontoPercentual / 100) : 0;
    const total = Math.max(0, subtotal - desconto);

    const newPedido: Pedido = {
      id: `pedido-${Date.now()}`,
      numero: nextNumero,
      cliente,
      itens: [...carrinho],
      total,
      status: "pendente",
      criadoEm: new Date().toISOString()
    };

    setPedidos((prev) => [newPedido, ...prev]);
    setCarrinho([]); // Clear cart
    return newPedido;
  };

  const responderPedido = (id: string, status: "aprovado" | "recusado", motivoRecusa?: string) => {
    setPedidos((prevPedidos) => {
      const targetOrder = prevPedidos.find((p) => p.id === id);
      if (!targetOrder || targetOrder.status !== "pendente") {
        return prevPedidos; // Order not found or already processed
      }

      // 1. Update order status
      const updatedPedidos = prevPedidos.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status,
            motivoRecusa: status === "recusado" ? motivoRecusa : undefined,
            respondidoEm: new Date().toISOString()
          };
        }
        return p;
      });

      // 2. If approved, debit stock from pieces
      if (status === "aprovado") {
        setPecas((prevPecas) =>
          prevPecas.map((peca) => {
            // Check if this piece is in the order
            const orderItensForPeca = targetOrder.itens.filter((item) => item.pecaId === peca.id);
            if (orderItensForPeca.length === 0) return peca;

            // Update variations
            const updatedVariacoes = peca.variacoes.map((variacao) => {
              const matchedItem = orderItensForPeca.find((item) => item.variacaoId === variacao.id);
              if (matchedItem) {
                return {
                  ...variacao,
                  quantidadeEstoque: Math.max(0, variacao.quantidadeEstoque - matchedItem.quantidade)
                };
              }
              return variacao;
            });

            return {
              ...peca,
              variacoes: updatedVariacoes
            };
          })
        );
      }

      return updatedPedidos;
    });
  };

  // Carrinho actions
  const addToCart = (peca: Peca, variacaoId: string, quantidade: number) => {
    const varObj = peca.variacoes.find((v) => v.id === variacaoId);
    if (!varObj) return;

    setCarrinho((prev) => {
      const existingIndex = prev.findIndex((item) => item.variacaoId === variacaoId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantidade + quantidade;
        // Cap quantity based on stock
        updated[existingIndex].quantidade = Math.min(newQty, varObj.quantidadeEstoque);
        return updated;
      } else {
        // Check for active category-wide promotions (not coupon code based)
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
          precoUnitario: precoVigente
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (variacaoId: string) => {
    setCarrinho((prev) => prev.filter((item) => item.variacaoId !== variacaoId));
  };

  const updateCartQuantity = (variacaoId: string, quantidade: number) => {
    setCarrinho((prev) =>
      prev.map((item) => {
        if (item.variacaoId === variacaoId) {
          // Find the corresponding piece to verify stock limit
          const targetPeca = pecas.find((p) => p.id === item.pecaId);
          const targetVar = targetPeca?.variacoes.find((v) => v.id === variacaoId);
          const maxStock = targetVar ? targetVar.quantidadeEstoque : 999;
          
          return {
            ...item,
            quantidade: Math.min(Math.max(1, quantidade), maxStock)
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCarrinho([]);
  };

  // Categorias Actions
  const addCategoria = (nome: string) => {
    const nova: Categoria = {
      id: `cat-${Date.now()}`,
      nome,
      criadoEm: new Date().toISOString()
    };
    setCategorias((prev) => [...prev, nova]);
  };

  const deleteCategoria = (id: string) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  // Promocoes Actions
  const addPromocao = (promocaoData: Omit<Promocao, "id" | "criadoEm">) => {
    const nova: Promocao = {
      ...promocaoData,
      id: `promo-${Date.now()}`,
      criadoEm: new Date().toISOString()
    };
    setPromocoes((prev) => [nova, ...prev]);
  };

  const updatePromocao = (id: string, updates: Partial<Promocao>) => {
    setPromocoes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePromocao = (id: string) => {
    setPromocoes((prev) => prev.filter((p) => p.id !== id));
  };

  // Lista VIP Actions
  const inscreverVip = (inscricaoData: Omit<InscricaoVIP, "id" | "criadoEm" | "notificado">) => {
    const novaInscricao: InscricaoVIP = {
      ...inscricaoData,
      id: `vip-${Date.now()}`,
      criadoEm: new Date().toISOString(),
      notificado: false
    };
    setListaVip((prev) => [novaInscricao, ...prev]);
  };

  const toggleNotificadoVip = (id: string) => {
    setListaVip((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notificado: !item.notificado } : item))
    );
  };

  const deleteVip = (id: string) => {
    setListaVip((prev) => prev.filter((item) => item.id !== id));
  };

  const updateConfiguracoes = (updates: Partial<ConfiguracoesLoja>) => {
    setConfiguracoes((prev) => ({ ...prev, ...updates }));
  };

  return (
    <StoreContext.Provider
      value={{
        pecas,
        pedidos,
        carrinho,
        clienteLogado,
        adminLogado,
        loading,
        loginCliente,
        cadastrarCliente,
        logoutCliente,
        loginAdmin,
        logoutAdmin,
        addPeca,
        updatePeca,
        deletePeca,
        addPedido,
        responderPedido,
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
        updateConfiguracoes
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
