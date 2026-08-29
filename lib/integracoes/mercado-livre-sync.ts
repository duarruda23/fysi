import { createClient } from "@supabase/supabase-js";
import { getValidMercadoLivreToken } from "./mercado-livre";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

/**
 * Empurra o estoque de uma variação da Fysi pro anúncio correspondente no
 * Mercado Livre (se ela já tiver sido publicada lá). Fire-and-forget por
 * natureza — falha aqui não deve derrubar o salvamento da peça no admin.
 */
export async function sincronizarEstoqueVariacaoML(
  variacaoId: string,
  novaQuantidade: number
): Promise<void> {
  try {
    const { data: publicacao } = await supabaseService
      .from("publicacoes_marketplace")
      .select("item_id_externo, status")
      .eq("variacao_id", variacaoId)
      .eq("canal", "mercado_livre")
      .maybeSingle();

    if (!publicacao || publicacao.status !== "publicado" || !publicacao.item_id_externo) {
      return; // Variação nunca foi publicada no ML — nada a sincronizar.
    }

    const token = await getValidMercadoLivreToken();

    const res = await fetch(`https://api.mercadolibre.com/items/${publicacao.item_id_externo}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ available_quantity: Math.max(0, novaQuantidade) }),
    });

    if (!res.ok) {
      const detalhe = await res.json().catch(() => null);
      console.error(
        `[mercado-livre-sync] Falha ao atualizar estoque do item ${publicacao.item_id_externo}:`,
        detalhe
      );
    }
  } catch (err) {
    console.error("[mercado-livre-sync] Erro ao sincronizar estoque:", err);
  }
}

/**
 * Dado o item_id de um anúncio do Mercado Livre, encontra a variação da
 * Fysi correspondente (usado pelo webhook de pedidos pra baixar estoque
 * local quando uma venda acontece lá).
 */
export async function buscarVariacaoPorItemML(
  itemId: string
): Promise<{ variacaoId: string; pecaId: string } | null> {
  const { data } = await supabaseService
    .from("publicacoes_marketplace")
    .select("variacao_id, peca_id")
    .eq("item_id_externo", itemId)
    .eq("canal", "mercado_livre")
    .maybeSingle();

  if (!data || !data.variacao_id) return null;
  return { variacaoId: data.variacao_id as string, pecaId: data.peca_id as string };
}

/**
 * Baixa o estoque local da Fysi em `quantidade` unidades pra uma variação
 * específica, sem deixar ficar negativo.
 */
export async function baixarEstoqueVariacao(variacaoId: string, quantidade: number): Promise<void> {
  const { data: variacao } = await supabaseService
    .from("variacoes_peca")
    .select("quantidade_estoque")
    .eq("id", variacaoId)
    .single();

  if (!variacao) return;

  const novoEstoque = Math.max(0, (variacao.quantidade_estoque as number) - quantidade);

  await supabaseService
    .from("variacoes_peca")
    .update({ quantidade_estoque: novoEstoque })
    .eq("id", variacaoId);
}
