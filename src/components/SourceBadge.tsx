import type { Source } from '../types';

const styles: Record<Source, string> = {
  KEV: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  NVD: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  OSV: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
};

export function SourceBadge({ source }: { source: Source }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${styles[source]}`}>
      {source}
    </span>
  );
}
