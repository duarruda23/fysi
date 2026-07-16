import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ItemPedido, Pedido } from "@/lib/types";
import { dispatchWebhook } from "@/lib/webhook-dispatch";

function mapPedidoRow(
  row: Record<string, unknown>,
  itens: ItemPedido[]
): Pedido {
  return {
    id: row.id as string,
    numero: row.numero as number,
    cliente: {
      nome: row.cliente_nome as string,
      email: (row.cliente_email as string) ?? undefined,
      telefone: row.cliente_telefone as string,
      endereco: (row.cliente_endereco as string) ?? undefined,
      clienteId: (row.cliente_id as string) ?? undefined,
    },
    itens,
    total: Number(row.total),
    status: row.status as Pedido["status"],
    motivoRecusa: (row.motivo_recusa as string) ?? undefined,
    criadoEm: row.criado_em as string,
    respondidoEm: (row.respondido_em as string) ?? undefined,
  };
}

export async function GET() {
  const supabase = await createClient();

  const { data: pedidosRows, error: pedidosError } = await supabase
    .from("pedidos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (pedidosError) {
    return NextResponse.json({ error: pedidosError.message }, { status: 500 });
  }

  const { data: itensRows, error: itensError } = await supabase
    .from("itens_pedido")
    .select("*");

  if (itensError) {
    return NextResponse.json({ error: itensError.message }, { status: 500 });
  }

  const pedidos = (pedidosRows ?? []).map((row) => {
    const itens: ItemPedido[] = (itensRows ?? [])
      .filter((i) => i.pedido_id === row.id)
      .map((i) => ({
        pecaId: i.peca_id,
        variacaoId: i.variacao_id,
        nomePeca: i.nome_peca,
        cor: i.cor,
        tamanho: i.tamanho,
        quantidade: i.quantidade,
        precoUnitario: Number(i.preco_unitario),
      }));
    return mapPedidoRow(row, itens);
  });

  return NextResponse.json(pedidos);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  // body: { cliente, itens, total, cupom?, descontoPercentual? }

  // Buscar próximo número
  const { data: maxRow } = await supabase
    .from("pedidos")
    .select("numero")
    .order("numero", { ascending: false })
    .limit(1)
    .single();

  const nextNumero = maxRow ? maxRow.numero + 1 : 1205;
  const id = `pedido-${Date.now()}`;

  const subtotal = body.itens.reduce(
    (sum: number, item: ItemPedido) =>
      sum + item.quantidade * item.precoUnitario,
    0
  );
  const desconto = body.descontoPercentual
    ? subtotal * (body.descontoPercentual / 100)
    : 0;
  const total = Math.max(0, subtotal - desconto);

  // Pedido avulso pode ter status inicial customizado (aprovado ou pendente)
  const statusInicial = body.avulso && body.statusInicial === "aprovado"
    ? "aprovado"
    : "pendente";

  const { error: pedidoError } = await supabase.from("pedidos").insert({
    id,
    numero: nextNumero,
    cliente_nome: body.cliente.nome,
    cliente_email: body.cliente.email ?? null,
    cliente_telefone: body.cliente.telefone,
    cliente_endereco: body.cliente.endereco ?? null,
    cliente_id: body.cliente.clienteId ?? null,
    total,
    status: statusInicial,
  });

  if (pedidoError) {
    return NextResponse.json({ error: pedidoError.message }, { status: 500 });
  }

  const itensRows = body.itens.map((item: ItemPedido) => ({
    pedido_id: id,
    peca_id: item.pecaId,
    variacao_id: item.variacaoId,
    nome_peca: item.nomePeca,
    cor: item.cor,
    tamanho: item.tamanho,
    quantidade: item.quantidade,
    preco_unitario: item.precoUnitario,
  }));

  const { error: itensError } = await supabase
    .from("itens_pedido")
    .insert(itensRows);

  if (itensError) {
    return NextResponse.json({ error: itensError.message }, { status: 500 });
  }

  // Disparar webhook de novo pedido (fire-and-forget)
  dispatchWebhook("novo_pedido", {
    pedidoId: id,
    numero: nextNumero,
    total,
    cliente: body.cliente,
    itens: body.itens,
  });

  return NextResponse.json({ id, numero: nextNumero, total }, { status: 201 });
}
