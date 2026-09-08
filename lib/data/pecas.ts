import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Peca, VariacaoPeca } from "@/lib/types";

// Mapeia linha do banco para o tipo Peca da app — mesma lógica usada por app/api/pecas/route.ts
export function mapPecaRow(row: Record<string, unknown>, variacoes: VariacaoPeca[]): Peca {
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

/** Busca todas as peças (com variações) — usado no server (páginas e API route). */
export async function getPecas(): Promise<Peca[]> {
  const supabase = await createServerClient();

  const { data: pecasRows, error: pecasError } = await supabase
    .from("pecas")
    .select("*")
    .order("criado_em", { ascending: false });

  if (pecasError) throw new Error(pecasError.message);

  const { data: variacoesRows, error: varError } = await supabase
    .from("variacoes_peca")
    .select("*");

  if (varError) throw new Error(varError.message);

  return (pecasRows ?? []).map((row) => {
    const variacoes: VariacaoPeca[] = (variacoesRows ?? [])
      .filter((v) => v.peca_id === row.id)
      .map((v) => ({
        id: v.id,
        cor: v.cor,
        corHex: v.cor_hex ?? undefined,
        tamanho: v.tamanho,
        quantidadeEstoque: v.quantidade_estoque,
      }));
    return mapPecaRow(row, variacoes);
  });
}

/** Busca uma peça específica pelo id, com variações. Retorna null se não existir. */
export async function getPecaById(id: string): Promise<Peca | null> {
  const supabase = await createServerClient();

  const { data: row, error } = await supabase
    .from("pecas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) return null;

  const { data: variacoesRows, error: varError } = await supabase
    .from("variacoes_peca")
    .select("*")
    .eq("peca_id", id);

  if (varError) throw new Error(varError.message);

  const variacoes: VariacaoPeca[] = (variacoesRows ?? []).map((v) => ({
    id: v.id,
    cor: v.cor,
    corHex: v.cor_hex ?? undefined,
    tamanho: v.tamanho,
    quantidadeEstoque: v.quantidade_estoque,
  }));

  return mapPecaRow(row, variacoes);
}

/**
 * Busca só id + data de criação das peças ativas, pro sitemap.xml.
 * Usa um client Supabase "puro" (sem cookies/sessão) porque o sitemap não
 * roda necessariamente dentro de um request com contexto de cookies.
 */
export async function getPecaIdsParaSitemap(): Promise<{ id: string; criadoEm: string }[]> {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("pecas")
    .select("id, criado_em")
    .eq("ativo", true);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({ id: row.id as string, criadoEm: row.criado_em as string }));
}
