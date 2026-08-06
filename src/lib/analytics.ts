/**
 * GA4 (gtag.js) — inicialização + rastreamento automático de CTAs.
 *
 * O ID de medição pode vir de:
 *  1. VITE_GA_MEASUREMENT_ID (build)
 *  2. VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY (conector)
 *  3. window.__GA_MEASUREMENT_ID (definido no index.html do build estático)
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    __GA_MEASUREMENT_ID?: string;
  }
}

const env = import.meta.env as Record<string, string | undefined>;

export const GA_MEASUREMENT_ID =
  env["VITE_GA_MEASUREMENT_ID"] ||
  env["VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY"] ||
  (typeof window !== "undefined" ? window.__GA_MEASUREMENT_ID : undefined) ||
  "";

export function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  gtag("event", name, params);
}

let initialized = false;

function classifyAnchor(a: HTMLAnchorElement) {
  const href = a.getAttribute("href") || "";
  const label = (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 90);

  if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
    return { name: "whatsapp_click", params: { link_url: href, cta_label: label } };
  }
  if (href.startsWith("mailto:")) {
    return { name: "email_click", params: { link_url: href, cta_label: label } };
  }
  if (href.startsWith("tel:")) {
    return { name: "phone_click", params: { link_url: href, cta_label: label } };
  }
  if (/\.pdf($|\?)/i.test(href) || href.includes("/catalogos/")) {
    const file = decodeURIComponent(href.split("/").pop() || href);
    return { name: "catalog_download", params: { file_name: file, cta_label: label } };
  }
  if (href.startsWith("#")) {
    return { name: "cta_click", params: { cta_target: href, cta_label: label } };
  }
  if (/^https?:\/\//i.test(href)) {
    return { name: "outbound_click", params: { link_url: href, cta_label: label } };
  }
  return null;
}

/** Delegação global de cliques: WhatsApp, e-mail, catálogos, CTAs internos. */
function attachClickTracking() {
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (anchor) {
        const hit = classifyAnchor(anchor);
        if (hit) trackEvent(hit.name, hit.params);
        return;
      }
      const button = target?.closest?.("button[data-ga-event]") as HTMLElement | null;
      if (button) {
        trackEvent(button.dataset["gaEvent"]!, {
          cta_label: (button.getAttribute("aria-label") || button.textContent || "").trim(),
        });
      }
    },
    { capture: true },
  );
}

export function initAnalytics() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  attachClickTracking();

  if (!GA_MEASUREMENT_ID) {
    // Sem ID configurado: os eventos ficam apenas na dataLayer (nenhuma requisição).
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: true });
}

export function trackPageView(path: string) {
  if (!GA_MEASUREMENT_ID) return;
  trackEvent("page_view", { page_path: path, page_location: window.location.href });
}
