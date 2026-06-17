import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.nome !== undefined) updates.nome = body.nome;
  if (body.url !== undefined) updates.url = body.url;
  if (body.gatilhos !== undefined) updates.gatilhos = body.gatilhos;
  if (body.ativo !== undefined) updates.ativo = body.ativo;

  const { error } = await supabase.from("webhooks").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const { error } = await supabase.from("webhooks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
