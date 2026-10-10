import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackVirtualPageView, resetListSignature } from '../../analytics/dataLayer.js';

export default function RouteTracker() {
  const { pathname } = useLocation();
  const lastPath = useRef(null);

  useEffect(() => {
    if (lastPath.current === null) { lastPath.current = pathname; return; } // first load: Google tag sends it
    if (lastPath.current === pathname) return; // blocks the StrictMode double-run
    lastPath.current = pathname;
    resetListSignature();
    trackVirtualPageView({ path: pathname });
  }, [pathname]);

  return null;
}