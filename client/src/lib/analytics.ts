declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Standard gtag function implementation
function gtag(...args: any[]) {
  window.dataLayer = window.dataLayer || [];
  // Using spread operator to properly handle arguments
  window.dataLayer.push(args);
}

// Assign gtag to window to ensure it's globally available
window.gtag = window.gtag || function(...args: any[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
};

export function initializeAnalytics(measurementId: string) {
  if (!measurementId) {
    console.error('Google Analytics Measurement ID is missing');
    return;
  }
  
  console.log('Initializing Google Analytics with ID:', measurementId);
  
  // Add the Google Analytics script tag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Standard GA4 initialization code exactly as prescribed by Google
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]){
    window.dataLayer.push(args);
  }
  window.gtag = gtag as any;
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    debug_mode: true // Enable debug mode to help diagnose issues
  });
  
  // Also send an immediate page view event to verify tracking
  setTimeout(() => {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      send_to: measurementId
    });
    console.log('Initial page view sent directly to GA');
  }, 1000);
  
  console.log('Google Analytics initialization complete');
}

// Track custom events
export function trackEvent(eventName: string, parameters?: { [key: string]: any }) {
  if (!window.gtag) {
    console.warn('Google Analytics not initialized: trackEvent failed');
    return;
  }
  console.log('Tracking event:', eventName, parameters);
  window.gtag('event', eventName, parameters);
}

// Track page views
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (!window.gtag) {
    console.warn('Google Analytics not initialized: trackPageView failed');
    return;
  }
  console.log('Tracking page view:', pagePath, pageTitle);
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href
  });
}

// Track product views
export function trackProductView(product: {
  id: number;
  name: string;
  category: string;
}) {
  if (!window.gtag) {
    console.warn('Google Analytics not initialized: trackProductView failed');
    return;
  }
  console.log('Tracking product view:', product);
  window.gtag('event', 'view_item', {
    items: [{
      item_id: product.id.toString(),
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
  if (!window.gtag) {
    console.warn('Google Analytics not initialized: trackWhatsAppInquiry failed');
    return;
  }
  console.log('Tracking WhatsApp inquiry:', product);
  window.gtag('event', 'whatsapp_inquiry', {
    item_id: product.id.toString(),
    item_name: product.name,
    item_category: product.category
  });
}

// Track social media clicks
export function trackSocialClick(platform: string) {
  if (!window.gtag) {
    console.warn('Google Analytics not initialized: trackSocialClick failed');
    return;
  }
  console.log('Tracking social click:', platform);
  window.gtag('event', 'social_click', {
    platform: platform
  });
}

// Track category filter usage
export function trackCategoryFilter(category: string) {
  if (!window.gtag) {
    console.warn('Google Analytics not initialized: trackCategoryFilter failed');
    return;
  }
  console.log('Tracking category filter:', category);
  window.gtag('event', 'filter_selection', {
    filter_type: 'category',
    filter_value: category
  });
}

// Track errors
export function trackError(errorType: string, errorMessage: string) {
  if (!window.gtag) {
    console.warn('Google Analytics not initialized: trackError failed');
    return;
  }
  console.log('Tracking error:', errorType, errorMessage);
  window.gtag('event', 'application_error', {
    error_type: errorType,
    error_message: errorMessage
  });
}
