// Simple Google Analytics helper
export const GA_TRACKING_ID = 'G-DDW4JPG9S7';

// Send a pageview to GA (if gtag is loaded)
export const pageview = (path) => {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: path,
    });
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
