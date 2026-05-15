import type { Severity } from '../types';

const styles: Record<Severity, string> = {
  CRITICAL: 'bg-red-500/15 text-red-400 border border-red-500/30',
  HIGH:     'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  MEDIUM:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  LOW:      'bg-green-500/15 text-green-400 border border-green-500/30',
  UNKNOWN:  'bg-slate-500/15 text-slate-400 border border-slate-500/30',
};

export function SeverityBadge({ severity, score }: { severity: Severity; score?: number }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${styles[severity]}`}>
      {severity}
      {score !== undefined && (
        <span className="opacity-70 font-mono">{score.toFixed(1)}</span>
      )}
    </span>
  );
}
