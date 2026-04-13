import { useState, useEffect } from 'react';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: any[] = []
): UseAsyncState<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState(prev => ({ ...prev, loading: true, error: null }));

    fn()
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error?.message || 'An error occurred',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}

export function useMutation<TData, TVariables>(
  fn: (variables: TVariables) => Promise<TData>
) {
  const [state, setState] = useState<UseAsyncState<TData> & { isSubmitting: boolean }>({
    data: null,
    loading: false,
    error: null,
    isSubmitting: false,
  });

  const mutate = async (variables: TVariables) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const data = await fn(variables);
      setState(prev => ({ ...prev, data, isSubmitting: false }));
      return data;
    } catch (error) {
      const errorMessage = (error as any)?.message || 'An error occurred';
      setState(prev => ({ ...prev, error: errorMessage, isSubmitting: false }));
      throw error;
    }
  };

  return { ...state, mutate };
}
