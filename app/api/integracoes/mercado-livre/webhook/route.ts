import { NextRequest, NextResponse } from "next/server";
import { getValidMercadoLivreToken } from "@/lib/integracoes/mercado-livre";
import {
  buscarDetalhesVariacaoPorItemML,
  baixarEstoqueVariacao,
  criarPedidoImportadoML,
} from "@/lib/integracoes/mercado-livre-sync";
import { dispatchWebhook } from "@/lib/webhook-dispatch";

export const dynamic = "force-dynamic";

interface NotificacaoML {
  topic: string;
  resource: string;
  user_id: number;
}

// POST /api/integracoes/mercado-livre/webhook — recebe notificações do ML
// (pedido novo, mudança de item etc). Sem auth — o próprio ML chama isso
// direto. Sempre responde 200 rápido pra evitar retry/desativação do webhook
// pelo ML; erros de processamento só vão pro log.
export async function POST(request: NextRequest) {
  let body: NotificacaoML;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Processa antes de responder — funções serverless não garantem execução
  // em segundo plano depois do response ser enviado, e o volume de pedidos
  // ainda é baixo o suficiente pra isso não pesar na latência.
  try {
    await processarNotificacao(body);
  } catch (err) {
    console.error("[mercado-livre/webhook] Erro ao processar notificação:", err);
  }

  return NextResponse.json({ ok: true });
}

async function processarNotificacao(notificacao: NotificacaoML) {
  if (notificacao.topic !== "orders_v2") return;

  const token = await getValidMercadoLivreToken();

  const orderRes = await fetch(`https://api.mercadolibre.com${notificacao.resource}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!orderRes.ok) {
    console.error("[mercado-livre/webhook] Falha ao buscar pedido:", notificacao.resource);
    return;
  }

  const order = await orderRes.json();

  // Só processa pedidos pagos — status "paid" é o ponto seguro de considerar
  // a venda confirmada (evita criar pedido/descontar estoque por algo
  // cancelado/pendente).
  if (order.status !== "paid") return;

  const itensResolvidos: {
    pecaId: string;
    variacaoId: string;
    nomePeca: string;
    cor: string;
    tamanho: string;
    quantidade: number;
    precoUnitario: number;
  }[] = [];

  for (const orderItem of order.order_items ?? []) {
    const itemId = orderItem.item?.id as string | undefined;
    const quantidade = orderItem.quantity as number | undefined;
    if (!itemId || !quantidade) continue;

    const detalhe = await buscarDetalhesVariacaoPorItemML(itemId);
    if (!detalhe) {
      console.error("[mercado-livre/webhook] Item vendido não mapeado pra nenhuma peça:", itemId);
      continue;
    }

    itensResolvidos.push({
      ...detalhe,
      quantidade,
      precoUnitario: Number(orderItem.unit_price ?? 0),
    });
  }

  if (itensResolvidos.length === 0) return;

  const buyer = order.buyer ?? {};
  const clienteNome =
    buyer.first_name && buyer.last_name
      ? `${buyer.first_name} ${buyer.last_name}`
      : (buyer.nickname as string | undefined) ?? "Comprador Mercado Livre";

  const resultado = await criarPedidoImportadoML({
    pedidoExternoId: String(order.id),
    clienteNome,
    itens: itensResolvidos,
  });

  // Só desconta estoque e dispara webhook na primeira vez que esse pedido é
  // processado — o ML pode reenviar a mesma notificação mais de uma vez.
  if (!resultado.criado) return;

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
}
