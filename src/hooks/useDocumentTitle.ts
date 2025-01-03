import { useEffect, useRef } from 'react';

export function useDocumentTitle(title: string, fallbackTitle: string) {
  const originalTitle = useRef<string | null>(null);

  useEffect(() => {
    // Check if document is defined (client-side)
    if (typeof document !== 'undefined') {
      originalTitle.current = document.title;
      document.title = title;
    }

    return () => {
      if (typeof document !== 'undefined' && originalTitle.current) {
        document.title = originalTitle.current;
      }
    };
  }, [title]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined') {
        document.title = document.hidden ? 'Come back 🥺' : fallbackTitle;
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
        if (originalTitle.current) {
          document.title = originalTitle.current;
        }
      }
    };
  }, [fallbackTitle]);
}
