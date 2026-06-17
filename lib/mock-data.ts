import type { Peca, Pedido } from "./types";

export const pecas: Peca[] = [
  {
    id: "peca-001",
    nome: "Vestido Linho Aura",
    referencia: "FYS-1001",
    descricao: "Vestido midi de linho misto com caimento leve e cintura marcada.",
    categoria: "Vestidos",
    preco: 329,
    fotos: ["/brand/perfil-1.png"],
    ativo: true,
    criadoEm: "2026-06-02T10:00:00.000Z",
    variacoes: [
      { id: "var-001", cor: "Areia", corHex: "#CDBEAE", tamanho: "P", quantidadeEstoque: 7 },
      { id: "var-002", cor: "Areia", corHex: "#CDBEAE", tamanho: "M", quantidadeEstoque: 4 },
      { id: "var-003", cor: "Preto", corHex: "#11100E", tamanho: "G", quantidadeEstoque: 3 }
    ]
  },
  {
    id: "peca-002",
    nome: "Blusa Cetim Noite",
    referencia: "FYS-1002",
    descricao: "Blusa em cetim opaco com gola fluida e acabamento premium.",
    categoria: "Blusas",
    preco: 189,
    fotos: ["/brand/perfil-2.png"],
    ativo: true,
    criadoEm: "2026-06-04T10:00:00.000Z",
    variacoes: [
      { id: "var-004", cor: "Champagne", corHex: "#E8DDD0", tamanho: "P", quantidadeEstoque: 9 },
      { id: "var-005", cor: "Champagne", corHex: "#E8DDD0", tamanho: "M", quantidadeEstoque: 6 },
      { id: "var-006", cor: "Moss", corHex: "#6D7B64", tamanho: "G", quantidadeEstoque: 2 }
    ]
  },
  {
    id: "peca-003",
    nome: "Calca Alfaiataria Essencial",
    referencia: "FYS-1003",
    descricao: "Calca reta de alfaiataria com prega frontal e bolso faca.",
    categoria: "Calcas",
    preco: 279,
    fotos: ["/brand/perfil-3.png"],
    ativo: true,
    criadoEm: "2026-06-05T10:00:00.000Z",
    variacoes: [
      { id: "var-007", cor: "Preto", corHex: "#11100E", tamanho: "P", quantidadeEstoque: 5 },
      { id: "var-008", cor: "Preto", corHex: "#11100E", tamanho: "M", quantidadeEstoque: 8 },
      { id: "var-009", cor: "Areia", corHex: "#CDBEAE", tamanho: "G", quantidadeEstoque: 1 }
    ]
  },
  {
    id: "peca-004",
    nome: "Saia Plissada Dourada",
    referencia: "FYS-1004",
    descricao: "Saia midi plissada com brilho discreto e movimento elegante.",
    categoria: "Saias",
    preco: 249,
    fotos: ["/brand/perfil-4.png"],
    ativo: true,
    criadoEm: "2026-06-06T10:00:00.000Z",
    variacoes: [
      { id: "var-010", cor: "Ouro", corHex: "#CCB72F", tamanho: "P", quantidadeEstoque: 3 },
      { id: "var-011", cor: "Ouro", corHex: "#CCB72F", tamanho: "M", quantidadeEstoque: 4 },
      { id: "var-012", cor: "Ouro", corHex: "#CCB72F", tamanho: "G", quantidadeEstoque: 0 }
    ]
  },
  {
    id: "peca-005",
    nome: "Conjunto Minimal Linen",
    referencia: "FYS-1005",
    descricao: "Conjunto coordenado de camisa e short em linho leve.",
    categoria: "Conjuntos",
    preco: 419,
    fotos: ["/brand/perfil-5.png"],
    ativo: true,
    criadoEm: "2026-06-07T10:00:00.000Z",
    variacoes: [
      { id: "var-013", cor: "Off white", corHex: "#F8F5EF", tamanho: "P", quantidadeEstoque: 6 },
      { id: "var-014", cor: "Off white", corHex: "#F8F5EF", tamanho: "M", quantidadeEstoque: 6 },
      { id: "var-015", cor: "Clay", corHex: "#B46D54", tamanho: "G", quantidadeEstoque: 2 }
    ]
  },
  {
    id: "peca-006",
    nome: "Macacao Studio Preto",
    referencia: "FYS-1006",
    descricao: "Macacao de modelagem ampla com faixa removivel.",
    categoria: "Macacoes",
    preco: 389,
    fotos: ["/brand/perfil-6.png"],
    ativo: true,
    criadoEm: "2026-06-08T10:00:00.000Z",
    variacoes: [
      { id: "var-016", cor: "Preto", corHex: "#11100E", tamanho: "P", quantidadeEstoque: 2 },
      { id: "var-017", cor: "Preto", corHex: "#11100E", tamanho: "M", quantidadeEstoque: 5 },
      { id: "var-018", cor: "Preto", corHex: "#11100E", tamanho: "G", quantidadeEstoque: 4 }
    ]
  }
];

export const pedidos: Pedido[] = [
  {
    id: "pedido-001",
    numero: 1204,
    cliente: { nome: "Marina Torres", telefone: "(11) 99912-4300", endereco: "Rua das Palmeiras, 82" },
    itens: [
      { pecaId: "peca-001", variacaoId: "var-002", nomePeca: "Vestido Linho Aura", cor: "Areia", tamanho: "M", quantidade: 1, precoUnitario: 329 },
      { pecaId: "peca-002", variacaoId: "var-004", nomePeca: "Blusa Cetim Noite", cor: "Champagne", tamanho: "P", quantidade: 1, precoUnitario: 189 }
    ],
    total: 518,
    status: "pendente",
    criadoEm: "2026-06-17T14:10:00.000Z"
  },
  {
    id: "pedido-002",
    numero: 1203,
    cliente: { nome: "Bianca Prado", telefone: "(21) 98871-9021" },
    itens: [{ pecaId: "peca-006", variacaoId: "var-017", nomePeca: "Macacao Studio Preto", cor: "Preto", tamanho: "M", quantidade: 1, precoUnitario: 389 }],
    total: 389,
    status: "aprovado",
    criadoEm: "2026-06-16T18:34:00.000Z",
    respondidoEm: "2026-06-16T19:02:00.000Z"
  },
  {
    id: "pedido-003",
    numero: 1202,
    cliente: { nome: "Clara Mendes", telefone: "(31) 97712-8080", endereco: "Av. Brasil, 244" },
    itens: [{ pecaId: "peca-004", variacaoId: "var-012", nomePeca: "Saia Plissada Dourada", cor: "Ouro", tamanho: "G", quantidade: 1, precoUnitario: 249 }],
    total: 249,
    status: "recusado",
    motivoRecusa: "Produto indisponivel no tamanho selecionado.",
    criadoEm: "2026-06-15T12:11:00.000Z",
    respondidoEm: "2026-06-15T12:40:00.000Z"
  }
];

export const categorias = ["Vestidos", "Blusas", "Calcas", "Saias", "Conjuntos", "Macacoes"];
