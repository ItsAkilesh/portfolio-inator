// Simple Google Analytics helper
export const GA_TRACKING_ID = 'G-DDW4JPG9S7';

// Send a pageview to GA and Clarity (if loaded)
export const pageview = (path) => {
  if (typeof window === 'undefined') return;

  // Track pageview in Google Analytics
  if (window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: path,
    });
  }

  // Track pageview in Microsoft Clarity
  if (window.clarity) {
    window.clarity('set', 'page', path);
  }
};

// Send an event to GA
export const event = ({ action, category, label, value }) => {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
