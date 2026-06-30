"use client";

import React, { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import type { FaqItem } from "@/lib/types";

export default function FaqSection() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/faq")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data.filter((i: FaqItem) => i.ativo));
        }
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  // JSON-LD estruturado para GEO / AI Overviews / rich results do Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.resposta,
      },
    })),
  };

  return (
    <section className="bg-pearl py-16 px-4">
      {/* Schema.org FAQPage — lido por Google AI Overviews, Perplexity, ChatGPT etc. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-2xl mx-auto">
        {/* Título */}
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-gold mb-2">
            Dúvidas
          </p>
          <h2 className="font-serif text-3xl text-ink text-balance">
            Perguntas Frequentes
          </h2>
        </div>

        {/* Acordeão */}
        <div className="space-y-2">
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-lg border transition-colors ${
                  isOpen ? "border-ink/20 bg-white" : "border-ink/8 bg-white/60"
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-ink leading-snug">
                    {item.pergunta}
                  </span>
                  <span className="shrink-0 text-coal/40">
                    {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-coal/70 leading-relaxed">{item.resposta}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
