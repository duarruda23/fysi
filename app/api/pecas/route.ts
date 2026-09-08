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
    precoMercadoLivre: row.preco_mercado_livre != null ? Number(row.preco_mercado_livre) : undefined,
    precoShopee: row.preco_shopee != null ? Number(row.preco_shopee) : undefined,
    pesoGramas: row.peso_gramas != null ? Number(row.peso_gramas) : 380,
    larguraCm: row.largura_cm != null ? Number(row.largura_cm) : undefined,
    comprimentoCm: row.comprimento_cm != null ? Number(row.comprimento_cm) : undefined,
    alturaCm: row.altura_cm != null ? Number(row.altura_cm) : undefined,
    fotos: (row.fotos as string[]) ?? [],
    ativo: row.ativo as boolean,
    criadoEm: row.criado_em as string,
    variacoes,
    bullets: (row.bullets as string[]) ?? [],
    detalheTexto: (row.detalhe_texto as string) ?? "",
    envioTexto: (row.envio_texto as string) ?? "",
    devolucoesTexto: (row.devolucoes_texto as string) ?? "",
    videoYoutube: (row.video_youtube as string) ?? "",
    materialPrincipal: (row.material_principal as string) ?? "",
    tipoCalca: (row.tipo_calca as string) ?? "",
    prazoDisponibilidadeDias: row.prazo_disponibilidade_dias != null ? Number(row.prazo_disponibilidade_dias) : undefined,
    garantia: (row.garantia as string) ?? "",
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
    preco_mercado_livre: pecaData.precoMercadoLivre ?? null,
    preco_shopee: pecaData.precoShopee ?? null,
    peso_gramas: pecaData.pesoGramas ?? 380,
    largura_cm: pecaData.larguraCm ?? null,
    comprimento_cm: pecaData.comprimentoCm ?? null,
    altura_cm: pecaData.alturaCm ?? null,
    fotos: pecaData.fotos ?? [],
    ativo: pecaData.ativo ?? true,
    bullets: pecaData.bullets ?? [],
    detalhe_texto: pecaData.detalheTexto ?? "",
    envio_texto: pecaData.envioTexto ?? "",
    devolucoes_texto: pecaData.devolucoesTexto ?? "",
    video_youtube: pecaData.videoYoutube || null,
    material_principal: pecaData.materialPrincipal || null,
    tipo_calca: pecaData.tipoCalca || null,
    prazo_disponibilidade_dias: pecaData.prazoDisponibilidadeDias ?? null,
    garantia: pecaData.garantia ?? "",
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
