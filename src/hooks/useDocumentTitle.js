import { useEffect } from 'react';

const BRAND_NAME = 'Atelier Nord';

/**
 * Shared hook to set a unique, meaningful document.title on every page
 * @param {string} title
 * @param {boolean} [includeBrand=true]
 */
export function useDocumentTitle(title, includeBrand = true) {
  useEffect(() => {
    if (!title) {
      document.title = `${BRAND_NAME} — Contemporary Scandinavian Fashion`;
    } else if (includeBrand) {
      document.title = `${title} | ${BRAND_NAME}`;
    } else {
      document.title = title;
    }
  }, [title, includeBrand]);
}

export default useDocumentTitle;

