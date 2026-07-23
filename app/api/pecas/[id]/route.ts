import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { VariacaoPeca } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();
  const { variacoes, ...pecaData } = body;

  const updatePayload: Record<string, unknown> = {};
  if (pecaData.nome !== undefined) updatePayload.nome = pecaData.nome;
  if (pecaData.referencia !== undefined) updatePayload.referencia = pecaData.referencia;
  if (pecaData.descricao !== undefined) updatePayload.descricao = pecaData.descricao;
  if (pecaData.categoria !== undefined) updatePayload.categoria = pecaData.categoria;
  if (pecaData.preco !== undefined) updatePayload.preco = pecaData.preco;
  if (pecaData.fotos !== undefined) updatePayload.fotos = pecaData.fotos;
  if (pecaData.ativo !== undefined) updatePayload.ativo = pecaData.ativo;
  if (pecaData.bullets !== undefined) updatePayload.bullets = pecaData.bullets;
  if (pecaData.detalheTexto !== undefined) updatePayload.detalhe_texto = pecaData.detalheTexto;
  if (pecaData.envioTexto !== undefined) updatePayload.envio_texto = pecaData.envioTexto;
  if (pecaData.devolucoesTexto !== undefined) updatePayload.devolucoes_texto = pecaData.devolucoesTexto;
  if (pecaData.videoYoutube !== undefined) updatePayload.video_youtube = pecaData.videoYoutube || null;
  if (pecaData.pesoGramas !== undefined) updatePayload.peso_gramas = pecaData.pesoGramas;

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase
      .from("pecas")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Se variações foram enviadas, substituir tudo
  if (variacoes !== undefined) {
    await supabase.from("variacoes_peca").delete().eq("peca_id", id);

    if (variacoes.length > 0) {
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
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("pecas").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
