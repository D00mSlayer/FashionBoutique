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

// Track WhatsApp inquiries
export function trackWhatsAppInquiry(product: {
  id: number;
  name: string;
  category: string;
}) {
  gtag('event', 'whatsapp_inquiry', {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category
  });
}

// Track social media clicks
export function trackSocialClick(platform: string) {
  gtag('event', 'social_click', {
    platform: platform
  });
}

// Track category filter usage
export function trackCategoryFilter(category: string) {
  gtag('event', 'filter_selection', {
    filter_type: 'category',
    filter_value: category
  });
}

// Track errors
export function trackError(errorType: string, errorMessage: string) {
  gtag('event', 'application_error', {
    error_type: errorType,
    error_message: errorMessage
  });
}
