import { useState, useEffect } from 'react';

interface MediaQueryOptions {
  minWidth?: number;
  maxWidth?: number;
}

export function useMediaQuery(options: MediaQueryOptions): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    let query = '';

    if (options.minWidth) {
      query = `(min-width: ${options.minWidth}px)`;
    } else if (options.maxWidth) {
      query = `(max-width: ${options.maxWidth}px)`;
    }

    if (!query) return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [options.minWidth, options.maxWidth]);

  return matches;
}
