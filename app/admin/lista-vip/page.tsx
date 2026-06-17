"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Trash2, Phone, Calendar, Star, CheckCircle, Clock } from "lucide-react";

export default function AdminListaVipPage() {
  const { listaVip, toggleNotificadoVip, deleteVip } = useStore();

  const getWhatsAppLink = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    // Default country code to 55 if not specified (Brazil)
    const formatted = digits.length <= 11 ? `55${digits}` : digits;
    return `https://wa.me/${formatted}`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold">Espera</p>
        <h1 className="font-serif text-3xl font-bold leading-tight text-ink md:text-4xl">Lista VIP (Aviso de Estoque)</h1>
        <p className="text-sm text-coal/60">Acompanhe os clientes interessados em peças que esgotaram e notifique-os no WhatsApp quando o estoque for reposto</p>
      </div>

      {/* List Panel */}
      <div className="bg-white rounded-xl border border-ink/10 shadow-line overflow-hidden">
        <div className="p-5 border-b border-ink/10 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
            <Star size={18} className="fill-gold text-gold" /> Inscrições Recebidas
          </h3>
          <span className="text-xs uppercase font-sans font-bold bg-pearl px-3 py-1 rounded-full border border-ink/10">
            Total: {listaVip.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-pearl/40 text-[10px] font-bold uppercase tracking-wider text-coal/65">
                <th className="py-3.5 px-5">Cliente</th>
                <th className="py-3.5 px-4">Peça Interessada</th>
                <th className="py-3.5 px-4">Variação</th>
                <th className="py-3.5 px-4">Data Registro</th>
                <th className="py-3.5 px-4 text-center">Contato</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {listaVip.length > 0 ? (
                listaVip.map((item) => (
                  <tr key={item.id} className="hover:bg-pearl/20 transition-colors">
                    {/* Cliente */}
                    <td className="py-4 px-5 font-bold text-ink">
                      {item.clienteNome}
                    </td>

                    {/* Peça */}
                    <td className="py-4 px-4 text-ink font-semibold">
                      {item.pecaNome}
                    </td>

                    {/* Variação */}
                    <td className="py-4 px-4 text-coal/75">
                      <span className="inline-flex gap-1.5 text-xs">
                        <span>Cor: <strong className="text-ink">{item.cor}</strong></span>
                        <span className="text-ink/10">|</span>
                        <span>Tam: <strong className="text-ink">{item.tamanho}</strong></span>
                      </span>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-4 text-xs font-semibold text-coal/40">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{new Date(item.criadoEm).toLocaleDateString("pt-BR")} às {new Date(item.criadoEm).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"})}</span>
                      </div>
                    </td>

                    {/* WhatsApp */}
                    <td className="py-4 px-4 text-center">
                      <a
                        href={getWhatsAppLink(item.clienteTelefone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        title={`Enviar mensagem para ${item.clienteTelefone}`}
                      >
                        <Phone size={12} />
                        <span>Chamar</span>
                      </a>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleNotificadoVip(item.id)}
                        className={`inline-flex items-center gap-1 h-7 px-3 rounded-full text-xs font-bold transition-all border ${
                          item.notificado
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-amber-50 border-amber-200 text-amber-800 animate-pulse"
                        }`}
                      >
                        {item.notificado ? (
                          <>
                            <CheckCircle size={11} />
                            <span>Notificado</span>
                          </>
                        ) : (
                          <>
                            <Clock size={11} />
                            <span>Pendente</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remover inscrição de "${item.clienteNome}"?`)) {
                            deleteVip(item.id);
                          }
                        }}
                        className="p-2 text-coal/40 hover:text-clay hover:bg-clay/5 rounded transition-all active:scale-95"
                        title="Excluir Registro"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-coal/40 text-sm">
                    Nenhum cliente cadastrado na Lista VIP no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
