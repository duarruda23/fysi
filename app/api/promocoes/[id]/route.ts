import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();

  const updatePayload: Record<string, unknown> = {};
  if (body.nome !== undefined) updatePayload.nome = body.nome;
  if (body.cupom !== undefined) updatePayload.cupom = body.cupom;
  if (body.descontoPercentual !== undefined) updatePayload.desconto_percentual = body.descontoPercentual;
  if (body.ativo !== undefined) updatePayload.ativo = body.ativo;
  if (body.categoriaAlvo !== undefined) updatePayload.categoria_alvo = body.categoriaAlvo;

  const { error } = await supabase
    .from("promocoes")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("promocoes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
