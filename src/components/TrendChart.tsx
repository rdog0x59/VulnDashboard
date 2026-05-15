import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import type { TrendPoint, ChartAnnotation } from '../types';

const SOURCES = [
  { key: 'kev' as const, label: 'CISA KEV', color: '#f59e0b', fill: '#f59e0b' },
  { key: 'nvd' as const, label: 'NVD CVEs', color: '#3b82f6', fill: '#3b82f6' },
  { key: 'osv' as const, label: 'OSV', color: '#10b981', fill: '#10b981' },
];

interface Props {
  data: TrendPoint[];
  isLoadingKEV: boolean;
  isLoadingNVD: boolean;
  hasOSV: boolean;
  annotations?: ChartAnnotation[];
  errorKEV?: string;
  errorNVD?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, annotations }: any) {
  if (!active || !payload?.length) return null;
  const holidayNote = (annotations as ChartAnnotation[] | undefined)?.find(
    a => a.x1 === label || a.x2 === label
  );
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-lg p-3 shadow-xl text-xs max-w-[260px]">
      <p className="text-slate-300 font-medium mb-2">{label}</p>
      {payload.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-mono">{entry.value.toLocaleString()}</span>
          </div>
        )
      )}
      {holidayNote && (
        <p className="mt-2 pt-2 border-t border-navy-600 text-amber-400 leading-snug">
          {holidayNote.description}
        </p>
      )}
    </div>
  );
}

export function TrendChart({ data, isLoadingKEV, isLoadingNVD, hasOSV, annotations = [], errorKEV, errorNVD }: Props) {
  const [hidden, setHidden] = useState<Set<string>>(new Set(['osv']));

  const visibleSources = SOURCES.filter((s) => {
    if (s.key === 'osv' && !hasOSV) return false;
    return true;
  });

  const toggleSource = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isLoading = isLoadingKEV || isLoadingNVD;

  return (
    <div className="rounded-xl border border-navy-600 bg-navy-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold">Vulnerability Trends</h2>
          <p className="text-slate-500 text-xs mt-0.5">New vulnerabilities added per period</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {visibleSources.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSource(s.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                hidden.has(s.key)
                  ? 'border-navy-600 text-slate-600 bg-transparent'
                  : 'border-transparent text-slate-300'
              }`}
              style={
                hidden.has(s.key)
                  ? {}
                  : { backgroundColor: `${s.color}20`, borderColor: `${s.color}40`, color: s.color }
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: hidden.has(s.key) ? '#4b5563' : s.color }}
              />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {errorKEV && (
        <p className="text-amber-400 text-xs mb-2">
          KEV data unavailable: {errorKEV}
        </p>
      )}
      {errorNVD && (
        <p className="text-blue-400 text-xs mb-2">
          NVD data unavailable: {errorNVD}
        </p>
      )}

      <div className="relative h-64">
        {isLoading && data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
            <span className="ml-2 text-slate-500 text-sm">Loading trend data…</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                {SOURCES.map((s) => (
                  <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#1e3a5f' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <Tooltip content={<CustomTooltip annotations={annotations} />} />
              <Legend
                wrapperStyle={{ display: 'none' }}
              />
              {annotations.map((a, i) => (
                <ReferenceArea
                  key={i}
                  x1={a.x1}
                  x2={a.x2}
                  fill="#f59e0b"
                  fillOpacity={0.15}
                  stroke="#f59e0b"
                  strokeOpacity={0.45}
                  label={{ value: 'Holiday ↓', position: 'insideTop', fill: '#f59e0b', fontSize: 10 }}
                />
              ))}
              {visibleSources.map((s) =>
                hidden.has(s.key) ? null : (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    fill={`url(#grad-${s.key})`}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: s.color }}
                  />
                )
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
        {isLoading && data.length > 0 && (
          <div className="absolute top-2 right-2">
            <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
