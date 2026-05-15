import { useQuery } from '@tanstack/react-query';
import { searchOSV } from '../lib/osv';
import type { Vulnerability } from '../types';

export function useOSVSearch(
  packageName: string,
  ecosystem: string,
  enabled: boolean
): { data: Vulnerability[] | undefined; isLoading: boolean; isError: boolean; error: Error | null } {
  return useQuery({
    queryKey: ['osv', ecosystem, packageName],
    queryFn: () => searchOSV(packageName, ecosystem as Parameters<typeof searchOSV>[1]),
    enabled: enabled && packageName.trim().length > 0,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}
