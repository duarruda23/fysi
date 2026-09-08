import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getPecas } from "@/lib/data/pecas";
import type { VariacaoPeca } from "@/lib/types";

export async function GET() {
  try {
    const pecas = await getPecas();
    return NextResponse.json(pecas);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
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
