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
    ttq?: any;
    TiktokAnalyticsObject?: string;
  }
}

export default function AnalyticsScripts() {
  const { configuracoes } = useStore();
  const pathname = usePathname();

  const gaId = configuracoes.googleAnalyticsId;
  const pixelId = configuracoes.metaPixelId;
  const adsId = configuracoes.googleAdsId;
  const tiktokPixelId = configuracoes.tiktokPixelId;

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

    // 4. TikTok Pixel PageView on route change
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.page();
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

      {/* TikTok Pixel Script — carregado apenas quando o Pixel ID estiver configurado */}
      {tiktokPixelId && (
        <Script
          id="tiktok-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(w,d,t){
                w.TiktokAnalyticsObject=t;
                var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){
                  var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
                  ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
                  n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;
                  e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)
                };
                ttq.load('${tiktokPixelId}');
                ttq.page();
              }(window,document,'ttq');
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

  // TikTok Pixel AddToCart event
  if (window.ttq) {
    window.ttq.track("AddToCart", {
      content_name: item.name,
      content_id: item.id,
      content_type: "product",
      value: item.price * item.quantity,
      currency: "BRL",
      quantity: item.quantity,
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

  // TikTok Pixel InitiateCheckout event
  if (window.ttq) {
    window.ttq.track("InitiateCheckout", {
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

  // TikTok Pixel Purchase event
  if (window.ttq) {
    window.ttq.track("CompletePayment", {
      content_ids: items.map((item) => item.pecaId),
      content_type: "product",
      value: totalValue,
      currency: "BRL",
      order_id: orderId,
    });
  }
};
