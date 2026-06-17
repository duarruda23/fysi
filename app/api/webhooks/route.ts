import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Webhook } from "@/lib/types";

function mapRow(row: Record<string, unknown>): Webhook {
  return {
    id: row.id as string,
    nome: row.nome as string,
    url: row.url as string,
    gatilhos: (row.gatilhos as string[]) ?? [],
    ativo: row.ativo as boolean,
    criadoEm: row.criado_em as string,
  };
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapRow));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  if (!body.nome?.trim() || !body.url?.trim()) {
    return NextResponse.json({ error: "Nome e URL são obrigatórios." }, { status: 400 });
  }
  if (!body.url.startsWith("http")) {
    return NextResponse.json({ error: "URL inválida." }, { status: 400 });
  }
  if (!Array.isArray(body.gatilhos) || body.gatilhos.length === 0) {
    return NextResponse.json({ error: "Selecione pelo menos um gatilho." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("webhooks")
    .insert({ nome: body.nome.trim(), url: body.url.trim(), gatilhos: body.gatilhos, ativo: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapRow(data), { status: 201 });
}
