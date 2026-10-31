"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UFS, UTM_KEYS, formatWhatsapp, validateLead, type LeadErrors } from "@/lib/atacado"
import { captureAtribuicao, readFbCookies, trackViewContentAtacado } from "@/lib/atacado-tracking"

const campo =
  "w-full h-12 px-4 rounded-lg border bg-white text-ink placeholder:text-coal/40 text-[15px] outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30"

export default function LeadForm() {
  const router = useRouter()
  const [v, setV] = useState({ nome: "", whatsapp: "", email: "", cidade: "", uf: "", instagram: "" })
  const [consent, setConsent] = useState(false)
  const [isca, setIsca] = useState("")
  const [errors, setErrors] = useState<LeadErrors>({})
  const [status, setStatus] = useState<"idle" | "loading">("idle")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    captureAtribuicao()
    trackViewContentAtacado()
  }, [])

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((s) => ({ ...s, [k]: k === "whatsapp" ? formatWhatsapp(e.target.value) : e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "loading") return
    setMsg("")
    const { errors: errs } = validateLead(v)
    if (!consent) errs.consentimento = "Marque a caixa para continuarmos."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setStatus("loading")
    const attr = captureAtribuicao()
    const { fbp, fbc } = readFbCookies(attr.fbclid)
    const utm = Object.fromEntries(UTM_KEYS.map((k) => [k, attr[k] ?? ""]))
    try {
      const res = await fetch("/api/atacado/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          ...utm,
          fbclid: attr.fbclid ?? "",
          fbp,
          fbc,
          pagina: window.location.pathname,
          consentimento: true,
          teste: attr.teste === true,
          empresa_site: isca,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.fields) setErrors(data.fields)
        setMsg(data.error || "Não conseguimos enviar agora. Tente de novo em instantes.")
        setStatus("idle")
        return
      }
      router.push("/atacado/obrigado")
    } catch {
      setMsg("Sem conexão no momento. Confira a internet e tente de novo.")
      setStatus("idle")
    }
  }

  const erro = (k: keyof LeadErrors) =>
    errors[k] ? <p id={`erro-${k}`} className="mt-1 text-xs text-clay">{errors[k]}</p> : null
  const borda = (k: keyof LeadErrors) => (errors[k] ? "border-clay" : "border-ink/15")

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3" aria-label="Formulário de cadastro de revendedor">
      <div>
        <label htmlFor="nome" className="sr-only">Nome</label>
        <input id="nome" name="nome" autoComplete="name" placeholder="Nome e sobrenome" value={v.nome} onChange={set("nome")}
          aria-invalid={!!errors.nome} aria-describedby={errors.nome ? "erro-nome" : undefined} className={`${campo} ${borda("nome")}`} />
        {erro("nome")}
      </div>
      <div>
        <label htmlFor="whatsapp" className="sr-only">WhatsApp</label>
        <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="WhatsApp com DDD"
          value={v.whatsapp} onChange={set("whatsapp")} aria-invalid={!!errors.whatsapp}
          aria-describedby={errors.whatsapp ? "erro-whatsapp" : undefined} className={`${campo} ${borda("whatsapp")}`} />
        {erro("whatsapp")}
      </div>
      <div>
        <label htmlFor="email" className="sr-only">E-mail</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="Seu melhor e-mail"
          value={v.email} onChange={set("email")} aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "erro-email" : undefined} className={`${campo} ${borda("email")}`} />
        {erro("email")}
      </div>
      <div className="grid grid-cols-[1fr_96px] gap-3">
        <div>
          <label htmlFor="cidade" className="sr-only">Cidade</label>
          <input id="cidade" name="cidade" autoComplete="address-level2" placeholder="Cidade" value={v.cidade} onChange={set("cidade")}
            aria-invalid={!!errors.cidade} aria-describedby={errors.cidade ? "erro-cidade" : undefined} className={`${campo} ${borda("cidade")}`} />
          {erro("cidade")}
        </div>
        <div>
          <label htmlFor="uf" className="sr-only">Estado</label>
          <select id="uf" name="uf" autoComplete="address-level1" value={v.uf} onChange={set("uf")} aria-invalid={!!errors.uf}
            aria-describedby={errors.uf ? "erro-uf" : undefined} className={`${campo} ${borda("uf")} ${v.uf ? "" : "text-coal/40"}`}>
            <option value="">UF</option>
            {UFS.map((u) => <option key={u} value={u} className="text-ink">{u}</option>)}
          </select>
          {erro("uf")}
        </div>
      </div>
      <div>
        <label htmlFor="instagram" className="sr-only">Instagram da sua loja</label>
        <input id="instagram" name="instagram" autoCapitalize="none" autoCorrect="off" placeholder="Instagram da sua loja (@ ou link)"
          value={v.instagram} onChange={set("instagram")} aria-invalid={!!errors.instagram}
          aria-describedby={errors.instagram ? "erro-instagram" : undefined} className={`${campo} ${borda("instagram")}`} />
        {erro("instagram")}
      </div>

      {/* Campo-isca para robôs: fora da tela e fora da navegação por teclado */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="empresa_site">Site da empresa</label>
        <input id="empresa_site" name="empresa_site" tabIndex={-1} autoComplete="off" value={isca} onChange={(e) => setIsca(e.target.value)} />
      </div>

      <label className="flex items-start gap-3 pt-1 text-xs leading-relaxed text-coal/80 cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#CCB72F]" aria-describedby={errors.consentimento ? "erro-consentimento" : undefined} />
        <span>
          Concordo em receber contato da Fysi por WhatsApp e e-mail e com o uso dos meus dados para esse atendimento, como descrito na{" "}
          <a href="/politica-de-privacidade" target="_blank" rel="noopener" className="underline underline-offset-2">Política de Privacidade</a>.
        </span>
      </label>
      {erro("consentimento")}

      {msg && <p role="alert" className="text-sm text-clay">{msg}</p>}

      <button type="submit" disabled={status === "loading"}
        className="w-full h-14 rounded-lg bg-ink text-pearl font-semibold text-base tracking-wide hover:bg-coal active:bg-coal disabled:opacity-60 transition-colors">
        {status === "loading" ? "Enviando..." : "Quero ser revendedor"}
      </button>
    </form>
  )
}
