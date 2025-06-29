import { useState, useCallback } from 'react';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOperationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for handling async operations with consistent error handling and loading states
 */
export function useAsyncOperation<T = any>(
  options?: UseAsyncOperationOptions
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await asyncFunction();
        setState({ data: result, loading: false, error: null });
        options?.onSuccess?.();
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, loading: false, error: errorObj }));
        options?.onError?.(errorObj);
        console.error('Async operation failed:', errorObj);
        throw errorObj;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.data && !state.error,
  };
}