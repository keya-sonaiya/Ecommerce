import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackVirtualPageView, resetListSignature } from '../../analytics/dataLayer.js';

export default function RouteTracker() {
  const { pathname } = useLocation();
  const lastPath = useRef(null);

  useEffect(() => {
    if (lastPath.current === null) { lastPath.current = pathname; return; } // first load: Google tag sends it
    if (lastPath.current === pathname) return;                              // blocks StrictMode double-run
    lastPath.current = pathname;
    resetListSignature();
    const t = setTimeout(() => trackVirtualPageView({ path: pathname }), 0); // wait for new page title
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
