import { useQuery } from '@tanstack/react-query';
import { fetchNVDForWindow } from '../lib/nvd';
import type { TimeWindow } from '../types';

export function useNVDCatalog(window: TimeWindow) {
  return useQuery({
    queryKey: ['nvd-catalog', window],
    queryFn: () => fetchNVDForWindow(window),
    staleTime: 4 * 60 * 60 * 1000,
    retry: 1,
  });
}
