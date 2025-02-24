import { isApiDetailedError } from '@/api/api';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useError = (error: unknown) => {
  useEffect(() => {
    if (!error) {
      return;
    }

    if (isApiDetailedError(error)) {
      toast.error(
        error.response?.data.detail ?? 'An unexpected error occurred'
      );
    } else {
      toast.error('An unexpected error occurred');
    }
  }, [error]);
};
