// Lightweight Google Analytics 4 helper.
// Reads VITE_GA_MEASUREMENT_ID from env. If not set, becomes a no-op
// so the app keeps working in dev / hackathon demos without extra config.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
let initialized = false;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const initAnalytics = () => {
  if (initialized || !GA_ID || typeof window === "undefined") return;
  initialized = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
};

export const trackPageview = (path: string, title?: string) => {
  if (!GA_ID) return;
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
  });
};

export const trackEvent = (
  name: string,
  params: Record<string, string | number | boolean> = {},
) => {
  if (!GA_ID) return;
  window.gtag?.("event", name, params);
};
