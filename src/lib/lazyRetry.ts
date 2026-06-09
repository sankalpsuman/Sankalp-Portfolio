import React from 'react';

/**
 * A robust wrapper for lazy loading components with automatic retry mechanism.
 * Handles transient network failures and chunk hash changes smoothly.
 */
export function lazyRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retriesLeft = 2,
  interval = 1000
): Promise<{ default: T }> {
  return new Promise((resolve, reject) => {
    componentImport()
      .then(resolve)
      .catch((error) => {
        console.warn(`Dynamic import failed. Retries left: ${retriesLeft}. Error:`, error);
        
        if (retriesLeft <= 0) {
          // If all retries failed, attempt a page reload to pull down the latest index.html with fresh hashes
          const lastReload = sessionStorage.getItem('last-chunk-error-reload');
          const now = Date.now();
          
          // Only reload if we haven't reloaded in the last 10 seconds to prevent infinite reload loops
          if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
            sessionStorage.setItem('last-chunk-error-reload', String(now));
            console.error('All retries for importing module script failed. Reloading page...');
            window.location.reload();
          } else {
            reject(error);
          }
          return;
        }
        
        setTimeout(() => {
          lazyRetry(componentImport, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
}
