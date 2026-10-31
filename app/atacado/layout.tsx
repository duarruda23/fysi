import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Seja um parceiro revendedor | Fysi Atacado",
  description: "Calça masculina de sarja direto da fábrica, no atacado, para lojistas. Preencha o formulário e fale com o time da Fysi.",
  robots: { index: false, follow: false },
}

export default function AtacadoLayout({ children }: { children: React.ReactNode }) {
  return children
}
