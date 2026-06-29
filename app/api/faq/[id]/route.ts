import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const body = await request.json();
  const { pergunta, resposta, ordem, ativo } = body;
  const { data, error } = await supabase
    .from("faq")
    .update({ pergunta, resposta, ordem, ativo })
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { error } = await supabase.from("faq").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
