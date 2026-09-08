import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calças Masculinas em Atacado | Catálogo Fysi",
  description:
    "Catálogo completo de calças masculinas em atacado e direto de fábrica. Filtre por tamanho, cor e modelo. Preço de fábrica pra revenda.",
};

export default function ProdutosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
