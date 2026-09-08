import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPecaById } from "@/lib/data/pecas";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const peca = await getPecaById(params.id);

  if (!peca || !peca.ativo) {
    return {
      title: "Produto não encontrado | Fysi Atacado",
      description: "Este produto não existe ou não está mais disponível no catálogo da Fysi.",
    };
  }

  const description =
    peca.descricao.length > 155 ? `${peca.descricao.slice(0, 152)}...` : peca.descricao;

  return {
    title: `${peca.nome} | Fysi Atacado`,
    description,
    openGraph: {
      title: peca.nome,
      description,
      images: peca.fotos[0] ? [{ url: peca.fotos[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const peca = await getPecaById(params.id);

  if (!peca || !peca.ativo) {
    notFound();
  }

  const avaliacaoJsonLd =
    peca.fotos.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: peca.nome,
          description: peca.descricao,
          image: peca.fotos,
          sku: peca.referencia,
          category: peca.categoria,
          offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: peca.preco.toFixed(2),
            availability: peca.variacoes.some((v) => v.quantidadeEstoque > 0)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: `https://www.fysiatacado.com.br/produtos/${peca.id}`,
          },
        }
      : null;

  return (
    <>
      {avaliacaoJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(avaliacaoJsonLd) }}
        />
      )}
      <ProductDetailClient pecaInicial={peca} />
    </>
  );
}
