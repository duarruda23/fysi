import { createClient } from "@supabase/supabase-js";
import { getValidMercadoLivreToken } from "./mercado-livre";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const CATEGORIA_CALCAS_ML = "MLB188065";

// Mapeamento das cores da Fysi pro vocabulário fechado do atributo COLOR do ML
// (categoria Calças). Cores sem equivalente exato usam o tom mais próximo.
const MAPA_COR_ML: Record<string, string> = {
  "bege": "Bege",
  "bege claro": "Bege",
  "marrom": "Marrom",
  "nude": "Nude",
  "preta": "Preto",
  "preto": "Preto",
  "caramelo": "Marrom-claro",
  "areia": "Palha",
};

function mapearCorML(corFysi: string): string {
  const chave = corFysi.trim().toLowerCase();
  return MAPA_COR_ML[chave] ?? corFysi;
}

// Tabela de medidas (obrigatória em categorias de moda) criada uma única vez em
// catalog/charts pra Calças Masculino Fysi — medidas de quadril aproximadas
// (padrão de mercado, não específicas do caimento da Fysi; ajustar depois no
// painel do Mercado Livre se tiver a medida real). chart_id = 7110100.
const GRID_ID_CALCAS_MASCULINO = "7110100";
const GRID_ROW_ID_POR_TAMANHO: Record<string, string> = {
  "36": "7110100:1",
  "38": "7110100:2",
  "40": "7110100:3",
  "42": "7110100:4",
  "44": "7110100:5",
  "46": "7110100:6",
};

interface ResultadoVariacao {
  variacaoId: string;
  cor: string;
  tamanho: string;
  ok: boolean;
  itemId?: string;
  erro?: string;
  detalhe?: unknown;
}

interface ResultadoPublicacao {
  ok: boolean;
  erro?: string;
  variacoes?: ResultadoVariacao[];
}

/**
 * Publica uma peça no Mercado Livre. A conta usa o modelo "User Products":
 * não existe mais um único anúncio com array de `variations` interno — cada
 * combinação de cor+tamanho vira seu próprio item (POST /items), e a API do
 * ML agrupa automaticamente os itens com marca/modelo/gênero iguais numa
 * mesma família, exibida ao comprador como um único anúncio com seletor de
 * cor/tamanho (User Products Page).
 */
export async function publicarPecaNoMercadoLivre(pecaId: string): Promise<ResultadoPublicacao> {
  const { data: pecaRow, error: pecaError } = await supabaseService
    .from("pecas")
    .select("*")
    .eq("id", pecaId)
    .single();

  if (pecaError || !pecaRow) {
    return { ok: false, erro: "Peça não encontrada." };
  }

  const { data: variacoesRows, error: varError } = await supabaseService
    .from("variacoes_peca")
    .select("*")
    .eq("peca_id", pecaId);

  if (varError) return { ok: false, erro: `Erro ao buscar variações: ${varError.message}` };
  if (!variacoesRows || variacoesRows.length === 0) {
    return { ok: false, erro: "Peça sem variações cadastradas — nada pra publicar." };
  }

  const materialPrincipal = pecaRow.material_principal as string | null;
  const tipoCalca = pecaRow.tipo_calca as string | null;
  if (!materialPrincipal || !tipoCalca) {
    return {
      ok: false,
      erro: "Faltam atributos obrigatórios (Material Principal e/ou Tipo de Calça) — preencha no admin antes de publicar.",
    };
  }

  const fotos = (pecaRow.fotos as string[]) ?? [];
  if (fotos.length === 0) {
    return { ok: false, erro: "Peça sem foto — o Mercado Livre exige pelo menos uma imagem." };
  }

  const token = await getValidMercadoLivreToken();
  const titulo = (pecaRow.nome as string).slice(0, 60);
  const descricaoTexto = [pecaRow.descricao, pecaRow.detalhe_texto].filter(Boolean).join("\n\n");

  const resultados: ResultadoVariacao[] = [];

  for (const v of variacoesRows) {
    const cor = v.cor as string;
    const tamanho = String(v.tamanho);
    const gridRowId = GRID_ROW_ID_POR_TAMANHO[tamanho];

    if (!gridRowId) {
      resultados.push({
        variacaoId: v.id as string,
        cor,
        tamanho,
        ok: false,
        erro: `Tamanho "${tamanho}" não está na tabela de medidas cadastrada — adicione uma linha na tabela (chart ${GRID_ID_CALCAS_MASCULINO}) antes de publicar essa variação.`,
      });
      continue;
    }

    const payload = {
      family_name: titulo,
      category_id: CATEGORIA_CALCAS_ML,
      price: Number(pecaRow.preco),
      currency_id: "BRL",
      available_quantity: v.quantidade_estoque as number,
      buying_mode: "buy_it_now",
      listing_type_id: "gold_special",
      condition: "new",
      pictures: fotos.map((url) => ({ source: url })),
      attributes: [
        { id: "BRAND", value_name: "Fysi" },
        { id: "MODEL", value_name: pecaRow.referencia },
        { id: "GENDER", value_name: "Masculino" },
        { id: "MAIN_MATERIAL", value_name: materialPrincipal },
        { id: "PANT_TYPE", value_name: tipoCalca },
        { id: "COLOR", value_name: mapearCorML(cor) },
        { id: "SIZE", value_name: tamanho },
        { id: "SIZE_GRID_ID", value_name: GRID_ID_CALCAS_MASCULINO },
        { id: "SIZE_GRID_ROW_ID", value_name: gridRowId },
        { id: "SELLER_SKU", value_name: `${pecaRow.referencia}-${cor}-${tamanho}` },
      ],
      shipping: {
        mode: "me2",
        local_pick_up: false,
        free_shipping: false,
      },
    };

    const itemRes = await fetch("https://api.mercadolibre.com/items", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const itemData = await itemRes.json();

    if (!itemRes.ok) {
      await supabaseService.from("publicacoes_marketplace").upsert(
        {
          peca_id: pecaId,
          variacao_id: v.id as string,
          canal: "mercado_livre",
          status: "erro",
          erro_detalhe: JSON.stringify(itemData),
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: "variacao_id,canal" }
      );
      resultados.push({ variacaoId: v.id as string, cor, tamanho, ok: false, detalhe: itemData });
      continue;
    }

    const itemId = itemData.id as string;

    if (descricaoTexto.trim()) {
      await fetch(`https://api.mercadolibre.com/items/${itemId}/description`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plain_text: descricaoTexto.slice(0, 50000) }),
      }).catch(() => {
        // Não falha a publicação por causa da descrição — item já está no ar.
      });
    }

    await supabaseService.from("publicacoes_marketplace").upsert(
      {
        peca_id: pecaId,
        variacao_id: v.id as string,
        canal: "mercado_livre",
        item_id_externo: itemId,
        status: "publicado",
        erro_detalhe: null,
        publicado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "variacao_id,canal" }
    );

    resultados.push({ variacaoId: v.id as string, cor, tamanho, ok: true, itemId });
  }

  const todasOk = resultados.every((r) => r.ok);
  return { ok: todasOk, variacoes: resultados };
}
