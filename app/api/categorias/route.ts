import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("criado_em", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const categorias = (data ?? []).map((row) => ({
    id: row.id,
    nome: row.nome,
    criadoEm: row.criado_em,
  }));

  return NextResponse.json(categorias);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { nome } = await request.json();

  const id = `cat-${Date.now()}`;

  const { error } = await supabase.from("categorias").insert({ id, nome });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();

  const { error } = await supabase.from("categorias").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
