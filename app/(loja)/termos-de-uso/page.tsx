import Link from "next/link";
import LojaHeader from "@/components/LojaHeader";
import LojaFooter from "@/components/LojaFooter";

export const metadata = {
  title: "Termos de Uso | Fysi",
  description: "Leia os Termos de Uso da plataforma Fysi antes de criar sua conta.",
};

export default function TermosDeUsoPage() {
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
              Termos de Uso
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
              Ao acessar ou usar a plataforma Fysi, você concorda com os presentes Termos de Uso.
              Leia-os com atenção. Se não concordar com algum ponto, pedimos que não utilize
              nossos serviços.
            </Intro>

            <Section title="1. Aceitação dos termos">
              <p>
                O uso da plataforma implica aceitação integral destes Termos. A Fysi reserva-se o
                direito de atualizá-los a qualquer momento, sendo responsabilidade do usuário
                verificar periodicamente eventuais mudanças.
              </p>
            </Section>

            <Section title="2. Cadastro e conta">
              <ul>
                <li>Você deve ter pelo menos 18 anos para criar uma conta;</li>
                <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas;</li>
                <li>Você é responsável pela segurança da sua senha e por todas as atividades realizadas com sua conta;</li>
                <li>A Fysi pode suspender ou encerrar contas que violem estes termos.</li>
              </ul>
            </Section>

            <Section title="3. Uso permitido">
              <p>A plataforma é destinada exclusivamente ao uso pessoal e comercial lícito. É proibido:</p>
              <ul>
                <li>Usar a plataforma para fins fraudulentos ou ilegais;</li>
                <li>Tentar acessar áreas restritas ou dados de outros usuários;</li>
                <li>Reproduzir, copiar ou redistribuir conteúdos sem autorização;</li>
                <li>Utilizar robôs, scripts ou meios automatizados para extrair dados.</li>
              </ul>
            </Section>

            <Section title="4. Compras e pagamentos">
              <ul>
                <li>Todos os preços são expressos em reais (R$) e incluem os impostos aplicáveis;</li>
                <li>O pedido é confirmado após a aprovação do pagamento;</li>
                <li>A Fysi reserva-se o direito de cancelar pedidos em caso de erro de preço ou estoque esgotado, com reembolso integral;</li>
                <li>Promoções e cupons têm validade e condições específicas indicadas em cada oferta.</li>
              </ul>
            </Section>

            <Section title="5. Cancelamento e devolução">
              <p>
                Você tem direito ao cancelamento da compra em até 7 (sete) dias corridos após o
                recebimento do produto, conforme o Código de Defesa do Consumidor (Lei nº 8.078/90).
                Para solicitar, acesse{" "}
                <Link href="/meus-pedidos" className="underline underline-offset-2">Meus Pedidos</Link>{" "}
                ou entre em contato pelo nosso suporte.
              </p>
            </Section>

            <Section title="6. Propriedade intelectual">
              <p>
                Todo o conteúdo da plataforma — incluindo marca, logotipo, imagens, textos e
                design — é de propriedade exclusiva da Fysi ou de seus licenciadores, protegido
                pelas leis de propriedade intelectual brasileiras e internacionais.
              </p>
            </Section>

            <Section title="7. Limitação de responsabilidade">
              <p>
                A Fysi não se responsabiliza por danos indiretos, incidentais ou consequentes
                decorrentes do uso da plataforma, incluindo perda de dados ou interrupções de
                serviço fora do nosso controle (força maior, falhas de terceiros).
              </p>
            </Section>

            <Section title="8. Lei aplicável e foro">
              <p>
                Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito
                o foro da comarca de domicílio do consumidor para dirimir eventuais disputas, nos
                termos do Código de Defesa do Consumidor.
              </p>
            </Section>

            <Section title="9. Contato">
              <p>
                Dúvidas sobre estes Termos? Entre em contato:{" "}
                <a href="mailto:contato@fysi.com.br" className="underline underline-offset-2">
                  contato@fysi.com.br
                </a>
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
      <div className="text-sm leading-relaxed text-[#11100e]/70 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}
