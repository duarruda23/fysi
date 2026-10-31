import LeadForm from "./LeadForm"

const diferenciais = [
  { titulo: "Quem fabrica é quem vende", texto: "A Fysi fornece para grandes marcas há mais de 35 anos. Você compra direto de quem faz a calça." },
  { titulo: "Padrão de grande marca", texto: "Calça masculina de sarja com modelagem e acabamento que o seu cliente reconhece." },
  { titulo: "Atendimento direto", texto: "Você conversa com o time da fábrica, sem repasse no meio do caminho." },
]

const passos = [
  "Você preenche o formulário.",
  "O time da Fysi chama você no WhatsApp.",
  "Você conhece a linha e combina o pedido.",
]

// Troque por <Image> quando as imagens finais chegarem em /public/atacado (01-hero ... 06-embalagem).
function Foto({ rotulo, className = "" }: { rotulo: string; className?: string }) {
  return (
    <div role="img" aria-label={rotulo} className={`flex items-center justify-center bg-gradient-to-br from-coal to-ink ${className}`}>
      <img src="/brand/logo-ouro.png" alt="" width={64} height={64} className="h-16 w-auto opacity-40" />
    </div>
  )
}

export default function AtacadoPage() {
  return (
    <main className="min-h-screen bg-pearl font-sans text-ink">
      {/* Hero */}
      <section className="bg-ink text-pearl">
        <div className="mx-auto max-w-6xl px-5 pt-6 pb-10 md:grid md:grid-cols-2 md:items-center md:gap-14 md:py-16">
          <div>
            <img src="/brand/logo-horizontal-branco.png" alt="Fysi" width={110} height={30} className="h-7 w-auto" />
            <p className="mt-8 inline-block rounded-full border border-gold/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Apenas para lojistas
            </p>
            <h1 className="mt-4 font-serif text-[34px] font-semibold leading-[1.08] text-balance md:text-5xl">
              Calça masculina de sarja, direto da fábrica para a sua loja
            </h1>
            <p className="mt-4 text-base leading-relaxed text-pearl/75 text-pretty">
              A Fysi fabrica no padrão das grandes marcas e vende no atacado, sem intermediário. Preencha o formulário e o nosso time chama você no WhatsApp.
            </p>
            <Foto rotulo="Calças masculinas de sarja Fysi" className="mt-8 aspect-[4/3] w-full rounded-xl md:hidden" />
          </div>

          <div id="cadastro" className="relative mt-8 scroll-mt-4 rounded-2xl bg-pearl p-5 text-ink shadow-soft md:mt-0 md:p-7">
            <h2 className="font-serif text-2xl font-semibold">Seja um parceiro revendedor</h2>
            <p className="mb-4 mt-1 text-sm text-coal/70">Leva menos de um minuto.</p>
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <h2 className="font-serif text-3xl font-semibold text-balance md:text-4xl">Por que comprar da Fysi</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {diferenciais.map((d) => (
            <div key={d.titulo} className="rounded-xl border border-ink/10 bg-white p-5">
              <div className="mb-3 h-1.5 w-8 rounded-full bg-gold" />
              <h3 className="font-semibold">{d.titulo}</h3>
              <p className="mt-1 text-sm leading-relaxed text-coal/75">{d.texto}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Foto rotulo="Detalhe do tecido de sarja" className="aspect-square rounded-xl" />
          <Foto rotulo="Calça masculina de sarja dobrada" className="aspect-square rounded-xl" />
          <Foto rotulo="Embalagem Fysi para envio" className="hidden aspect-square rounded-xl md:flex" />
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-linen">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">Como funciona</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {passos.map((p, i) => (
              <li key={p} className="flex items-start gap-4 rounded-xl bg-pearl p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-gold">{i + 1}</span>
                <span className="pt-1.5 text-sm leading-relaxed">{p}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-coal/70">Esta página é só para quem tem loja. Não atendemos consumidor final por aqui.</p>
          <a href="#cadastro" className="mt-6 inline-flex h-12 items-center rounded-lg bg-ink px-7 text-sm font-semibold text-pearl transition-colors hover:bg-coal">
            Quero ser revendedor
          </a>
        </div>
      </section>

      <footer className="bg-ink px-5 py-8 text-center text-xs text-pearl/50">
        <p>Fysi Atacado · fysiatacado.com.br</p>
        <p className="mt-1">
          <a href="/politica-de-privacidade" className="underline underline-offset-2">Política de Privacidade</a>
        </p>
      </footer>
    </main>
  )
}
