import { NextRequest, NextResponse } from "next/server";
import { getValidMercadoLivreToken } from "@/lib/integracoes/mercado-livre";
import { buscarVariacaoPorItemML, baixarEstoqueVariacao } from "@/lib/integracoes/mercado-livre-sync";

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

  // Só baixa estoque em pedidos pagos — status "paid" é o ponto seguro de
  // considerar a venda confirmada (evita descontar por pedido cancelado/pendente).
  if (order.status !== "paid") return;

  for (const orderItem of order.order_items ?? []) {
    const itemId = orderItem.item?.id as string | undefined;
    const quantidade = orderItem.quantity as number | undefined;
    if (!itemId || !quantidade) continue;

    const variacao = await buscarVariacaoPorItemML(itemId);
    if (!variacao) {
      console.error("[mercado-livre/webhook] Item vendido não mapeado pra nenhuma peça:", itemId);
      continue;
    }

    await baixarEstoqueVariacao(variacao.variacaoId, quantidade);
  }
}
