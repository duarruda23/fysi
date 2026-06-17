import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { InscricaoVIP } from "@/lib/types";

function mapRow(row: Record<string, unknown>): InscricaoVIP {
  return {
    id: row.id as string,
    clienteNome: row.cliente_nome as string,
    clienteTelefone: row.cliente_telefone as string,
    pecaId: row.peca_id as string,
    pecaNome: row.peca_nome as string,
    variacaoId: row.variacao_id as string,
    cor: row.cor as string,
    tamanho: row.tamanho as InscricaoVIP["tamanho"],
    notificado: row.notificado as boolean,
    criadoEm: row.criado_em as string,
  };
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lista_vip")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(mapRow));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const id = `vip-${Date.now()}`;

  const { error } = await supabase.from("lista_vip").insert({
    id,
    cliente_nome: body.clienteNome,
    cliente_telefone: body.clienteTelefone,
    peca_id: body.pecaId,
    peca_nome: body.pecaNome,
    variacao_id: body.variacaoId,
    cor: body.cor,
    tamanho: body.tamanho,
    notificado: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id }, { status: 201 });
}
