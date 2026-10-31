// Regras compartilhadas da captura de atacado (/atacado): validação e normalização usadas
// no navegador (feedback imediato) e no servidor (fonte da verdade).

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const

export function formatWhatsapp(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Devolve +55DDDNÚMERO ou null. Aceita fixo (10 dígitos) e celular (11, começando em 9). */
export function normalizeWhatsapp(value: string): string | null {
  let d = value.replace(/\D/g, "")
  if (d.startsWith("55") && d.length > 11) d = d.slice(2)
  if (d.length !== 10 && d.length !== 11) return null
  const ddd = Number(d.slice(0, 2))
  if (ddd < 11 || ddd > 99) return null
  if (d.length === 11 && d[2] !== "9") return null
  return `+55${d}`
}

/** Aceita @loja, loja, instagram.com/loja/?igsh=... ou link completo. Devolve @loja ou null. */
export function normalizeInstagram(value: string): string | null {
  let v = value.trim()
  if (!v) return null
  v = v.replace(/^https?:\/\//i, "").replace(/^www\./i, "")
  if (/^instagram\.com\//i.test(v)) v = v.replace(/^instagram\.com\//i, "")
  v = v.split(/[/?#]/)[0].replace(/^@/, "")
  if (!/^[A-Za-z0-9._]{1,30}$/.test(v)) return null
  return `@${v.toLowerCase()}`
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

export function isUf(value: string): boolean {
  return (UFS as readonly string[]).includes(value)
}

export type LeadInput = {
  nome: string
  whatsapp: string
  email: string
  cidade: string
  uf: string
  instagram: string
}

export type LeadErrors = Partial<Record<keyof LeadInput | "consentimento", string>>

export function validateLead(input: LeadInput): { errors: LeadErrors; clean?: { nome: string; whatsapp: string; email: string; cidade_uf: string; instagram: string } } {
  const errors: LeadErrors = {}
  const nome = input.nome.trim().replace(/\s+/g, " ")
  const cidade = input.cidade.trim().replace(/\s+/g, " ")
  const whatsapp = normalizeWhatsapp(input.whatsapp)
  const instagram = normalizeInstagram(input.instagram)

  if (nome.length < 3 || !nome.includes(" ")) errors.nome = "Informe nome e sobrenome."
  if (!whatsapp) errors.whatsapp = "Digite um WhatsApp válido, com DDD."
  if (!isEmail(input.email)) errors.email = "Digite um e-mail válido."
  if (cidade.length < 2) errors.cidade = "Informe a cidade."
  if (!isUf(input.uf)) errors.uf = "Escolha o estado."
  if (!instagram) errors.instagram = "Informe o @ ou o link do Instagram da loja."

  if (Object.keys(errors).length > 0) return { errors }
  return {
    errors,
    clean: {
      nome,
      whatsapp: whatsapp as string,
      email: input.email.trim().toLowerCase(),
      cidade_uf: `${cidade}/${input.uf}`,
      instagram: instagram as string,
    },
  }
}
