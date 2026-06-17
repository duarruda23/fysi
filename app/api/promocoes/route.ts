import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Promocao } from "@/lib/types";

function mapRow(row: Record<string, unknown>): Promocao {
  return {
    id: row.id as string,
    nome: row.nome as string,
    cupom: (row.cupom as string) ?? undefined,
    descontoPercentual: Number(row.desconto_percentual),
    ativo: row.ativo as boolean,
    categoriaAlvo: (row.categoria_alvo as string) ?? undefined,
    criadoEm: row.criado_em as string,
  };
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("promocoes")
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

  const id = `promo-${Date.now()}`;

  const { error } = await supabase.from("promocoes").insert({
    id,
    nome: body.nome,
    cupom: body.cupom ?? null,
    desconto_percentual: body.descontoPercentual,
    ativo: body.ativo ?? true,
    categoria_alvo: body.categoriaAlvo ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id }, { status: 201 });
}
