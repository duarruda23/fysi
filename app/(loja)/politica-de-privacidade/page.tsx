import Link from "next/link";
import LojaHeader from "@/components/LojaHeader";
import LojaFooter from "@/components/LojaFooter";

export const metadata = {
  title: "Política de Privacidade | Fysi",
  description: "Saiba como a Fysi coleta, usa e protege seus dados pessoais.",
};

export default function PoliticaDePrivacidadePage() {
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
              Política de Privacidade
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
              A Fysi está comprometida com a proteção dos seus dados pessoais. Esta Política de
              Privacidade descreve como coletamos, usamos, armazenamos e protegemos as informações
              dos nossos clientes e visitantes, em conformidade com a Lei Geral de Proteção de Dados
              (LGPD — Lei nº 13.709/2018).
            </Intro>

            <Section title="1. Quais dados coletamos">
              <p>Ao criar uma conta ou realizar uma compra, podemos coletar:</p>
              <ul>
                <li>Nome completo e e-mail;</li>
                <li>Telefone e endereço de entrega;</li>
                <li>Dados de navegação (páginas visitadas, tempo de sessão);</li>
                <li>Informações do dispositivo e endereço IP;</li>
                <li>Histórico de pedidos e preferências de compra.</li>
              </ul>
              <p>
                Não armazenamos dados de cartão de crédito — pagamentos são processados por
                plataformas certificadas (PCI DSS).
              </p>
            </Section>

            <Section title="2. Como usamos seus dados">
              <ul>
                <li>Processar pedidos e gerenciar sua conta;</li>
                <li>Enviar atualizações sobre o status do pedido;</li>
                <li>Personalizar a experiência de compra;</li>
                <li>Enviar comunicações de marketing, se você autorizar;</li>
                <li>Cumprir obrigações legais e prevenir fraudes.</li>
              </ul>
            </Section>

            <Section title="3. Compartilhamento de dados">
              <p>
                Seus dados não são vendidos a terceiros. Podemos compartilhá-los apenas com:
              </p>
              <ul>
                <li>Transportadoras para entrega dos pedidos;</li>
                <li>Processadores de pagamento para concluir transações;</li>
                <li>Plataformas de análise de uso (de forma anonimizada);</li>
                <li>Autoridades competentes, quando exigido por lei.</li>
              </ul>
            </Section>

            <Section title="4. Seus direitos (LGPD)">
              <p>Você tem direito a:</p>
              <ul>
                <li>Acessar os dados que temos sobre você;</li>
                <li>Corrigir dados incompletos ou incorretos;</li>
                <li>Solicitar a exclusão dos seus dados;</li>
                <li>Revogar consentimento de marketing a qualquer momento;</li>
                <li>Solicitar a portabilidade dos dados.</li>
              </ul>
              <p>
                Para exercer seus direitos, entre em contato pelo e-mail{" "}
                <a href="mailto:privacidade@fysi.com.br" className="underline underline-offset-2">
                  privacidade@fysi.com.br
                </a>
                .
              </p>
            </Section>

            <Section title="5. Cookies">
              <p>
                Utilizamos cookies essenciais para o funcionamento da plataforma (sessão, carrinho)
                e cookies analíticos para entender o comportamento de navegação. Você pode
                desativar cookies analíticos nas configurações do seu navegador a qualquer momento.
              </p>
            </Section>

            <Section title="6. Segurança">
              <p>
                Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso
                não autorizado, perda ou destruição — incluindo criptografia de dados em trânsito
                (TLS) e armazenamento seguro em nuvem.
              </p>
            </Section>

            <Section title="7. Retenção de dados">
              <p>
                Mantemos seus dados enquanto sua conta estiver ativa ou pelo prazo necessário para
                cumprir obrigações legais. Após solicitação de exclusão, os dados são removidos em
                até 30 dias, salvo quando a retenção for exigida por lei.
              </p>
            </Section>

            <Section title="8. Alterações nesta política">
              <p>
                Esta política pode ser atualizada periodicamente. Notificaremos você por e-mail
                sobre mudanças significativas. A versão mais atual estará sempre disponível nesta
                página.
              </p>
            </Section>

            <div className="border-t border-[#11100e]/10 pt-8 flex flex-col sm:flex-row gap-4">
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
      <div className="text-sm leading-relaxed text-[#11100e]/70 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}
