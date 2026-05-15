import { useQuery } from '@tanstack/react-query';
import { fetchNVDTrendCounts, fetchNVDForWindow } from '../lib/nvd';
import type { TimeWindow } from '../types';

export function useNVDTrend(window: TimeWindow) {
  return useQuery({
    queryKey: ['nvd-trend', window],
    queryFn: () => fetchNVDTrendCounts(window),
    staleTime: 4 * 60 * 60 * 1000,
    retry: 1,
  });
}

export function useNVDCatalog(window: TimeWindow) {
  return useQuery({
    queryKey: ['nvd-catalog', window],
    queryFn: () => fetchNVDForWindow(window),
    staleTime: 4 * 60 * 60 * 1000,
    retry: 1,
  });
}
