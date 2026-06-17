import { createClient } from "@/lib/supabase/server";
import type { WebhookGatilho } from "@/lib/types";

interface WebhookPayload {
  gatilho: WebhookGatilho;
  timestamp: string;
  dados: Record<string, unknown>;
}

export async function dispatchWebhook(
  gatilho: WebhookGatilho,
  dados: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("url, gatilhos")
      .eq("ativo", true);

    if (!webhooks || webhooks.length === 0) return;

    const payload: WebhookPayload = {
      gatilho,
      timestamp: new Date().toISOString(),
      dados,
    };

    const targets = webhooks.filter((wh) =>
      (wh.gatilhos as string[]).includes(gatilho)
    );

    await Promise.allSettled(
      targets.map((wh) =>
        fetch(wh.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Fysi-Event": gatilho,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000),
        })
      )
    );
  } catch {
    // Fire-and-forget — falhas silenciosas para não impactar o fluxo principal
  }
}
