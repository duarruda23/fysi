import { createClient } from "@supabase/supabase-js";
import { getValidMercadoLivreToken } from "./mercado-livre";
import { dispatchWebhook } from "@/lib/webhook-dispatch";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

/**
 * Empurra o estoque de uma variação da Fysi pro anúncio correspondente no
 * Mercado Livre (se ela já tiver sido publicada lá). Fire-and-forget por
 * natureza — falha aqui não deve derrubar o salvamento da peça no admin.
 */
export async function sincronizarEstoqueVariacaoML(
  variacaoId: string,
  novaQuantidade: number
): Promise<void> {
  try {
    const { data: publicacao } = await supabaseService
      .from("publicacoes_marketplace")
      .select("item_id_externo, status")
      .eq("variacao_id", variacaoId)
      .eq("canal", "mercado_livre")
      .maybeSingle();

    if (!publicacao || publicacao.status !== "publicado" || !publicacao.item_id_externo) {
      return; // Variação nunca foi publicada no ML — nada a sincronizar.
    }

    const token = await getValidMercadoLivreToken();

    const res = await fetch(`https://api.mercadolibre.com/items/${publicacao.item_id_externo}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ available_quantity: Math.max(0, novaQuantidade) }),
    });

    if (!res.ok) {
      const detalhe = await res.json().catch(() => null);
      console.error(
        `[mercado-livre-sync] Falha ao atualizar estoque do item ${publicacao.item_id_externo}:`,
        detalhe
      );
    }
  } catch (err) {
    console.error("[mercado-livre-sync] Erro ao sincronizar estoque:", err);
  }
}

export interface DetalheVariacaoML {
  variacaoId: string;
  pecaId: string;
  nomePeca: string;
  cor: string;
  tamanho: string;
}

/**
 * Dado o item_id de um anúncio do Mercado Livre, encontra a variação da
 * Fysi correspondente (peça, cor, tamanho) — usado pelo webhook de pedidos
 * pra baixar estoque local e montar o registro do pedido importado.
 */
export async function buscarDetalhesVariacaoPorItemML(
  itemId: string
): Promise<DetalheVariacaoML | null> {
  const { data: publicacao } = await supabaseService
    .from("publicacoes_marketplace")
    .select("variacao_id, peca_id")
    .eq("item_id_externo", itemId)
    .eq("canal", "mercado_livre")
    .maybeSingle();

  if (!publicacao || !publicacao.variacao_id) return null;

  const { data: variacao } = await supabaseService
    .from("variacoes_peca")
    .select("cor, tamanho")
    .eq("id", publicacao.variacao_id)
    .single();

  const { data: peca } = await supabaseService
    .from("pecas")
    .select("nome")
    .eq("id", publicacao.peca_id)
    .single();

  if (!variacao || !peca) return null;

  return {
    variacaoId: publicacao.variacao_id as string,
    pecaId: publicacao.peca_id as string,
    nomePeca: peca.nome as string,
    cor: variacao.cor as string,
    tamanho: String(variacao.tamanho),
  };
}

interface ItemPedidoML {
  pecaId: string;
  variacaoId: string;
  nomePeca: string;
  cor: string;
  tamanho: string;
  quantidade: number;
  precoUnitario: number;
}

/**
 * Cria um pedido no sistema da Fysi a partir de um pedido pago no Mercado
 * Livre, pra aparecer no painel de admin igual um pedido do site. Idempotente
 * por (origem, pedido_externo_id) — o ML pode reenviar a mesma notificação.
 */
export async function criarPedidoImportadoML(params: {
  pedidoExternoId: string;
  clienteNome: string;
  itens: ItemPedidoML[];
}): Promise<{ criado: boolean; pedidoId?: string; numero?: number }> {
  const { pedidoExternoId, clienteNome, itens } = params;

  const { data: existente } = await supabaseService
    .from("pedidos")
    .select("id, numero")
    .eq("origem", "mercado_livre")
    .eq("pedido_externo_id", pedidoExternoId)
    .maybeSingle();

  if (existente) {
    return { criado: false, pedidoId: existente.id as string, numero: existente.numero as number };
  }

  const { data: maxRow } = await supabaseService
    .from("pedidos")
    .select("numero")
    .order("numero", { ascending: false })
    .limit(1)
    .single();

  const proximoNumero = maxRow ? (maxRow.numero as number) + 1 : 1205;
  const id = `pedido-ml-${pedidoExternoId}`;
  const total = itens.reduce((soma, it) => soma + it.quantidade * it.precoUnitario, 0);

  const { error: pedidoError } = await supabaseService.from("pedidos").insert({
    id,
    numero: proximoNumero,
    cliente_nome: clienteNome,
    cliente_telefone: "Ver no Mercado Livre",
    cliente_endereco: "Envio via Mercado Envios — etiqueta gerada no painel do Mercado Livre",
    total,
    status: "aprovado",
    origem: "mercado_livre",
    pedido_externo_id: pedidoExternoId,
    respondido_em: new Date().toISOString(),
  });

  if (pedidoError) {
    console.error("[mercado-livre-sync] Erro ao criar pedido importado:", pedidoError);
    return { criado: false };
  }

  const itensRows = itens.map((it) => ({
    pedido_id: id,
    peca_id: it.pecaId,
    variacao_id: it.variacaoId,
    nome_peca: it.nomePeca,
    cor: it.cor,
    tamanho: it.tamanho,
    quantidade: it.quantidade,
    preco_unitario: it.precoUnitario,
  }));

  const { error: itensError } = await supabaseService.from("itens_pedido").insert(itensRows);
  if (itensError) {
    console.error("[mercado-livre-sync] Pedido criado, mas falhou ao salvar itens:", itensError);
  }

  return { criado: true, pedidoId: id, numero: proximoNumero };
}

interface PedidoMercadoLivreResumo {
  id: number | string;
  status: string;
  order_items?: {
    item?: { id?: string };
    quantity?: number;
    unit_price?: number;
  }[];
  buyer?: {
    nickname?: string;
    first_name?: string;
    last_name?: string;
  };
}

/**
 * Processa um pedido do Mercado Livre já buscado (seja via webhook real ou
 * via simulação admin): resolve os itens vendidos pras variações da Fysi,
 * cria o pedido (idempotente), desconta estoque e dispara o webhook interno
 * — só na primeira vez que esse pedido é processado.
 */
export async function processarPedidoPagoML(
  order: PedidoMercadoLivreResumo
): Promise<{ criado: boolean; pedidoId?: string; numero?: number }> {
  if (order.status !== "paid") return { criado: false };

  const itensResolvidos: (ItemPedidoML & { quantidade: number })[] = [];

  for (const orderItem of order.order_items ?? []) {
    const itemId = orderItem.item?.id;
    const quantidade = orderItem.quantity;
    if (!itemId || !quantidade) continue;

    const detalhe = await buscarDetalhesVariacaoPorItemML(itemId);
    if (!detalhe) {
      console.error("[mercado-livre-sync] Item vendido não mapeado pra nenhuma peça:", itemId);
      continue;
    }

    itensResolvidos.push({
      ...detalhe,
      quantidade,
      precoUnitario: Number(orderItem.unit_price ?? 0),
    });
  }

  if (itensResolvidos.length === 0) return { criado: false };

  const buyer = order.buyer ?? {};
  const clienteNome =
    buyer.first_name && buyer.last_name
      ? `${buyer.first_name} ${buyer.last_name}`
      : buyer.nickname ?? "Comprador Mercado Livre";

  const resultado = await criarPedidoImportadoML({
    pedidoExternoId: String(order.id),
    clienteNome,
    itens: itensResolvidos,
  });

  // Só desconta estoque e dispara webhook na primeira vez que esse pedido é
  // processado — o ML pode reenviar a mesma notificação mais de uma vez.
  if (!resultado.criado) return resultado;

  for (const item of itensResolvidos) {
    await baixarEstoqueVariacao(item.variacaoId, item.quantidade);
  }

  dispatchWebhook("novo_pedido", {
    pedidoId: resultado.pedidoId,
    numero: resultado.numero,
    origem: "mercado_livre",
    pedidoExternoId: String(order.id),
    cliente: { nome: clienteNome },
    itens: itensResolvidos,
  });

  return resultado;
}

/**
 * Baixa o estoque local da Fysi em `quantidade` unidades pra uma variação
 * específica, sem deixar ficar negativo.
 */
export async function baixarEstoqueVariacao(variacaoId: string, quantidade: number): Promise<void> {
  const { data: variacao } = await supabaseService
    .from("variacoes_peca")
    .select("quantidade_estoque")
    .eq("id", variacaoId)
    .single();

  if (!variacao) return;

  const novoEstoque = Math.max(0, (variacao.quantidade_estoque as number) - quantidade);

  await supabaseService
    .from("variacoes_peca")
    .update({ quantidade_estoque: novoEstoque })
    .eq("id", variacaoId);
}
