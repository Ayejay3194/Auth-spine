'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../providers/AppContext';

interface UsePageStateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoRefetch?: boolean;
  refetchInterval?: number;
}

interface UsePageStateResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

export function usePageState<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = [],
  options: UsePageStateOptions<T> = {}
): UsePageStateResult<T> {
  const { addNotification } = useAppContext();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { onSuccess, onError, autoRefetch = false, refetchInterval } = options;
  const mountedRef = useRef(true);

  const executeFetch = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      
      if (!mountedRef.current) return;
      
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      if (!mountedRef.current) return;
      
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      
      // Show error notification
      addNotification(error.message, 'error');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, onSuccess, onError, addNotification]);

  const refetch = useCallback(async () => {
    await executeFetch();
  }, [executeFetch]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  // Initial fetch
  useEffect(() => {
    executeFetch();
  }, deps);

  // Auto refetch
  useEffect(() => {
    if (!autoRefetch || !refetchInterval) return;

    const interval = setInterval(refetch, refetchInterval);
    return () => clearInterval(interval);
  }, [autoRefetch, refetchInterval, refetch]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  };
}
