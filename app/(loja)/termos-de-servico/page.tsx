import Link from "next/link";
import LojaHeader from "@/components/LojaHeader";
import LojaFooter from "@/components/LojaFooter";

export const metadata = {
  title: "Termos de Serviço | Fysi",
  description: "Condições gerais do serviço oferecido pela plataforma Fysi.",
};

export default function TermosDeServicoPag() {
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
              Termos de Serviço
            </h1>
            <p className="mt-4 text-sm text-white/50">
              Última atualização: junho de 2025
            </p>
          </div>
        </section>

        {/* Conteúdo */}
        <section className="py-14 px-5">
          <div className="mx-auto max-w-3xl space-y-10 text-[#11100e]">

            <Intro>
              Os Termos de Serviço descrevem as condições sob as quais a Fysi presta seus serviços
              de plataforma de e-commerce, incluindo hospedagem do catálogo, processamento de
              pedidos, suporte ao cliente e funcionalidades relacionadas.
            </Intro>

            <Section title="1. Descrição do serviço">
              <p>
                A Fysi oferece uma plataforma de comércio eletrônico para venda de roupas e
                acessórios. Os serviços incluem:
              </p>
              <ul>
                <li>Catálogo de produtos com busca e filtros;</li>
                <li>Carrinho de compras e checkout seguro;</li>
                <li>Gestão de pedidos e histórico de compras;</li>
                <li>Área de conta do cliente com endereços e preferências;</li>
                <li>Comunicações transacionais por e-mail.</li>
              </ul>
            </Section>

            <Section title="2. Disponibilidade do serviço">
              <p>
                A Fysi empenha-se em manter a plataforma disponível 24 horas por dia, 7 dias
                por semana. No entanto, não garantimos disponibilidade ininterrupta — manutenções
                programadas ou eventos fora do nosso controle podem causar indisponibilidade
                temporária. Nesses casos, comunicaremos os usuários com antecedência sempre que
                possível.
              </p>
            </Section>

            <Section title="3. Processamento de pedidos">
              <ul>
                <li>Pedidos são processados após confirmação de pagamento;</li>
                <li>O prazo de despacho é informado em cada produto e pode variar conforme disponibilidade de estoque;</li>
                <li>Pedidos realizados em fins de semana ou feriados são processados no próximo dia útil;</li>
                <li>Nos reservamos o direito de recusar pedidos suspeitos de fraude.</li>
              </ul>
            </Section>

            <Section title="4. Entrega">
              <ul>
                <li>Os prazos de entrega são estimados e podem variar de acordo com a região e a transportadora;</li>
                <li>A Fysi não se responsabiliza por atrasos causados pelas transportadoras, desastres naturais ou situações de força maior;</li>
                <li>O rastreamento do pedido é disponibilizado assim que o despacho é realizado;</li>
                <li>Em caso de não recebimento, o cliente deve acionar o suporte em até 15 dias após a data prevista.</li>
              </ul>
            </Section>

            <Section title="5. Política de troca e reembolso">
              <p>
                Aceitamos troca ou devolução nos seguintes casos:
              </p>
              <ul>
                <li>Produto com defeito de fabricação;</li>
                <li>Produto diferente do pedido;</li>
                <li>Desistência da compra em até 7 dias após o recebimento (direito de arrependimento).</li>
              </ul>
              <p>
                O reembolso é processado em até 10 dias úteis após o recebimento e avaliação do
                produto devolvido, pelo mesmo meio de pagamento utilizado na compra.
              </p>
            </Section>

            <Section title="6. Suporte ao cliente">
              <p>
                Nosso suporte está disponível de segunda a sexta-feira, das 9h às 18h (horário de
                Brasília). Para atendimento, utilize os canais:
              </p>
              <ul>
                <li>
                  E-mail:{" "}
                  <a href="mailto:suporte@fysi.com.br" className="underline underline-offset-2">
                    suporte@fysi.com.br
                  </a>
                </li>
                <li>WhatsApp: disponível no rodapé da loja;</li>
                <li>Formulário na página de contato.</li>
              </ul>
            </Section>

            <Section title="7. Modificações no serviço">
              <p>
                A Fysi pode, a qualquer tempo, modificar, suspender ou descontinuar qualquer
                funcionalidade da plataforma, com ou sem aviso prévio, sem responsabilidade
                perante o usuário, exceto quando houver pedidos em andamento.
              </p>
            </Section>

            <Section title="8. Vigência">
              <p>
                Estes Termos entram em vigor na data indicada acima e permanecem válidos até que
                sejam substituídos por uma versão atualizada. O uso contínuo da plataforma após
                a publicação de alterações constitui aceitação dos novos termos.
              </p>
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
      <div className="text-sm leading-relaxed text-[#11100e]/70 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}
