import { useQuery } from '@tanstack/react-query';
import { fetchKEV } from '../lib/kev';
import { generateBuckets, bucketVulns, windowStartDate } from '../lib/utils';
import type { TimeWindow } from '../types';
import { isAfter } from 'date-fns';

export function useKEV(window: TimeWindow) {
  return useQuery({
    queryKey: ['kev'],
    queryFn: fetchKEV,
    staleTime: 6 * 60 * 60 * 1000,
    retry: 2,
    select: (data) => {
      const start = windowStartDate(window);
      const filtered = data.filter((v) => isAfter(v.publishedDate, start));
      const buckets = generateBuckets(window);
      const dates = filtered.map((v) => v.publishedDate);
      const counts = bucketVulns(dates, buckets);
      return { all: data, filtered, buckets, counts };
    },
  });
}
