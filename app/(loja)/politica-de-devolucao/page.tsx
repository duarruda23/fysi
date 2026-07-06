import Link from "next/link";
import LojaHeader from "@/components/LojaHeader";
import LojaFooter from "@/components/LojaFooter";

export const metadata = {
  title: "Política de Devolução | Fysi",
  description: "Saiba como funciona o processo de troca e devolução de produtos Fysi Atacado.",
};

export default function PoliticaDeDevolucaoPage() {
  return (
    <>
      <LojaHeader />
      <main className="min-h-screen bg-[#f8f5ef]">
        {/* Hero */}
        <section className="border-b border-[#11100e]/8 bg-[#11100e] py-16 px-5">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#ccb72f] mb-3">
              Fysi
            </p>
            <h1
              className="text-4xl md:text-5xl font-semibold text-white leading-tight"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Política de Devolução
            </h1>
            <p className="mt-4 text-sm text-white/50">
              Última atualização: julho de 2026
            </p>
          </div>
        </section>

        {/* Conteúdo */}
        <section className="py-14 px-5">
          <div className="mx-auto max-w-3xl space-y-10 text-[#11100e]">

            <Intro>
              Na Fysi, trabalhamos com rigoroso controle de qualidade em cada peça. Caso você
              receba um produto com defeito de fabricação ou divergente do pedido, estamos prontos
              para resolver. Leia abaixo as condições do nosso processo de troca e devolução.
            </Intro>

            <Section title="1. Prazo para solicitação">
              <p>
                A solicitação de troca ou devolução deve ser feita em até <strong>7 (sete) dias
                corridos</strong> a contar da data de recebimento do produto, conforme previsto
                no Código de Defesa do Consumidor (Lei nº 8.078/1990).
              </p>
              <p>
                Para produtos com defeito de fabricação identificado após o uso, o prazo é de até
                <strong> 90 (noventa) dias</strong> a partir do recebimento.
              </p>
            </Section>

            <Section title="2. Condições aceitas para devolução">
              <p>Aceitamos devoluções e trocas quando:</p>
              <ul>
                <li>O produto apresentar defeito de fabricação comprovado;</li>
                <li>O item recebido for diferente do descrito ou do pedido realizado;</li>
                <li>O produto chegar com embalagem danificada causada pelo transporte;</li>
                <li>O produto estiver com etiqueta original, sem uso e sem lavagem.</li>
              </ul>
              <p>
                <strong>Não aceitamos</strong> devoluções por arrependimento de cor, tamanho ou
                modelo escolhido pelo comprador — exceto nos casos previstos pelo direito de
                arrependimento de compras online (art. 49 do CDC), aplicável a compras realizadas
                fora do estabelecimento comercial.
              </p>
            </Section>

            <Section title="3. Como solicitar">
              <p>Para abrir uma solicitação de troca ou devolução:</p>
              <ul>
                <li>
                  Entre em contato pelo WhatsApp ou e-mail informando o número do pedido e o
                  motivo da solicitação;
                </li>
                <li>Envie fotos do produto mostrando o defeito ou divergência;</li>
                <li>
                  Aguarde nossa confirmação — respondemos em até <strong>2 dias úteis</strong>;
                </li>
                <li>
                  Após aprovação, envie o produto com postagem no prazo informado pela nossa equipe.
                </li>
              </ul>
            </Section>

            <Section title="4. Frete de devolução">
              <p>
                Quando a devolução for motivada por <strong>defeito de fabricação ou erro nosso
                </strong>, o frete de retorno é por nossa conta — enviaremos uma etiqueta de
                postagem pré-paga.
              </p>
              <p>
                Nos demais casos cobertos pela política (arrependimento no prazo legal), o frete
                de devolução é de responsabilidade do comprador.
              </p>
            </Section>

            <Section title="5. Reembolso ou troca">
              <p>Após recebermos e analisarmos o produto devolvido, você pode optar por:</p>
              <ul>
                <li>
                  <strong>Troca:</strong> envio de um novo produto equivalente ou de valor igual,
                  sujeito à disponibilidade em estoque;
                </li>
                <li>
                  <strong>Crédito na loja:</strong> valor integral disponível para uso em nova
                  compra;
                </li>
                <li>
                  <strong>Reembolso:</strong> estorno do valor pago no mesmo meio de pagamento
                  utilizado, em até <strong>10 dias úteis</strong> após a aprovação.
                </li>
              </ul>
            </Section>

            <Section title="6. Produtos não elegíveis para devolução">
              <ul>
                <li>Produtos com sinais de uso, lavagem ou alterações;</li>
                <li>Itens sem etiqueta original ou embalagem danificada pelo comprador;</li>
                <li>Compras realizadas em liquidação ou com desconto acima de 50%, salvo defeito comprovado;</li>
                <li>Solicitações fora do prazo estabelecido nesta política.</li>
              </ul>
            </Section>

            <Section title="7. Contato">
              <p>
                Para dúvidas ou para iniciar uma solicitação, entre em contato com nossa equipe:
              </p>
              <ul>
                <li>
                  <strong>WhatsApp:</strong>{" "}
                  <a
                    href="https://wa.me/5511999999999"
                    className="underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (11) 99999-9999
                  </a>
                </li>
                <li>
                  <strong>E-mail:</strong>{" "}
                  <a href="mailto:contato@fysi.com.br" className="underline underline-offset-2">
                    contato@fysi.com.br
                  </a>
                </li>
              </ul>
              <p>Atendemos de segunda a sexta, das 9h às 18h.</p>
            </Section>

            <div className="border-t border-[#11100e]/10 pt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/politica-de-privacidade"
                className="text-sm font-medium underline underline-offset-4 text-[#11100e]/60 hover:text-[#11100e] transition-colors"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/termos-de-uso"
                className="text-sm font-medium underline underline-offset-4 text-[#11100e]/60 hover:text-[#11100e] transition-colors"
              >
                Termos de Uso
              </Link>
              <Link
                href="/termos-de-servico"
                className="text-sm font-medium underline underline-offset-4 text-[#11100e]/60 hover:text-[#11100e] transition-colors"
              >
                Termos de Serviço
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LojaFooter />
    </>
  );
}

function Intro({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base leading-relaxed text-[#11100e]/70 border-l-2 border-[#ccb72f] pl-4">
      {children}
    </p>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2
        className="text-xl font-semibold text-[#11100e]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-[#11100e]/70 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-[#11100e]">
        {children}
      </div>
    </div>
  );
}
