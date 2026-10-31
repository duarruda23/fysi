// Rastreio da captura de atacado. O Pixel é carregado pelo AnalyticsScripts (ID vem de configuracoes_loja),
// então os eventos esperam o fbq existir antes de disparar.
import { UTM_KEYS } from "@/lib/atacado"

const ATTR_KEY = "atacado_attr"

export type Atribuicao = Partial<Record<(typeof UTM_KEYS)[number] | "fbclid", string>> & { teste?: boolean }

export function whenFbq(cb: (fbq: (...args: any[]) => void) => void) {
  if (typeof window === "undefined") return
  let tries = 0
  const t = window.setInterval(() => {
    if (window.fbq) {
      window.clearInterval(t)
      cb(window.fbq)
    } else if (++tries > 50) {
      window.clearInterval(t)
    }
  }, 200)
}

/** Guarda UTMs/fbclid da URL (a URL nova vence) para sobreviver a reload e ao envio do formulário. */
export function captureAtribuicao(): Atribuicao {
  if (typeof window === "undefined") return {}
  const params = new URLSearchParams(window.location.search)
  let saved: Atribuicao = {}
  try {
    saved = JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}")
  } catch {}
  const next: Atribuicao = { ...saved }
  for (const key of [...UTM_KEYS, "fbclid"] as const) {
    const v = params.get(key)?.trim()
    if (v) next[key] = v.slice(0, 200)
  }
  if (params.get("teste") === "1") next.teste = true
  try {
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(next))
  } catch {}
  return next
}

function cookie(name: string): string {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : ""
}

export function readFbCookies(fbclid?: string): { fbp: string; fbc: string } {
  const fbp = cookie("_fbp")
  let fbc = cookie("_fbc")
  if (!fbc && fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`
  return { fbp, fbc }
}

export function trackViewContentAtacado() {
  whenFbq((fbq) => fbq("track", "ViewContent", { content_name: "Captura atacado", content_category: "atacado" }))
}

/** Lead na página de obrigado. eventID único (o mesmo ficará disponível para a Conversions API). */
export function trackLeadAtacado(eventId: string) {
  const flag = `atacado_lead_${eventId}`
  try {
    if (sessionStorage.getItem(flag)) return
    sessionStorage.setItem(flag, "1")
  } catch {}
  whenFbq((fbq) => fbq("track", "Lead", { content_name: "Captura atacado", content_category: "atacado" }, { eventID: eventId }))
  window.gtag?.("event", "generate_lead", { source: "atacado" })
  window.ttq?.track("SubmitForm", { content_name: "Captura atacado" })
}
