import { NextRequest, NextResponse } from "next/server";
import { getValidMercadoLivreToken } from "@/lib/integracoes/mercado-livre";
import { processarPedidoPagoML } from "@/lib/integracoes/mercado-livre-sync";

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
    if (body.topic === "orders_v2") {
      const token = await getValidMercadoLivreToken();
      const orderRes = await fetch(`https://api.mercadolibre.com${body.resource}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (orderRes.ok) {
        await processarPedidoPagoML(await orderRes.json());
      } else {
        console.error("[mercado-livre/webhook] Falha ao buscar pedido:", body.resource);
      }
    }
  } catch (err) {
    console.error("[mercado-livre/webhook] Erro ao processar notificação:", err);
  }

  return NextResponse.json({ ok: true });
}
