import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import ObrigadoTracker from "./ObrigadoTracker"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Recebemos seu cadastro | Fysi Atacado",
  robots: { index: false, follow: false },
}

const WHATSAPP_LINK = `https://wa.me/558192633090?text=${encodeURIComponent("Olá! Acabei de me cadastrar como revendedor no site da Fysi.")}`

export default function ObrigadoPage() {
  // Só chega aqui quem enviou o formulário com sucesso (cookie definido pela API).
  const eventId = cookies().get("atacado_lead")?.value
  if (!eventId) redirect("/atacado")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 py-14 text-center text-pearl">
      <ObrigadoTracker eventId={eventId} />
      <img src="/brand/logo-horizontal-branco.png" alt="Fysi" width={110} height={30} className="h-7 w-auto" />
      <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCB72F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <h1 className="mt-6 font-serif text-4xl font-semibold text-balance">Recebemos o seu cadastro</h1>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-pearl/75 text-pretty">
        O time da Fysi vai chamar você no WhatsApp. Se quiser adiantar a conversa, é só tocar no botão abaixo.
      </p>
      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
        className="mt-8 flex h-14 w-full max-w-sm items-center justify-center gap-3 rounded-xl bg-[#25D366] text-base font-semibold text-white transition-colors hover:bg-[#20c55d]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
        Falar com a Fysi no WhatsApp
      </a>
    </main>
  )
}
