import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { VariacaoPeca } from "@/lib/types";
import { sincronizarEstoqueVariacaoML, sincronizarPrecoPecaML } from "@/lib/integracoes/mercado-livre-sync";
import { sincronizarPecaGoogleMerchant } from "@/lib/integracoes/google-merchant-sync";

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
  if (pecaData.precoMercadoLivre !== undefined) updatePayload.preco_mercado_livre = pecaData.precoMercadoLivre ?? null;
  if (pecaData.precoShopee !== undefined) updatePayload.preco_shopee = pecaData.precoShopee ?? null;
  if (pecaData.fotos !== undefined) updatePayload.fotos = pecaData.fotos;
  if (pecaData.ativo !== undefined) updatePayload.ativo = pecaData.ativo;
  if (pecaData.bullets !== undefined) updatePayload.bullets = pecaData.bullets;
  if (pecaData.detalheTexto !== undefined) updatePayload.detalhe_texto = pecaData.detalheTexto;
  if (pecaData.envioTexto !== undefined) updatePayload.envio_texto = pecaData.envioTexto;
  if (pecaData.devolucoesTexto !== undefined) updatePayload.devolucoes_texto = pecaData.devolucoesTexto;
  if (pecaData.videoYoutube !== undefined) updatePayload.video_youtube = pecaData.videoYoutube || null;
  if (pecaData.pesoGramas !== undefined) updatePayload.peso_gramas = pecaData.pesoGramas;
  if (pecaData.materialPrincipal !== undefined) updatePayload.material_principal = pecaData.materialPrincipal || null;
  if (pecaData.tipoCalca !== undefined) updatePayload.tipo_calca = pecaData.tipoCalca || null;
  if (pecaData.prazoDisponibilidadeDias !== undefined) updatePayload.prazo_disponibilidade_dias = pecaData.prazoDisponibilidadeDias ?? null;
  if (pecaData.garantia !== undefined) updatePayload.garantia = pecaData.garantia;

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase
      .from("pecas")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Se o preço base ou o preço específico do ML mudou, empurra o preço
    // resolvido (ML tem prioridade sobre o base) pros anúncios já publicados.
    if (pecaData.preco !== undefined || pecaData.precoMercadoLivre !== undefined) {
      const { data: pecaAtual } = await supabase
        .from("pecas")
        .select("preco, preco_mercado_livre")
        .eq("id", id)
        .single();
      if (pecaAtual) {
        const precoResolvido = Number(pecaAtual.preco_mercado_livre ?? pecaAtual.preco);
        await sincronizarPrecoPecaML(id, precoResolvido);
      }
    }
  }

  // Se variações foram enviadas, sincroniza a lista — upsert em vez de
  // delete+reinsert, porque variacoes_peca é referenciada por
  // publicacoes_marketplace (on delete cascade): recriar a linha com o
  // mesmo id apagava o vínculo com o anúncio já publicado no Mercado Livre.
  if (variacoes !== undefined) {
    const varRows = variacoes.map((v: VariacaoPeca, i: number) => ({
      id: v.id || `var-${Date.now()}-${i}`,
      peca_id: id,
      cor: v.cor,
      cor_hex: v.corHex ?? null,
      tamanho: v.tamanho,
      quantidade_estoque: v.quantidadeEstoque ?? 0,
    }));

    const idsAtuais = varRows.map((v: { id: string }) => v.id);

    // Remove só as variações que existiam antes e não vieram mais nessa edição
    const { data: existentes } = await supabase
      .from("variacoes_peca")
      .select("id")
      .eq("peca_id", id);
    const idsParaRemover = (existentes ?? [])
      .map((r) => r.id as string)
      .filter((existingId) => !idsAtuais.includes(existingId));
    if (idsParaRemover.length > 0) {
      await supabase.from("variacoes_peca").delete().in("id", idsParaRemover);
    }

    if (varRows.length > 0) {
      const { error: varError } = await supabase
        .from("variacoes_peca")
        .upsert(varRows, { onConflict: "id" });

      if (varError) {
        return NextResponse.json({ error: varError.message }, { status: 500 });
      }

      // Empurra o estoque atualizado pros anúncios já publicados no Mercado
      // Livre — não bloqueia nem falha o salvamento da peça se der erro.
      await Promise.allSettled(
        varRows.map((v: { id: string; quantidade_estoque: number }) =>
          sincronizarEstoqueVariacaoML(v.id, v.quantidade_estoque)
        )
      );
      await sincronizarPecaGoogleMerchant(id);
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
