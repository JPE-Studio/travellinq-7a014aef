
import { useState, useEffect } from 'react';

/**
 * Custom hook that returns whether the current viewport matches the provided media query
 * @param query The media query to match against, e.g. "(max-width: 768px)"
 * @returns Boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      // Set initial value
      setMatches(media.matches);

      // Set up listener for changes
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add the listener
      media.addEventListener('change', listener);

      // Clean up
      return () => {
        media.removeEventListener('change', listener);
      };
    }
    
    return undefined;
  }, [query]);

  return matches;
};
