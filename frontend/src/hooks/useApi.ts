import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<{ data: ApiResponse<T> }>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data } = await apiCall();
      if (data.IsSuccess) {
        setState({ data: data.Data, loading: false, error: null });
        return data.Data;
      } else {
        setState({ data: null, loading: false, error: data.Message });
        throw new Error(data.Message);
      }
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.Message || err.message
          : err instanceof Error
            ? err.message
            : 'An error occurred';
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  }, []);

  return { ...state, execute };
}
