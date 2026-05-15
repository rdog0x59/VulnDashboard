import { useEffect } from 'react';
import { X, ExternalLink, Flame, ShieldAlert, Calendar, AlertTriangle, Package, Building2, Info } from 'lucide-react';
import { format } from 'date-fns';
import type { Vulnerability } from '../types';
import { SourceBadge } from './SourceBadge';
import { SeverityBadge } from './SeverityBadge';
import { severityColor } from '../lib/utils';

interface Props {
  vuln: Vulnerability | null;
  onClose: () => void;
}

function MetaRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-navy-700 last:border-0">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <div className="text-sm text-slate-200 break-words">{value}</div>
      </div>
    </div>
  );
}

function CvssGauge({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = severityColor(
    score >= 9 ? 'CRITICAL' : score >= 7 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW'
  );
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">CVSS Base Score</span>
        <span className="text-lg font-mono font-semibold" style={{ color }}>{score.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>0</span><span>5</span><span>10</span>
      </div>
    </div>
  );
}

export function VulnDetail({ vuln, onClose }: Props) {
  useEffect(() => {
    if (!vuln) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [vuln, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = vuln ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [vuln]);

  const isOpen = !!vuln;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-navy-900 border-l border-navy-600
          z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {!vuln ? null : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-navy-700 flex-shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <SourceBadge source={vuln.source} />
                  <SeverityBadge severity={vuln.severity} score={vuln.cvssScore} />
                  {vuln.ransomwareUse && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                      <Flame className="w-3 h-3" /> Ransomware
                    </span>
                  )}
                  {vuln.isExploited && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/30">
                      <ShieldAlert className="w-3 h-3" /> Actively Exploited
                    </span>
                  )}
                </div>
                <h2 className="font-mono text-base font-semibold text-white leading-tight">{vuln.id}</h2>
                {vuln.title !== vuln.id && (
                  <p className="text-sm text-slate-400 mt-1 leading-snug">{vuln.title}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-navy-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* CVSS gauge */}
              {vuln.cvssScore !== undefined && (
                <div className="rounded-lg bg-navy-800 border border-navy-700 p-4">
                  <CvssGauge score={vuln.cvssScore} />
                </div>
              )}

              {/* Description */}
              {vuln.description && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-slate-500" />
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{vuln.description}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="rounded-lg bg-navy-800 border border-navy-700 px-4 divide-y divide-navy-700">
                {vuln.vendor && (
                  <MetaRow icon={Building2} label="Vendor" value={vuln.vendor} />
                )}
                {vuln.product && (
                  <MetaRow icon={Package} label="Product" value={vuln.product} />
                )}
                <MetaRow
                  icon={Calendar}
                  label="Published"
                  value={
                    <span className="font-mono">
                      {format(new Date(vuln.publishedDate), 'PPP')}
                    </span>
                  }
                />
                {vuln.dueDate && (
                  <MetaRow
                    icon={AlertTriangle}
                    label="CISA Remediation Due"
                    value={
                      <span className="font-mono text-amber-400">
                        {format(new Date(vuln.dueDate), 'PPP')}
                      </span>
                    }
                  />
                )}
                {vuln.ecosystem && (
                  <MetaRow icon={Package} label="Ecosystem" value={vuln.ecosystem} />
                )}
              </div>

              {/* Required action (KEV) */}
              {vuln.requiredAction && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                  <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
                    Required Action
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">{vuln.requiredAction}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-navy-700 flex-shrink-0">
              {vuln.url ? (
                <a
                  href={vuln.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg
                    bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on {vuln.source === 'KEV' ? 'CISA' : vuln.source === 'NVD' ? 'NVD' : 'OSV'}
                </a>
              ) : (
                <p className="text-center text-xs text-slate-600">No external reference available</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
