export type Tamanho = "PP" | "P" | "M" | "G" | "GG" | "XG";

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
