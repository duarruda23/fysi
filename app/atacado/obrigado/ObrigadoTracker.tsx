"use client"

import { useEffect } from "react"
import { trackLeadAtacado } from "@/lib/atacado-tracking"

export default function ObrigadoTracker({ eventId }: { eventId: string }) {
  useEffect(() => {
    trackLeadAtacado(eventId)
  }, [eventId])
  return null
}
