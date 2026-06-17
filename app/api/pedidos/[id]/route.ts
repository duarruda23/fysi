import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { dispatchWebhook } from "@/lib/webhook-dispatch";
import type { WebhookGatilho } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();
  // body: { status: "aprovado"|"recusado", motivoRecusa?: string, itens?: ItemPedido[] }

  const updatePayload: Record<string, unknown> = {
    status: body.status,
    respondido_em: new Date().toISOString(),
  };
  if (body.status === "recusado" && body.motivoRecusa) {
    updatePayload.motivo_recusa = body.motivoRecusa;
  }

  const { error } = await supabase
    .from("pedidos")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Se aprovado, debitar estoque
  if (body.status === "aprovado" && body.itens?.length) {
    for (const item of body.itens) {
      const { data: varRow } = await supabase
        .from("variacoes_peca")
        .select("quantidade_estoque")
        .eq("id", item.variacaoId)
        .single();

      if (varRow) {
        const novoEstoque = Math.max(
          0,
          varRow.quantidade_estoque - item.quantidade
        );
        await supabase
          .from("variacoes_peca")
          .update({ quantidade_estoque: novoEstoque })
          .eq("id", item.variacaoId);
      }
    }
  }

  // Disparar webhook conforme novo status
  const statusGatilhoMap: Record<string, WebhookGatilho> = {
    aprovado:           "atualizacao_pedido",
    recusado:           "atualizacao_pedido",
    sendo_separado:     "pedido_sendo_separado",
    saiu_para_entrega:  "saiu_para_entrega",
    enviado:            "pedido_enviado",
    entregue:           "pedido_entregue",
    realizar_pagamento: "realizar_pagamento",
    pagamento_efetuado: "pagamento_efetuado",
  };

  const gatilho = statusGatilhoMap[body.status];
  if (gatilho) {
    dispatchWebhook(gatilho, {
      pedidoId: id,
      novoStatus: body.status,
      motivoRecusa: body.motivoRecusa ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
