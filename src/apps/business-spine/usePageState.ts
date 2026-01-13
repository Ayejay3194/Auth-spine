import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/src/providers/AppContext';

export interface PageStateOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data: unknown) => void;
}

export function usePageState<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = [],
  options: PageStateOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { addNotification } = useAppContext();

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      addNotification(error.message, 'error');
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, options, addNotification]);

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
}
