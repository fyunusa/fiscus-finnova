'use client';

import { apiClient } from '@/lib/api-client';
import { useMemo } from 'react';

/**
 * Hook to get the API client instance in React components
 * Returns the same apiClient instance throughout the app lifecycle
 */
export function useApiClient() {
  return useMemo(() => apiClient, []);
}
