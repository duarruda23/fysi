import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { pergunta, resposta, ordem, ativo } = body;
  if (!pergunta?.trim() || !resposta?.trim()) {
    return NextResponse.json({ error: "Pergunta e resposta são obrigatórias." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("faq")
    .insert({ pergunta: pergunta.trim(), resposta: resposta.trim(), ordem: ordem ?? 0, ativo: ativo ?? true })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
