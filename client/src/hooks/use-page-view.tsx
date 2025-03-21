import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/analytics';

/**
 * Custom hook to track page views in Google Analytics.
 * Automatically tracks page views when the location changes.
 * 
 * @param pageTitle Optional page title to include in the tracking event
 */
export function usePageView(pageTitle?: string) {
  const [location] = useLocation();
  const prevLocation = useRef(location);

  useEffect(() => {
    // Only track if the location has changed and if it's not the first render
    if (location !== prevLocation.current) {
      trackPageView(location, pageTitle);
      prevLocation.current = location;
    }
  }, [location, pageTitle]);

  // Track initial page view
  useEffect(() => {
    trackPageView(location, pageTitle);
  }, []);
}