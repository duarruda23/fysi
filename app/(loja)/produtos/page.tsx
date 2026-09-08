import { getPecas } from "@/lib/data/pecas";
import ProdutosListClient from "./ProdutosListClient";

export default async function CatalogPage() {
  const pecas = await getPecas();
  return <ProdutosListClient pecasIniciais={pecas} />;
}
