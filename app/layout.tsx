import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  title: "Fysi - Loja & Painel Admin",
  description: "Sistema de ecommerce e gestão Fysi."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${cormorant.variable}`}>
        <StoreProvider>
          <AnalyticsScripts />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}


