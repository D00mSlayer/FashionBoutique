declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize dataLayer array if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Basic GTM/GA4 function
function gtag(...args: any[]) {
  window.dataLayer.push(args);
}

export function initializeAnalytics(measurementId: string) {
  // Add Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize GA4
  gtag('js', new Date());
  gtag('config', measurementId);
}

// Track custom events
export function trackEvent(eventName: string, parameters?: { [key: string]: any }) {
  gtag('event', eventName, parameters);
}

// Track page views
export function trackPageView(pagePath: string, pageTitle?: string) {
  gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle
  });
}

// Track product views
export function trackProductView(product: {
  id: number;
  name: string;
  category: string;
}) {
  gtag('event', 'view_item', {
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category
    }]
  });
}
