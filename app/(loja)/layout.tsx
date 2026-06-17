import React from "react";
import LojaHeader from "@/components/LojaHeader";
import LojaFooter from "@/components/LojaFooter";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-pearl text-ink font-sans">
      <LojaHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:px-6 md:py-12">
        {children}
      </main>
      <LojaFooter />
    </div>
  );
}
