// Tamanhos por letra
export const TAMANHOS_LETRA = ["PP", "P", "M", "G", "GG", "XG", "XGG"] as const;
// Tamanhos por numeração
export const TAMANHOS_NUMERO = ["26", "28", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60"] as const;

export type TamanhoLetra = typeof TAMANHOS_LETRA[number];
export type TamanhoNumero = typeof TAMANHOS_NUMERO[number];
export type Tamanho = TamanhoLetra | TamanhoNumero | string;

export interface VariacaoPeca {
  id: string;
  cor: string;
  corHex?: string;
  tamanho: Tamanho;
  quantidadeEstoque: number;
}

export interface Peca {
  id: string;
  nome: string;
  referencia: string;
  descricao: string;
  categoria: string;
  preco: number;
  fotos: string[];
  variacoes: VariacaoPeca[];
  ativo: boolean;
  criadoEm: string;
  // Conteúdo editável da página do produto
  bullets?: string[];
  detalheTexto?: string;
  envioTexto?: string;
  devolucoesTexto?: string;
  videoYoutube?: string;
}

export type StatusPedido = "pendente" | "aprovado" | "recusado";

export interface ItemPedido {
  pecaId: string;
  variacaoId: string;
  nomePeca: string;
  cor: string;
  tamanho: Tamanho;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: string;
  numero: number;
  cliente: {
    nome: string;
    email?: string;
    telefone: string;
    endereco?: string;
    clienteId?: string;
  };
  itens: ItemPedido[];
  total: number;
  status: StatusPedido;
  motivoRecusa?: string;
  criadoEm: string;
  respondidoEm?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  criadoEm: string;
}

export interface Promocao {
  id: string;
  nome: string;
  cupom?: string; // Optional coupon code
  descontoPercentual: number; // e.g. 15 for 15% off
  ativo: boolean;
  categoriaAlvo?: string; // Optional target category to apply automatically
  criadoEm: string;
}

export interface InscricaoVIP {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  pecaId: string;
  pecaNome: string;
  variacaoId: string;
  cor: string;
  tamanho: Tamanho;
  criadoEm: string;
  notificado: boolean;
}

export interface ConfiguracoesLoja {
  googleAnalyticsId: string;
  metaPixelId: string;
  googleAdsId: string;
  tiktokPixelId: string;
  tiktokApiToken: string;
  minimoPecasAtacado: number;
  valorMinimoAtacado: number;
}

export interface Banner {
  id: string;
  titulo: string;
  subtitulo: string;
  eyebrow: string;
  botaoTexto: string;
  botaoLink: string;
  imagemUrl: string;
  ativo: boolean;
  ordem: number;
  criadoEm: string;
  // Campos editoriais
  watermarkTexto?: string;     // texto gigante semi-transparente ao fundo
  layoutPos?: "esquerda" | "direita"; // onde o bloco de texto fica
}

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
  ativo: boolean;
  criado_em: string;
}

export interface Avaliacao {
  id: string;
  pecaId: string;
  autorNome: string;
  nota: number; // 1–5
  comentario: string;
  aprovado: boolean;
  criadoEm: string;
}

export type WebhookGatilho =
  | "novo_pedido"
  | "atualizacao_pedido"
  | "carrinho_abandonado"
  | "saiu_para_entrega"
  | "pedido_entregue"
  | "realizar_pagamento"
  | "pagamento_efetuado"
  | "pedido_sendo_separado"
  | "pedido_enviado";

export interface Webhook {
  id: string;
  nome: string;
  url: string;
  gatilhos: WebhookGatilho[];
  ativo: boolean;
  criadoEm: string;
}
