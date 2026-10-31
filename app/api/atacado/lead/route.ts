import { NextResponse } from "next/server"
import { validateLead, UTM_KEYS } from "@/lib/atacado"

export const dynamic = "force-dynamic"

const COOKIE = "atacado_lead"

function str(v: unknown, max = 300): string {
  return typeof v === "string" ? v.trim().slice(0, max) : ""
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 })
  }

  // Campo-isca: robô preenche, pessoa não vê. Responde ok sem registrar.
  if (str(body.empresa_site)) return NextResponse.json({ ok: true })

  const { errors, clean } = validateLead({
    nome: str(body.nome),
    whatsapp: str(body.whatsapp),
    email: str(body.email),
    cidade: str(body.cidade),
    uf: str(body.uf, 2),
    instagram: str(body.instagram),
  })
  if (!clean) return NextResponse.json({ error: "Confira os campos.", fields: errors }, { status: 400 })
  if (body.consentimento !== true) {
    return NextResponse.json({ error: "Confirme o consentimento para continuarmos." }, { status: 400 })
  }

  const eventId = crypto.randomUUID()
  const utm: Record<string, string> = {}
  for (const k of UTM_KEYS) utm[k] = str(body[k], 200)

  // Nomes exatos que a automação do n8n espera. `teste` vai como "sim" nos testes.
  const lead = {
    enviado_em: new Date().toISOString(),
    nome: clean.nome,
    whatsapp: clean.whatsapp,
    email: clean.email,
    cidade_uf: clean.cidade_uf,
    instagram: clean.instagram,
    ...utm,
    fbclid: str(body.fbclid, 300),
    fbp: str(body.fbp, 200),
    fbc: str(body.fbc, 300),
    pagina: str(body.pagina, 500) || "/atacado",
    teste: body.teste === true ? "sim" : "",
  }

  // O lead nunca se perde: se o webhook falhar ou não estiver configurado, o JSON completo vai para o log
  // do servidor (Vercel Logs) e a pessoa segue para o obrigado normalmente.
  const webhook = process.env.LEAD_WEBHOOK_URL
  if (!webhook) {
    console.error("[atacado-lead] LEAD_WEBHOOK_URL ausente. Lead guardado só no log:", JSON.stringify(lead))
  } else {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) console.error(`[atacado-lead] webhook respondeu ${res.status}. Lead:`, JSON.stringify(lead))
    } catch (err) {
      console.error("[atacado-lead] falha no webhook:", err instanceof Error ? err.message : err, "Lead:", JSON.stringify(lead))
    }
  }

  const res = NextResponse.json({ ok: true, event_id: eventId })
  // Libera a página de obrigado só para quem acabou de enviar.
  res.cookies.set(COOKIE, eventId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/atacado",
    maxAge: 60 * 30,
  })
  return res
}
