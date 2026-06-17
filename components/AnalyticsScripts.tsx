"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export default function AnalyticsScripts() {
  const { configuracoes } = useStore();
  const pathname = usePathname();

  const gaId = configuracoes.googleAnalyticsId;
  const pixelId = configuracoes.metaPixelId;
  const adsId = configuracoes.googleAdsId;

  // Initialize and Track PageView
  useEffect(() => {
    // 1. Google Analytics
    if (gaId && typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };
      }
      window.gtag("js", new Date());
      window.gtag("config", gaId, {
        page_path: pathname,
      });
    }

    // 2. Google Ads config linking
    if (adsId && gaId && typeof window !== "undefined") {
      window.gtag?.("config", adsId, {
        page_path: pathname,
      });
    }

    // 3. Meta Pixel tracking PageView on route change
    if (pixelId && typeof window !== "undefined") {
      if (window.fbq) {
        window.fbq("track", "PageView");
      }
    }
  }, [pathname, gaId, pixelId, adsId]);

  return (
    <>
      {/* Google Analytics Script */}
      {gaId && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
      )}

      {/* Meta Pixel Script */}
      {pixelId && (
        <Script
          id="meta-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </>
  );
}

// Global Event Tracking helper functions
export const trackAddToCartEvent = (item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
}) => {
  if (typeof window === "undefined") return;

  // Google Analytics AddToCart event
  if (window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "BRL",
      value: item.price * item.quantity,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_variant: `${item.color} - ${item.size}`,
        },
      ],
    });
  }

  // Meta Pixel AddToCart event
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_name: item.name,
      content_ids: [item.id],
      content_type: "product",
      value: item.price * item.quantity,
      currency: "BRL",
    });
  }
};

export const trackInitiateCheckoutEvent = (items: any[], totalValue: number) => {
  if (typeof window === "undefined") return;

  // Google Analytics BeginCheckout event
  if (window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "BRL",
      value: totalValue,
      items: items.map((item) => ({
        item_id: item.pecaId,
        item_name: item.nomePeca,
        price: item.precoUnitario,
        quantity: item.quantidade,
        item_variant: `${item.cor} - ${item.tamanho}`,
      })),
    });
  }

  // Meta Pixel InitiateCheckout event
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_ids: items.map((item) => item.pecaId),
      content_type: "product",
      value: totalValue,
      currency: "BRL",
    });
  }
};

export const trackPurchaseEvent = (orderId: string, items: any[], totalValue: number) => {
  if (typeof window === "undefined") return;

  // Google Analytics Purchase event
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: orderId,
      currency: "BRL",
      value: totalValue,
      items: items.map((item) => ({
        item_id: item.pecaId,
        item_name: item.nomePeca,
        price: item.precoUnitario,
        quantity: item.quantidade,
        item_variant: `${item.cor} - ${item.tamanho}`,
      })),
    });
  }

  // Meta Pixel Purchase event
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      content_ids: items.map((item) => item.pecaId),
      content_type: "product",
      value: totalValue,
      currency: "BRL",
    });
  }
};
