import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Peca, VariacaoPeca } from "@/lib/types";

// Mapeia linha do banco para o tipo Peca da app
function mapRow(row: Record<string, unknown>, variacoes: VariacaoPeca[]): Peca {
  return {
    id: row.id as string,
    nome: row.nome as string,
    referencia: row.referencia as string,
    descricao: row.descricao as string,
    categoria: row.categoria as string,
    preco: Number(row.preco),
    fotos: (row.fotos as string[]) ?? [],
    ativo: row.ativo as boolean,
    criadoEm: row.criado_em as string,
    variacoes,
    bullets: (row.bullets as string[]) ?? [],
    detalheTexto: (row.detalhe_texto as string) ?? "",
    envioTexto: (row.envio_texto as string) ?? "",
    devolucoesTexto: (row.devolucoes_texto as string) ?? "",
  };
}

export async function GET() {
  const supabase = await createClient();

  const { data: pecasRows, error: pecasError } = await supabase
    .from("pecas")
    .select("*")
    .order("criado_em", { ascending: false });

  if (pecasError) {
    return NextResponse.json({ error: pecasError.message }, { status: 500 });
  }

  const { data: variacoesRows, error: varError } = await supabase
    .from("variacoes_peca")
    .select("*");

  if (varError) {
    return NextResponse.json({ error: varError.message }, { status: 500 });
  }

  const pecas = (pecasRows ?? []).map((row) => {
    const variacoes: VariacaoPeca[] = (variacoesRows ?? [])
      .filter((v) => v.peca_id === row.id)
      .map((v) => ({
        id: v.id,
        cor: v.cor,
        corHex: v.cor_hex ?? undefined,
        tamanho: v.tamanho,
        quantidadeEstoque: v.quantidade_estoque,
      }));
    return mapRow(row, variacoes);
  });

  return NextResponse.json(pecas);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const id = `peca-${Date.now()}`;
  const { variacoes, ...pecaData } = body;

  const { error: pecaError } = await supabase.from("pecas").insert({
    id,
    nome: pecaData.nome,
    referencia: pecaData.referencia,
    descricao: pecaData.descricao ?? "",
    categoria: pecaData.categoria,
    preco: pecaData.preco,
    fotos: pecaData.fotos ?? [],
    ativo: pecaData.ativo ?? true,
    bullets: pecaData.bullets ?? [],
    detalhe_texto: pecaData.detalheTexto ?? "",
    envio_texto: pecaData.envioTexto ?? "",
    devolucoes_texto: pecaData.devolucoesTexto ?? "",
  });

  if (pecaError) {
    return NextResponse.json({ error: pecaError.message }, { status: 500 });
  }

  if (variacoes && variacoes.length > 0) {
    const varRows = variacoes.map((v: VariacaoPeca, i: number) => ({
      id: v.id || `var-${Date.now()}-${i}`,
      peca_id: id,
      cor: v.cor,
      cor_hex: v.corHex ?? null,
      tamanho: v.tamanho,
      quantidade_estoque: v.quantidadeEstoque ?? 0,
    }));

    const { error: varError } = await supabase
      .from("variacoes_peca")
      .insert(varRows);

    if (varError) {
      return NextResponse.json({ error: varError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id }, { status: 201 });
}
